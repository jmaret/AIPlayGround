from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.providers.ollama import OllamaError, OllamaProvider
from app.store import store

router = APIRouter(prefix="/labs/vector-db", tags=["vector-db"])
provider = OllamaProvider()


class QueryBody(BaseModel):
    query: str = Field(min_length=2, max_length=500)
    k: int = Field(default=4, ge=1, le=8)


@router.get("/preview")
def preview() -> dict[str, object]:
    return {
        "ready": store.ready,
        "chunk_count": store.chunk_count,
        "chunks": store.preview(),
    }


@router.post("/query")
def query(body: QueryBody) -> dict[str, object]:
    try:
        neighbors = store.query(provider, body.query, body.k)
    except OllamaError as exc:
        raise HTTPException(status_code=503, detail="ollama_unavailable") from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"query": body.query, "neighbors": neighbors}
