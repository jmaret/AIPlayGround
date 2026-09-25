# Vector DB lab

**Route:** `/labs/vector-db`  
**API:** `GET /labs/vector-db/preview`, `POST /labs/vector-db/query`

This lab does **not** call Ollama. It is a working nearest-neighbor example even when Llama is not installed.

## What you are learning

Short example cards (one idea each) become 64-dimension vectors from hashed content words (common words dropped, signed bins, L2-normalized). A query is embedded the same way. Cosine distance (`1 − dot`) ranks neighbors. Lower is closer.

This is a teaching stand-in for a model embedder such as `nomic-embed-text` or Bedrock Titan. The geometry is the lesson; the hash is transparent.

Beside every step is a static map of how that job could run at AWS scale (S3, Titan embeddings, OpenSearch Serverless). The map is teaching chrome. Ranking still happens in process memory. No AWS account or keys.

## What you see

- A live path: `ingest → hash → index → query → rank`
- An AWS-scale twin next to each step (hover or click for explainers)
- Sample queries and a free-text box (Pages hashes in the browser — no localhost API)
- The first 12 dimensions of the query vector
- Ranked chunks with a closeness bar and distance

## Flow

1. On API startup, short cards in `data/examples/vector-cards.md` are embedded with hashed word tokens. The static Pages demo uses the same cards and hash in the browser (`apps/web/lib/vector-cards.ts`, `hashed.ts`).
2. Vectors live in process memory (`LocalVectorIndex`) or in the page. Nothing is written to disk.
3. Your query is hashed the same way and compared with cosine distance.

RAG, LangChain, LangGraph, and refill still use Ollama when you want generated text.
