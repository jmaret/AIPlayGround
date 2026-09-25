# Decisions

## Ollama on the machine (v1)

Chosen because it is $0 after install, needs no API key, and keeps prompts on localhost. That is the only combination that matches zero-cost, security, and no-retention at once.

## In-memory Chroma

The vector store is a teaching prop, not a product database. Persistence would invite leftover user text. Restart = empty + rebuild from `data/corpus/`.

## Hashed n-grams for the Vector DB lab

The Vector DB lesson is geometry, not Llama. A deterministic 64-d hashed word-token embed lets the lab run with only `make api`, and the same hash runs in the browser on GitHub Pages so that lab does not need localhost. RAG, LangChain, and LangGraph still need Ollama when you want generated text.

## Teal-ink UX chrome

The product shell is teal-ink tokens, a frosted header, segmented tabs, and glass workspace panels. No stock office photograph, third-party wordmark, or accounts. The mural and Playground mark stay original.

## No accounts

A learning playground does not need identity. Accounts would create PII we promised not to keep.

## Thin provider seam

Labs call `embed` / `generate`, not Ollama URLs directly. v1 implements Ollama only so a later local backend can plug in.

## AWS maps on the labs

Vector DB, RAG, LangChain, and LangGraph each draw how a step *could* run on AWS (S3, Titan, OpenSearch, Bedrock, Guardrails). That is a teaching overlay, not a provider. v1 still does not add cloud keys or hosted inference.

## GitHub Pages is a recorded demo

Pages cannot run FastAPI or Ollama. The static site replays canned RAG / LangChain / LangGraph runs recorded by `make fixtures`. Vector DB is the exception: the teaching hash runs in the tab. That is a tour, not hosted inference. Live generated answers stay on localhost.

## Later: Hugging Face and similar (gated)

Revisit only if all of these still hold:

- Still $0
- Still no retention
- Still localhost-first by default
- Clear learning value Ollama does not already cover

First candidate if the gate passes: **local** Transformers / sentence-transformers (download once, run offline). Hosted Inference API is last-resort and opt-in. Until then, do not add it.
