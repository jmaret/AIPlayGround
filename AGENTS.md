# AI Playground agent guide

This is a local-only learning playground. Read `docs/` before changing behavior.

## Must follow

- `.cursor/rules/` — privacy, docs-in-the-same-change, design system, API, labs
- v1 inference is **Ollama on localhost only**. No cloud LLM keys.
- No accounts, analytics, email capture, or prompt logging
- Bind to `localhost`. Sessions are in-memory and die with the process.

## Start here

- [docs/README.md](docs/README.md)
- [docs/getting-started.md](docs/getting-started.md)
- [docs/privacy-and-security.md](docs/privacy-and-security.md)

## Subagents

- `.cursor/agents/ship-to-main.md` — check in, open a PR, try to approve, merge to `main`
