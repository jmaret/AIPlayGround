# Architecture

```
Browser (Next.js, 127.0.0.1:3000)
  → FastAPI (127.0.0.1:8000)
    → Ollama (127.0.0.1:11434)   embed / generate
    → Chroma (in-process, ephemeral)
    → LangGraph (in-process)
```

## Apps

- `apps/web` — marketing site and lab UI
- `apps/api` — labs API
- `data/corpus` — bundled teaching texts only

## Provider seam

Labs call `app.providers.base.Provider` (`embed`, `generate`). v1 ships `OllamaProvider` only. A later local Hugging Face backend can implement the same interface without rewriting labs.

## Data flow

1. On API startup, corpus files are chunked, embedded via Ollama, and upserted into an in-memory Chroma collection.
2. Lab requests retrieve from that collection and optionally generate with Ollama.
3. Request bodies are not logged. Session-shaped state, if any, lives in process memory with a 15-minute TTL.

## Ports

| Service | Bind | Port |
| --- | --- | --- |
| Web | 127.0.0.1 | 3000 |
| API | 127.0.0.1 | 8000 |
| Ollama | 127.0.0.1 | 11434 |
