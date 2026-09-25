# Getting started

Everything runs on your machine. No API keys.

## Prerequisites

- Node.js 20+
- Python 3.11+
- [Ollama](https://ollama.com)

Pull the local models once:

```bash
ollama pull llama3.2
ollama pull nomic-embed-text
```

On a smaller machine, `llama3.2:1b` or `phi3` can replace `llama3.2`. Set `OLLAMA_CHAT_MODEL` in a local `.env` copied from `.env.example`.

## Install and run

```bash
make install
make check-ollama
make dev
```

- Web: [http://localhost:3010](http://localhost:3010)
- API: [http://localhost:8000/health](http://localhost:8000/health)

The first API start embeds the bundled corpus (about 10 chunks). That can take half a minute. `/ready` reports `index_ready` when it is done.

The API binds to loopback only. The Vector DB lab works without Ollama. RAG, LangChain, and LangGraph need the pulled models; if they are missing, those labs say so.

## GitHub Pages demo

Record the canned lab questions (API + Ollama must be up), then build a static export:

```bash
make fixtures
make pages
```

`apps/web/out/` is the Pages artifact. Sample chips replay those fixtures with artificial step delays. Enable GitHub Pages (Actions source) to publish on push to `main`. Live typed questions still require `make dev` on your machine.
