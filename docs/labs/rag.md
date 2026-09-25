# RAG lab

**Route:** `/labs/rag`  
**API:** `POST /labs/rag/ask`

## What you are learning

Retrieval-Augmented Generation answers from retrieved chunks instead of from the model’s memory alone. If the corpus cannot support the answer, the model is told to say so.

Beside every step is a static map of how that job could run at AWS scale (Bedrock Titan, Knowledge Bases, OpenSearch, Claude or Llama, Guardrails). The map is teaching chrome. Inference stays on Ollama at `localhost`. No AWS account, keys, or hosted models are used.

## What you see

- Sample questions (all recorded for the GitHub Pages demo)
- A live path: `embed → retrieve → ground → generate → cite` (paced delays when replaying a fixture)
- An AWS-scale twin next to each step (hover or click for explainers)
- The grounded answer
- The exact chunks the model was given, with sources

## Flow

1. Embed the question (Ollama).
2. Retrieve top-k chunks from in-memory Chroma.
3. Bind those passages into the prompt (the model may not invent facts).
4. Generate. Cite sources as `[filename]`. Refuse when the corpus is not enough.

The API returns one JSON payload. The browser lights every hop when that response arrives (it does not stream per node the way LangGraph does).
