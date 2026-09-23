import logging
from threading import Lock

from app import config as _config  # noqa: F401  # telemetry env first

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.corpus import load_chunks
from app.providers.base import Provider

logger = logging.getLogger(__name__)


class VectorStore:
    def __init__(self) -> None:
        self._lock = Lock()
        self._client = chromadb.Client(
            ChromaSettings(is_persistent=False, anonymized_telemetry=False)
        )
        self._collection = self._client.get_or_create_collection(
            name="playground",
            metadata={"hnsw:space": "cosine"},
        )
        self.ready = False
        self.chunk_count = 0
        self.last_error = "not_indexed"

    def bootstrap(self, provider: Provider) -> None:
        chunks = load_chunks()
        if not chunks:
            self.last_error = "empty_corpus"
            return
        ids = [chunk["id"] for chunk in chunks]
        documents = [chunk["text"] for chunk in chunks]
        metadatas = [{"source": chunk["source"]} for chunk in chunks]
        embeddings = [provider.embed(chunk["text"]) for chunk in chunks]
        with self._lock:
            existing = self._collection.count()
            if existing:
                self._client.delete_collection("playground")
                self._collection = self._client.get_or_create_collection(
                    name="playground",
                    metadata={"hnsw:space": "cosine"},
                )
            self._collection.add(
                ids=ids,
                documents=documents,
                metadatas=metadatas,
                embeddings=embeddings,
            )
            self.chunk_count = len(chunks)
            self.ready = True
            self.last_error = ""
        logger.info("index_ready chunks=%s", self.chunk_count)

    def preview(self, limit: int = 12) -> list[dict[str, str]]:
        chunks = load_chunks()
        return chunks[:limit]

    def query(self, provider: Provider, text: str, k: int = 4) -> list[dict[str, object]]:
        if not self.ready:
            raise RuntimeError("index_unavailable")
        vector = provider.embed(text)
        result = self._collection.query(
            query_embeddings=[vector],
            n_results=min(k, max(self.chunk_count, 1)),
            include=["documents", "metadatas", "distances"],
        )
        neighbors: list[dict[str, object]] = []
        documents = result.get("documents") or [[]]
        metadatas = result.get("metadatas") or [[]]
        distances = result.get("distances") or [[]]
        ids = result.get("ids") or [[]]
        for index, doc in enumerate(documents[0]):
            meta = metadatas[0][index] if index < len(metadatas[0]) else {}
            neighbors.append(
                {
                    "id": ids[0][index] if index < len(ids[0]) else "",
                    "text": doc,
                    "source": meta.get("source", ""),
                    "distance": distances[0][index] if index < len(distances[0]) else None,
                }
            )
        return neighbors


store = VectorStore()
