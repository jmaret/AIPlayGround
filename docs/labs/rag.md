# RAG lab

**Route:** `/labs/rag`  
**API:** `POST /labs/rag/ask`

## What you are learning

Retrieval-Augmented Generation answers from retrieved chunks instead of from the model’s memory alone. If the corpus cannot support the answer, the model is told to say so.

## What you see

- The question
- Retrieved chunks with sources
- A grounded answer plus citations

## Flow

1. Embed the question (Ollama).
2. Retrieve top-k chunks from in-memory Chroma.
3. Generate with a prompt that only allows those chunks.

Refuse answers that need facts outside the corpus.
