from __future__ import annotations

import json
from typing import Literal, Optional, TypedDict

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel, Field

from app.config import settings
from app.labs.refill_pharmacy import (
    ESCALATE_PATHS,
    check_safety,
    decide_path,
    get_script,
    parse_request,
    proposed_for,
    queue_escalation,
    submit_order,
)
from app.memory import EphemeralStore
from app.providers.ollama import OllamaError, OllamaProvider
from app.store import store

router = APIRouter(prefix="/labs/refill", tags=["refill"])
provider = OllamaProvider()
pending = EphemeralStore(settings.session_ttl_seconds)

Decision = Literal["approve", "deny"]


class RunBody(BaseModel):
    question: str = Field(min_length=3, max_length=500)
    decision: Optional[Decision] = None


class ResumeBody(BaseModel):
    run_id: str = Field(min_length=8, max_length=64)
    decision: Decision


class GraphState(TypedDict):
    question: str
    channel: str
    identifiers_matched: bool
    medication: str
    chunks: list
    refills_remaining: Optional[int]
    last_fill_days: Optional[int]
    expired: bool
    controlled: bool
    labs_overdue: bool
    early_refill: bool
    path: str
    decision: str
    proposed: str
    review_status: str
    review_note: str
    outcome: str
    answer: str


def _empty_state(question: str, decision: str = "") -> GraphState:
    return {
        "question": question,
        "channel": "",
        "identifiers_matched": False,
        "medication": "",
        "chunks": [],
        "refills_remaining": None,
        "last_fill_days": None,
        "expired": False,
        "controlled": False,
        "labs_overdue": False,
        "early_refill": False,
        "path": "",
        "decision": decision,
        "proposed": "",
        "review_status": "",
        "review_note": "",
        "outcome": "",
        "answer": "",
    }


def _passages(state: GraphState) -> str:
    return "\n".join(f"- ({item['source']}) {item['text']}" for item in state["chunks"])


def _intake(state: GraphState) -> dict:
    parsed = parse_request(state["question"])
    return {
        "channel": parsed["channel"],
        "identifiers_matched": parsed["identifiers_matched"],
        "medication": parsed["medication"],
    }


def _retrieve_policy(state: GraphState) -> dict:
    query = (
        "Acme Teaching Pharmacy refill policy identity verification controlled substance "
        "expired script labs early refill auto-approve"
    )
    hits = store.query(provider, query, k=3, source="refill.md")
    return {"chunks": hits}


def _check_script(state: GraphState) -> dict:
    return get_script(state["question"])


def _safety(state: GraphState) -> dict:
    return check_safety(state["question"])


def _decide(state: GraphState) -> dict:
    path = decide_path(
        state["identifiers_matched"],
        state["controlled"],
        state["expired"],
        state["refills_remaining"],
        state["early_refill"],
        state["labs_overdue"],
    )
    return {"path": path, "proposed": proposed_for(path)}


def _review(state: GraphState) -> dict:
    path = state["path"]
    if path == "identity":
        queue_escalation(path)
        return {
            "review_status": "refused",
            "review_note": "Identity did not match the teaching chart. Warm transfer to the front desk.",
        }
    if path == "auto_approve":
        return {
            "review_status": "skipped",
            "review_note": "Zero-touch. Active script and a clear teaching record.",
        }

    decision = state["decision"]
    passages = _passages(state)
    prompt = (
        "This is a teaching refill lab, not a clinic. In two short sentences, explain the "
        f"pharmacist {decision} on a {path} path. Stay inside the policy passages. "
        "Do not invent labs, doses, or personal names. If you mention the requester, use the "
        "Patient A–F label from the question. Cite [refill.md] if you use a rule.\n"
        f"Medication: {state['medication'] or 'unknown'}\n"
        f"Channel: {state['channel']}\n"
        f"Decision: {decision}\n"
        f"Passages:\n{passages}"
    )
    note = provider.generate(prompt)
    return {
        "review_status": "approved" if decision == "approve" else "denied",
        "review_note": note,
    }


def _act(state: GraphState) -> dict:
    status = state["review_status"]
    if status in {"approved", "skipped"}:
        submit_order(state["medication"], state["channel"])
        outcome = "approved"
    elif status == "denied":
        outcome = "denied"
    else:
        outcome = "refused"

    passages = _passages(state)
    prompt = (
        "Write a short patient-facing note for this teaching refill lab. "
        "It is not medical advice. Stay inside the policy passages and the structured outcome. "
        "Cite [refill.md]. Do not invent facts or personal names. Address the requester as "
        "Patient A, Patient B, and so on if a label is in the question.\n"
        f"Question: {state['question']}\n"
        f"Channel: {state['channel']}\n"
        f"Path: {state['path']}\n"
        f"Review: {state['review_status']}\n"
        f"Review note: {state['review_note']}\n"
        f"Outcome: {outcome}\n"
        f"Passages:\n{passages}"
    )
    return {"outcome": outcome, "answer": provider.generate(prompt)}


