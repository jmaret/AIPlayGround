from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CORPUS_DIR = ROOT / "data" / "corpus"
EXAMPLES_DIR = ROOT / "data" / "examples"
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


def load_vector_cards() -> list[dict[str, str]]:
    """Short labeled cards for the Vector DB lab. One idea per vector."""
    path = EXAMPLES_DIR / "vector-cards.md"
    items: list[dict[str, str]] = []
    current_id = ""
    current_lines: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("## "):
            if current_id and current_lines:
                items.append(
                    {
                        "id": current_id,
                        "source": current_id,
                        "text": " ".join(current_lines).strip(),
                    }
                )
            current_id = line[3:].strip()
            current_lines = []
        elif line.strip():
            current_lines.append(line.strip())
    if current_id and current_lines:
        items.append(
            {
                "id": current_id,
                "source": current_id,
                "text": " ".join(current_lines).strip(),
            }
        )
    return items


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
