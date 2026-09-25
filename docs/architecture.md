# Architecture

```
Browser (Next.js, localhost:3010)
  → FastAPI (localhost:8000)
    → Local hashed n-gram index   Vector DB lab (no Ollama)
    → Ollama (localhost:11434)    RAG / LangChain / LangGraph embed + generate
    → Chroma (in-process, ephemeral)
    → LangGraph (in-process)
    → LangChain LCEL (in-process)
```

## Apps

- `apps/web` — marketing site and lab UI (`STATIC_EXPORT=1` emits GitHub Pages files)
- `apps/api` — labs API
- `data/corpus` — bundled teaching texts only
- `apps/web/public/fixtures/` — recorded canned runs for the static demo

## Provider seam

The Vector DB lab uses `hashed_ngram_embed` and `LocalVectorIndex` (no model). RAG, LangChain, and LangGraph call `app.providers.base.Provider` (`embed`, `generate`). v1 ships `OllamaProvider` for those labs. A later local Hugging Face backend can implement the same interface without rewriting them.

## Data flow

1. On API startup, short cards in `data/examples/vector-cards.md` are hashed into an in-memory vector index (Vector DB lab is ready immediately, no Ollama).
2. If Ollama is up, the same corpus is also embedded into ephemeral Chroma for RAG / LangChain / LangGraph.
3. Request bodies are not logged. Session-shaped state, if any, lives in process memory with a 15-minute TTL.

## Ports

| Service | Bind | Port |
| --- | --- | --- |
| Web | localhost | 3010 |
| API | localhost | 8000 |
| Ollama | localhost | 11434 |
