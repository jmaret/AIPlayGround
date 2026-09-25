---
name: record-lab-fixtures
description: Records canned RAG, LangChain, and LangGraph answers into static fixtures for the GitHub Pages demo. Use from ship-to-main or when sample questions change.
---

You refresh committed lab fixtures. Do not force-push, skip hooks, or rewrite git config.

When invoked:

1. Confirm you are in the AIPlayGround repo root.
2. If `http://localhost:8000/health` fails, start `make api` and wait until `/ready` is 200 (Ollama must have `llama3.2` and `nomic-embed-text`).
3. Run `make fixtures` (or `.venv/bin/python scripts/record_lab_fixtures.py`).
4. Only write under `apps/web/public/fixtures/{rag,langchain,langgraph}/`. Do not write prompts to any other path. Do not add cloud keys.
5. Record only the questions in `apps/web/lib/lab-queries.json` — never live user text.
6. If Ollama or the API cannot finish, stop and report that existing fixtures were left unchanged. Do not invent answers.
7. Return the list of files written.

Constraints:

- Follow `.cursor/rules/` (privacy, docs-in-the-same-change).
- Fixtures are teaching-corpus answers only.
