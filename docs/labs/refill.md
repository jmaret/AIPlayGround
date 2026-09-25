# Agentic AI lab

**Route:** `/labs/refill`  
**Architecture:** `/labs/refill/architecture`  
**API:** `POST /labs/refill/run` (SSE), `POST /labs/refill/resume` (SSE)

## What you are learning

A refill request is a graph of named tools, not a hidden chatbot. This lab is `START → intake → retrieve_policy → check_script → safety → decide → review → act → END`.

The model writes the patient-facing note. Local tools pick the path from a fictional in-memory chart. Controlled, expired, and labs/early paths pause for a pharmacist **Approve** or **Deny**. Identity mismatch refuses without that click.

This is a teaching workflow on fake policy text. It is not a clinic, does not call a real EHR or pharmacy, and does not keep what you type.

Beside each live node is its AWS box (Ingress, Intake, Knowledge, Script, Safety, Choice, Human task, Final, Egress). The **AWS Architecture** title links to **Agentic AI on AWS** (`/labs/refill/architecture`), the stacked physical twin. The map is teaching chrome. Inference stays on Ollama at `localhost`.

## What you see

- Six sample requests (Patient A–F). Click a prompt to read a plain-language story and run that path (patient auto, pharmacy auto, controlled, expired, labs/early, identity)
- A clickable DAG labeled Flow, with an AWS Architecture box beside each node
- The AWS Architecture title links to Agentic AI on AWS
- Nodes lighting as each step finishes
- On escalate (live only): Approve and Deny. Pending state lives in process memory for 15 minutes
- On GitHub Pages: canned runs — controlled is recorded as approve-after-review, expired as deny-after-review
- Collapsed raw JSON for the selected update

## Flow

LangGraph streams each node completion as `text/event-stream`. After `decide`, escalate paths yield `await_human` and stop until `POST /labs/refill/resume`. Auto-approve and identity continue through `review` and `act` in the same stream. Restarting the API drops any pending review.
