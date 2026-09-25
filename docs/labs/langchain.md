# LangChain lab

**Route:** `/labs/langchain`  
**Architecture:** `/labs/langchain/architecture`  
**API:** `POST /labs/langchain/run` (SSE)

## What you are learning

LangChain composes work as a chain of runnables. This lab is `retriever | prompt | llm | parser` — retrieve passages, fill a `ChatPromptTemplate`, invoke Ollama through the provider seam, then `JsonOutputParser`. The pipe is the lesson.

A chain is not a graph. It is a straight path. Branches, critique loops, and retries belong in the LangGraph lab.

Beside each live hop is its AWS box (Ingress, Compose, Retriever, Prompt, Model, Parser, Egress). The **AWS Architecture** title links to **LangChain on AWS** (`/labs/langchain/architecture`), the stacked physical twin. The map is teaching chrome. Inference stays on Ollama at `localhost`. No AWS account, keys, or hosted models are used.

## What you see

- Sample questions (all recorded for the GitHub Pages demo)
- A live path labeled Flow: `bind → retrieve → template → invoke → parse`, with an AWS Architecture box beside each hop (paced delays when replaying a fixture)
- The AWS Architecture title links to LangChain on AWS (hover or click a service for explainers)
- The LCEL pipe string on the bind hop
- The formatted prompt before the model runs
- Raw completion, then parsed `{answer, grounded, sources}`

## Flow

The handler builds a real langchain-core chain, then invokes each runnable in order and streams `{node, update}` as `text/event-stream`. State is request-scoped and discarded when the response ends.
