from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CORPUS_DIR = ROOT / "data" / "corpus"
CHUNK_SIZE = 420
CHUNK_OVERLAP = 80


def load_documents() -> list[dict[str, str]]:
    documents: list[dict[str, str]] = []
    for path in sorted(CORPUS_DIR.glob("*.md")):
        documents.append({"source": path.name, "text": path.read_text(encoding="utf-8")})
    return documents


def chunk_text(text: str) -> list[str]:
    cleaned = " ".join(text.split())
    chunks: list[str] = []
    start = 0
    while start < len(cleaned):
        end = min(start + CHUNK_SIZE, len(cleaned))
        chunk = cleaned[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end == len(cleaned):
            break
        start = end - CHUNK_OVERLAP
    return chunks


def load_chunks() -> list[dict[str, str]]:
    items: list[dict[str, str]] = []
    for document in load_documents():
        for index, chunk in enumerate(chunk_text(document["text"])):
            items.append(
                {
                    "id": f"{document['source']}-{index}",
                    "source": document["source"],
                    "text": chunk,
                }
            )
    return items
