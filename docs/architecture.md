# Architecture

```
Browser (Next.js, 127.0.0.1:3010)
  → FastAPI (127.0.0.1:8000)
    → Local hashed n-gram index   Vector DB lab (no Ollama)
    → Ollama (127.0.0.1:11434)    RAG / LangGraph embed + generate
    → Chroma (in-process, ephemeral)
    → LangGraph (in-process)
```

## Apps

- `apps/web` — marketing site and lab UI
- `apps/api` — labs API
- `data/corpus` — bundled teaching texts only

## Provider seam

The Vector DB lab uses `hashed_ngram_embed` and `LocalVectorIndex` (no model). RAG and LangGraph call `app.providers.base.Provider` (`embed`, `generate`). v1 ships `OllamaProvider` for those two labs. A later local Hugging Face backend can implement the same interface without rewriting them.

## Data flow

1. On API startup, short cards in `data/examples/vector-cards.md` are hashed into an in-memory vector index (Vector DB lab is ready immediately, no Ollama).
2. If Ollama is up, the same corpus is also embedded into ephemeral Chroma for RAG / LangGraph.
3. Request bodies are not logged. Session-shaped state, if any, lives in process memory with a 15-minute TTL.

## Ports

| Service | Bind | Port |
| --- | --- | --- |
| Web | 127.0.0.1 | 3010 |
| API | 127.0.0.1 | 8000 |
| Ollama | 127.0.0.1 | 11434 |
