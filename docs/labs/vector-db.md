# Vector DB lab

**Route:** `/labs/vector-db`  
**API:** `GET /labs/vector-db/preview`, `POST /labs/vector-db/query`

## What you are learning

Text is split into chunks, each chunk becomes a vector (via Ollama `nomic-embed-text`), and similar meaning sits nearby in that space. Chroma holds the vectors in memory only.

## What you see

- Corpus chunks already indexed at API startup
- A query box
- Nearest neighbors with distances (lower is closer)

## Flow

1. Bundled files in `data/corpus/` are chunked (~400 characters, 80 overlap).
2. Each chunk is embedded and upserted into ephemeral Chroma.
3. Your query is embedded the same way and compared.

Nothing you type is written to disk.
