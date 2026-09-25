# RAG lab

**Route:** `/labs/rag`  
**Architecture:** `/labs/rag/architecture`  
**API:** `POST /labs/rag/ask`

## What you are learning

Retrieval-Augmented Generation answers from retrieved chunks instead of from the model’s memory alone. If the corpus cannot support the answer, the model is told to say so.

Beside each live step is its AWS box (Ingress, Question vector, Knowledge, Prompt bind, Answer, Ground check, Egress). The **AWS Architecture** title links to **RAG on AWS** (`/labs/rag/architecture`), the stacked physical twin. The map is teaching chrome. Inference stays on Ollama at `localhost`. No AWS account, keys, or hosted models are used.

## What you see

- Sample questions (all recorded for the GitHub Pages demo)
- A live path labeled Flow: `embed → retrieve → ground → generate → cite`, with an AWS Architecture box beside each step (paced delays when replaying a fixture)
- The AWS Architecture title links to RAG on AWS (hover or click a service for explainers)
- The grounded answer
- The exact chunks the model was given, with sources

## Flow

1. Embed the question (Ollama).
2. Retrieve top-k chunks from in-memory Chroma.
3. Bind those passages into the prompt (the model may not invent facts).
4. Generate. Cite sources as `[filename]`. Refuse when the corpus is not enough.

The API returns one JSON payload. The browser lights every hop when that response arrives (it does not stream per node the way LangGraph does).
