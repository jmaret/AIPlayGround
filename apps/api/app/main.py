import logging
import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.labs import langgraph_lab, rag, vector_db
from app.logutil import AccessLogMiddleware, configure_logging
from app.local_index import local_index
from app.providers.ollama import OllamaProvider
from app.store import store

configure_logging()
logger = logging.getLogger(__name__)

app = FastAPI(title="Playground API", version="1.0.0")
provider = OllamaProvider()
_rate_hits: dict[str, deque[float]] = defaultdict(deque)
_rate_lock = Lock()


app.add_middleware(AccessLogMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    # Peer address is still 127.0.0.1 / ::1 even when the URL is localhost.
    if request.client and request.client.host not in {"127.0.0.1", "localhost", "::1"}:
        return JSONResponse({"detail": "localhost_only"}, status_code=403)
    if not _allow(request.client.host if request.client else "unknown"):
        return JSONResponse({"detail": "rate_limited"}, status_code=429)
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Cache-Control"] = "no-store"
    return response


def _allow(host: str) -> bool:
    now = time.time()
    with _rate_lock:
        bucket = _rate_hits[host]
        while bucket and now - bucket[0] > 60:
            bucket.popleft()
        if len(bucket) >= settings.rate_limit_per_minute:
            return False
        bucket.append(now)
        return True


@app.on_event("startup")
def startup() -> None:
    local_index.bootstrap()
    ping = provider.ping()
    if not ping.get("ok"):
        store.last_error = "ollama_unavailable"
        logger.info("startup ollama=down index=deferred")
        return
    missing = ping.get("missing_models") or []
    if missing:
        store.last_error = "missing_models"
        logger.info("startup missing_models=%s", ",".join(str(item) for item in missing))
        return
    try:
        store.bootstrap(provider)
    except Exception:
        store.last_error = "index_failed"
        logger.info("startup index=failed")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/ready")
def ready() -> dict[str, object]:
    ping = provider.ping()
    payload = {
        "ollama": ping,
        "local_vector_ready": local_index.ready,
        "local_vector_chunks": len(local_index.chunks),
        "index_ready": store.ready,
        "chunk_count": store.chunk_count,
        "index_error": store.last_error or None,
        "provider": provider.name,
    }
    if not ping.get("ok"):
        raise HTTPException(status_code=503, detail=payload)
    return payload


app.include_router(vector_db.router)
app.include_router(rag.router)
app.include_router(langgraph_lab.router)
