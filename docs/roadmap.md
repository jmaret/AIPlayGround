# Roadmap

Not in v1. Add only with matching `docs/labs/` (or a decisions update) in the same change.

## Labs

- Embeddings explorer (dimensions, similarity as a picture)
- Tool-using agent (local tools only)
- Prompt chaining
- Lightweight evals (faithfulness / citation checks)

## Providers

- Evaluate local Hugging Face Transformers against the gate in [decisions.md](decisions.md)
- Do not add hosted inference unless it is explicitly opt-in and still $0

## Ops

- Optional Docker Compose for people who want it (not required)
- Cloudflare/GitHub Pages for the **static marketing page only** — labs stay local
