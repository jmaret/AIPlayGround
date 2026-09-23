import json
from typing import TypedDict

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel, Field

from app.providers.ollama import OllamaError, OllamaProvider
from app.store import store

router = APIRouter(prefix="/labs/langgraph", tags=["langgraph"])
provider = OllamaProvider()


class RunBody(BaseModel):
    question: str = Field(min_length=3, max_length=500)


class GraphState(TypedDict):
    question: str
    route: str
    chunks: list
    draft: str
    critique: str
    answer: str


def _route(state: GraphState) -> dict[str, str]:
    lowered = state["question"].lower()
    if any(word in lowered for word in ("graph", "node", "langgraph", "route")):
        return {"route": "explain_graph"}
    return {"route": "retrieve"}


def _retrieve(state: GraphState) -> dict[str, list]:
    hits = store.query(provider, state["question"], k=3)
    return {"chunks": hits}


def _draft(state: GraphState) -> dict[str, str]:
    passages = "\n".join(f"- ({item['source']}) {item['text']}" for item in state["chunks"])
    prompt = (
        "Draft a short answer using only these passages. If they are thin, say so.\n"
        f"Question: {state['question']}\nPassages:\n{passages}"
    )
    return {"draft": provider.generate(prompt)}


def _critique(state: GraphState) -> dict[str, str]:
    prompt = (
        "In two sentences, say whether the draft stays inside the passages "
        "and what to tighten. Do not invent facts.\n"
        f"Draft:\n{state['draft']}"
    )
    return {"critique": provider.generate(prompt)}


def _answer(state: GraphState) -> dict[str, str]:
    prompt = (
        "Write the final answer. Apply the critique. Stay inside the passages. "
        "Cite sources as [filename].\n"
        f"Question: {state['question']}\nDraft:\n{state['draft']}\nCritique:\n{state['critique']}"
    )
    return {"answer": provider.generate(prompt)}


def build_graph():
    graph = StateGraph(GraphState)
    graph.add_node("route", _route)
    graph.add_node("retrieve", _retrieve)
    graph.add_node("draft", _draft)
    graph.add_node("critique", _critique)
    graph.add_node("answer", _answer)
    graph.add_edge(START, "route")
    graph.add_edge("route", "retrieve")
    graph.add_edge("retrieve", "draft")
    graph.add_edge("draft", "critique")
    graph.add_edge("critique", "answer")
    graph.add_edge("answer", END)
    return graph.compile()


compiled = build_graph()


@router.post("/run")
def run(body: RunBody) -> StreamingResponse:
    if not store.ready:
        raise HTTPException(status_code=503, detail="index_unavailable")

    def events():
        state: GraphState = {
            "question": body.question,
            "route": "",
            "chunks": [],
            "draft": "",
            "critique": "",
            "answer": "",
        }
        try:
            for payload in compiled.stream(state):
                for node, update in payload.items():
                    event = {"node": node, "update": _public_update(update)}
                    yield f"data: {json.dumps(event)}\n\n"
            yield "data: {\"node\": \"done\"}\n\n"
        except OllamaError:
            yield "data: {\"node\": \"error\", \"detail\": \"ollama_unavailable\"}\n\n"

    return StreamingResponse(events(), media_type="text/event-stream")


def _public_update(update: dict) -> dict:
    public = dict(update)
    if "chunks" in public:
        public["chunks"] = [
            {"source": item.get("source"), "distance": item.get("distance"), "text": item.get("text")}
            for item in public["chunks"]
        ]
    return public