def _build_prep():
    graph = StateGraph(GraphState)
    graph.add_node("intake", _intake)
    graph.add_node("retrieve_policy", _retrieve_policy)
    graph.add_node("check_script", _check_script)
    graph.add_node("safety", _safety)
    graph.add_node("decide", _decide)
    graph.add_edge(START, "intake")
    graph.add_edge("intake", "retrieve_policy")
    graph.add_edge("retrieve_policy", "check_script")
    graph.add_edge("check_script", "safety")
    graph.add_edge("safety", "decide")
    graph.add_edge("decide", END)
    return graph.compile()


def _build_finish():
    graph = StateGraph(GraphState)
    graph.add_node("review", _review)
    graph.add_node("act", _act)
    graph.add_edge(START, "review")
    graph.add_edge("review", "act")
    graph.add_edge("act", END)
    return graph.compile()


prep = _build_prep()
finish = _build_finish()


def _public_update(node: str, update: dict) -> dict:
    if node == "intake":
        return {
            "channel": update.get("channel"),
            "identifiers_matched": update.get("identifiers_matched"),
            "medication": update.get("medication"),
        }
    if node == "retrieve_policy":
        chunks = update.get("chunks") or []
        return {
            "chunks": [
                {
                    "source": item.get("source"),
                    "distance": item.get("distance"),
                    "text": item.get("text"),
                }
                for item in chunks
            ]
        }
    if node == "check_script":
        return {
            "refills_remaining": update.get("refills_remaining"),
            "last_fill_days": update.get("last_fill_days"),
            "expired": update.get("expired"),
        }
    if node == "safety":
        return {
            "controlled": update.get("controlled"),
            "labs_overdue": update.get("labs_overdue"),
            "early_refill": update.get("early_refill"),
        }
    if node == "decide":
        return {"path": update.get("path")}
    if node == "await_human":
        return {
            "run_id": update.get("run_id"),
            "path": update.get("path"),
            "proposed": update.get("proposed"),
        }
    if node == "review":
        return {"status": update.get("review_status"), "note": update.get("review_note")}
    if node == "act":
        return {"outcome": update.get("outcome"), "answer": update.get("answer")}
    return dict(update)


def _event(node: str, update: dict) -> str:
    payload = {"node": node, "update": _public_update(node, update)}
    return f"data: {json.dumps(payload)}\n\n"


def _merge(state: GraphState, update: dict) -> GraphState:
    merged = dict(state)
    merged.update(update)
    return merged  # type: ignore[return-value]


def _stream_graph(compiled, state: GraphState):
    current = state
    for payload in compiled.stream(current):
        for node, update in payload.items():
            current = _merge(current, update)
            yield node, update, current


def _needs_human(state: GraphState) -> bool:
    return state["path"] in ESCALATE_PATHS and state["decision"] not in {"approve", "deny"}


def _events_for_run(question: str, decision: str = ""):
    state = _empty_state(question, decision)
    try:
        for node, update, state in _stream_graph(prep, state):
            yield _event(node, update)
        if _needs_human(state):
            run_id = pending.put(state)
            yield _event(
                "await_human",
                {"run_id": run_id, "path": state["path"], "proposed": state["proposed"]},
            )
            return
        for node, update, state in _stream_graph(finish, state):
            yield _event(node, update)
        yield 'data: {"node": "done"}\n\n'
    except OllamaError:
        yield 'data: {"node": "error", "detail": "ollama_unavailable"}\n\n'


def _events_for_resume(state: GraphState, decision: Decision):
    state = _merge(state, {"decision": decision})
    try:
        for node, update, state in _stream_graph(finish, state):
            yield _event(node, update)
        yield 'data: {"node": "done"}\n\n'
    except OllamaError:
        yield 'data: {"node": "error", "detail": "ollama_unavailable"}\n\n'


@router.post("/run")
def run(body: RunBody) -> StreamingResponse:
    if not store.ready:
        raise HTTPException(status_code=503, detail="index_unavailable")
    return StreamingResponse(
        _events_for_run(body.question, body.decision or ""),
        media_type="text/event-stream",
    )


@router.post("/resume")
def resume(body: ResumeBody) -> StreamingResponse:
    state = pending.pop(body.run_id)
    if state is None:
        raise HTTPException(status_code=404, detail="run_expired")
    return StreamingResponse(
        _events_for_resume(state, body.decision),
        media_type="text/event-stream",
    )
