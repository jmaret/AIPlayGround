import json
import re
from typing import Any, Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from pydantic import BaseModel, Field

from app.providers.ollama import OllamaError, OllamaProvider
from app.store import store

router = APIRouter(prefix="/labs/langchain", tags=["langchain"])
provider = OllamaProvider()
parser = JsonOutputParser()

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Answer only from the context. If the context is not enough, say you do not know. "
            "Reply with JSON only, no markdown, matching this schema:\n{format_instructions}",
        ),
        ("human", "Question: {question}\n\nContext:\n{context}"),
    ]
).partial(
    format_instructions=(
        '{"answer": string, "grounded": boolean, "sources": [filename strings from the context]}'
    )
)

PIPE = "retriever | prompt | llm | parser"


class RunBody(BaseModel):
    question: str = Field(min_length=3, max_length=500)


def _public_chunks(hits: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {"source": item.get("source"), "distance": item.get("distance"), "text": item.get("text")}
        for item in hits
    ]


def _format_docs(hits: list[dict[str, Any]]) -> str:
    return "\n".join(f"- ({item['source']}) {item['text']}" for item in hits)


def _invoke_llm(value: object) -> str:
    text = value.to_string() if hasattr(value, "to_string") else str(value)
    return provider.generate(text)


def _parse_output(text: str) -> dict[str, Any]:
    try:
        parsed = parser.parse(text)
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        pass
    match = re.search(r"\{.*\}", text, flags=re.S)
    if match:
        try:
            loaded = json.loads(match.group(0))
            if isinstance(loaded, dict):
                return loaded
        except json.JSONDecodeError:
            pass
    return {"answer": text.strip(), "grounded": False, "sources": [], "parse_error": True}


retriever = RunnableLambda(lambda question: store.query(provider, question, k=3))
llm = RunnableLambda(_invoke_llm)

# Real LCEL pipe — invoked hop by hop so the lab can stream each runnable.
chain = (
    {"context": retriever | RunnableLambda(_format_docs), "question": RunnablePassthrough()}
    | prompt
    | llm
    | RunnableLambda(_parse_output)
)


@router.post("/run")
def run(body: RunBody) -> StreamingResponse:
    if not store.ready:
        raise HTTPException(status_code=503, detail="index_unavailable")

    def events():
        try:
            yield _sse("bind", {"pipe": PIPE, "question": body.question, "composed": type(chain).__name__})
            hits = retriever.invoke(body.question)
            yield _sse("retrieve", {"chunks": _public_chunks(hits)})
            prompt_value = prompt.invoke({"question": body.question, "context": _format_docs(hits)})
            formatted = prompt_value.to_string() if hasattr(prompt_value, "to_string") else str(prompt_value)
            yield _sse("template", {"prompt": formatted})
            raw = llm.invoke(prompt_value)
            yield _sse("invoke", {"raw": raw})
            parsed = _parse_output(raw)
            yield _sse("parse", {"parsed": parsed})
            yield _sse("done", {})
        except OllamaError:
            yield _sse("error", {}, detail="ollama_unavailable")

    return StreamingResponse(events(), media_type="text/event-stream")


def _sse(node: str, update: dict[str, Any], detail: Optional[str] = None) -> str:
    payload: dict[str, Any] = {"node": node}
    if update:
        payload["update"] = update
    if detail:
        payload["detail"] = detail
    return f"data: {json.dumps(payload)}\n\n"
