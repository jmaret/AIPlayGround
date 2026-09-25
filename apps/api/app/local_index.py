from threading import Lock

from app.corpus import load_vector_cards
from app.providers.hashed import DIM, cosine_distance, hashed_ngram_embed


class LocalVectorIndex:
    """In-memory nearest-neighbor index. Built from bundled example cards. No disk. No Ollama."""

    name = "hashed_tokens"
    dim = DIM

    def __init__(self) -> None:
        self._lock = Lock()
        self.chunks: list[dict[str, str]] = []
        self.vectors: list[list[float]] = []
        self.ready = False

    def bootstrap(self) -> None:
        chunks = load_vector_cards()
        vectors = [hashed_ngram_embed(chunk["text"]) for chunk in chunks]
        with self._lock:
            self.chunks = chunks
            self.vectors = vectors
            self.ready = bool(chunks)

    def preview(self, limit: int = 12) -> list[dict[str, str]]:
        return self.chunks[:limit]

    def query(self, text: str, k: int = 4) -> dict[str, object]:
        if not self.ready:
            raise RuntimeError("index_unavailable")
        query_vec = hashed_ngram_embed(text)
        scored: list[dict[str, object]] = []
        with self._lock:
            pairs = zip(self.chunks, self.vectors)
        for chunk, vector in pairs:
            scored.append(
                {
                    "id": chunk["id"],
                    "source": chunk["source"],
                    "text": chunk["text"],
                    "distance": round(cosine_distance(query_vec, vector), 4),
                }
            )
        scored.sort(key=lambda item: float(item["distance"]))
        return {
            "query": text,
            "embedder": self.name,
            "dim": self.dim,
            "query_vector": [round(value, 3) for value in query_vec[:12]],
            "neighbors": scored[:k],
        }


local_index = LocalVectorIndex()
