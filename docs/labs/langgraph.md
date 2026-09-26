# LangGraph lab

**Route:** `/labs/langgraph`  
**Architecture:** `/labs/langgraph/architecture`  
**API:** `POST /labs/langgraph/run` (SSE)

## What you are learning

A graph is an explicit sequence of nodes. This lab is `START → route → retrieve → draft → critique → answer → END`. The live graph is the lesson — the framework is not hidden.

`route` writes a label (`explain_graph` or `retrieve`). It is not a fork: retrieve still runs on every question.

Beside each live node is its AWS box (Ingress, Intent, Knowledge, Generate, Review, Final, Egress). **LangGraph on AWS** (`/labs/langgraph/architecture`) shows two pictures of the same twin: a region diagram (Browser → Edge → named states → egress) and the stacked stage boxes. The map is teaching chrome. Inference stays on Ollama at `localhost`. No AWS account, keys, or hosted models are used.

## What you see

- Sample questions covering both `explain_graph` and `retrieve` route labels (recorded for GitHub Pages)
- A clickable DAG labeled Flow, with AWS Architecture boxes beside each node (paced delays when replaying a fixture)
- The AWS Architecture title links to LangGraph on AWS: a region picture plus stacked stage boxes. Hover or click any service card, model name, or scale line for a short explainer (including what Nova Micro is). The popup is portaled to the page so the last rows are not clipped.
- Nodes lighting as each step finishes (pulse + edge flow while the next node runs)
- Intermediate draft and critique, then a grounded answer
- Collapsed raw JSON for the selected update

## Flow

LangGraph streams each node completion to the browser as `text/event-stream`. The browser infers the running node as the next step after the last event. State is request-scoped and discarded when the response ends.
