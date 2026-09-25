# LangChain lab

**Route:** `/labs/langchain`  
**API:** `POST /labs/langchain/run` (SSE)

## What you are learning

LangChain composes work as a chain of runnables. This lab is `retriever | prompt | llm | parser` — retrieve passages, fill a `ChatPromptTemplate`, invoke Ollama through the provider seam, then `JsonOutputParser`. The pipe is the lesson.

A chain is not a graph. It is a straight path. Branches, critique loops, and retries belong in the LangGraph lab.

Beside every hop is a static map of how that job could run at AWS scale (Knowledge Bases, Bedrock prompts, Converse, a JSON parser). The map is teaching chrome. Inference stays on Ollama at `localhost`. No AWS account, keys, or hosted models are used.

## What you see

- Sample questions (all recorded for the GitHub Pages demo)
- A live path: `bind → retrieve → template → invoke → parse` (paced delays when replaying a fixture)
- The LCEL pipe string on the bind hop
- The formatted prompt before the model runs
- Raw completion, then parsed `{answer, grounded, sources}`
- An AWS-scale twin next to each hop (hover or click for explainers)

## Flow

The handler builds a real langchain-core chain, then invokes each runnable in order and streams `{node, update}` as `text/event-stream`. State is request-scoped and discarded when the response ends.
