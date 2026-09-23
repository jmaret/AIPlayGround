# LangGraph lab

**Route:** `/labs/langgraph`  
**API:** `POST /labs/langgraph/run` (SSE)

## What you are learning

A graph is an explicit sequence of nodes. This lab is `route → retrieve → draft → critique → answer`. The timeline is the lesson — the framework is not hidden.

## What you see

- Live node events as the graph runs
- Intermediate draft and critique
- Final answer grounded in retrieved chunks

## Flow

LangGraph streams each node completion to the browser as `text/event-stream`. State is request-scoped and discarded when the response ends.
