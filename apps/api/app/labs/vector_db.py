from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.local_index import local_index

router = APIRouter(prefix="/labs/vector-db", tags=["vector-db"])


class QueryBody(BaseModel):
    query: str = Field(min_length=2, max_length=500)
    k: int = Field(default=4, ge=1, le=8)


@router.get("/preview")
def preview() -> dict[str, object]:
    if not local_index.ready:
        local_index.bootstrap()
    return {
        "ready": local_index.ready,
        "chunk_count": len(local_index.chunks),
        "embedder": local_index.name,
        "dim": local_index.dim,
        "chunks": local_index.preview(),
        "needs_ollama": False,
    }


@router.post("/query")
def query(body: QueryBody) -> dict[str, object]:
    if not local_index.ready:
        local_index.bootstrap()
    try:
        return local_index.query(body.query, body.k)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
