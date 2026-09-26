# Architecture

```
Browser (Next.js, localhost:3010)
  → FastAPI (localhost:8000)
    → Local hashed n-gram index   Vector DB lab (no Ollama)
    → Ollama (localhost:11434)    RAG / LangChain / LangGraph / refill embed + generate
    → Chroma (in-process, ephemeral)
    → LangGraph (in-process)
    → LangChain LCEL (in-process)
    → Refill tools + ephemeral HITL (in-process)
```

## Apps

- `apps/web` — marketing site and lab UI (`STATIC_EXPORT=1` emits GitHub Pages files)
- `apps/api` — labs API
- `data/corpus` — bundled teaching texts only
- `apps/web/public/fixtures/` — recorded canned runs for the static demo

## Provider seam

The Vector DB lab uses `hashed_ngram_embed` and `LocalVectorIndex` (no model). RAG, LangChain, LangGraph, and the Agentic AI lab call `app.providers.base.Provider` (`embed`, `generate`). v1 ships `OllamaProvider` for those labs. A later local Hugging Face backend can implement the same interface without rewriting them. The Agentic AI lab also runs deterministic local tools against a fictional in-memory chart and can park escalate state in `EphemeralStore` (15-minute TTL).

## Data flow

1. On API startup, short cards in `data/examples/vector-cards.md` are hashed into an in-memory vector index (Vector DB lab is ready immediately, no Ollama). The GitHub Pages build uses the same hash in the browser (`apps/web/lib/hashed.ts`) and does not call localhost.
2. If Ollama is up, the same corpus is also embedded into ephemeral Chroma for RAG / LangChain / LangGraph / refill.
3. Request bodies are not logged. Session-shaped state, if any, lives in process memory with a 15-minute TTL. The Agentic AI lab uses that store only for a pending pharmacist review.

## Teaching maps

Each lab has a boxed AWS physical architecture at `/labs/<slug>/architecture`, titled after the lab (Vector DB on AWS, RAG on AWS, LangGraph on AWS, LangChain on AWS, Agentic AI on AWS). That page shows two pictures of the same twin: a region diagram (Browser → Edge → named lab steps → egress) and stacked stage boxes. The live run shows Flow on the left and AWS Architecture on the right; the AWS Architecture title links to those pictures. Maps are teaching chrome. Runtime stays on localhost.

## Ports

| Service | Bind | Port |
| --- | --- | --- |
| Web | localhost | 3010 |
| API | localhost | 8000 |
| Ollama | localhost | 11434 |
