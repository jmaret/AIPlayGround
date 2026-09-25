# Changelog

## 2026-09-25 — Vector DB and RAG pipelines

- Vector DB and RAG labs use the same live step path + AWS-scale map + viewport popups as LangGraph
- Shared chrome lives in `apps/web/components/lab/`
- Maps are educational only — Vector DB still hashes in-process; RAG still uses localhost Ollama

## 2026-09-25 — LangGraph architecture popups

- Hover or click any AWS service card, model name, or scale line for a short explainer
- Popups render on `document.body` and flip/clamp to the viewport so the glass panel cannot clip them — including the last steps

## 2026-09-25 — LangGraph AWS-scale map

- Each LangGraph step shows a static AWS / LLM architecture beside it (API Gateway, Step Functions, Bedrock, OpenSearch, Guardrails)
- The map is educational only — the lab still runs on localhost Ollama and does not call AWS

## 2026-09-25 — LangGraph live DAG

- LangGraph lab draws `START → route → retrieve → draft → critique → answer → END` beside the output
- Nodes light as SSE events arrive; click a finished node to inspect its payload
- `route` is shown as a label chip, not a fake branch

## 2026-09-25 — ship-to-main subagent

- Added `.cursor/agents/ship-to-main.md` to check in, open a PR, try to approve, and merge to main

## 2026-09-24 — Vector DB without Ollama

- Vector DB lab uses an in-memory hashed 3-gram index so the example works when Llama is not running
- UI shows sample queries, query-vector dimensions, and ranked neighbors with closeness bars

## 2026-09-24 — Web port 3010

- Bind the Next.js app to `127.0.0.1:3010` so it does not collide with other local apps on 3000
- CORS allowlist updated to the 3010 origins only

## 2026-09-24 — CareerGenie UX chrome

- Restyle the site to CareerGenie’s teal-ink frosted shell (Source Serif 4 / Source Sans 3, segmented nav, `WorkspacePanel`)
- Keep the original Playground mark and mural; no CareerGenie photo or sign-in
- Buttons and lab traces use `rounded-md` accent / line tokens instead of apricot pills

## 2026-09-23 — v1 local playground

- Roots-inspired marketing site with original apricot/ink identity
- Humanist “AI in human life” mural and Playground mark
- Local FastAPI labs: Vector DB, RAG, LangGraph
- Ollama-only inference, in-memory Chroma, no personal-data retention
- Chroma and LangSmith telemetry disabled in the API process
- Cursor rules and living docs added
