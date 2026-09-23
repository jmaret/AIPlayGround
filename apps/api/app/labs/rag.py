from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.providers.ollama import OllamaError, OllamaProvider
from app.store import store

router = APIRouter(prefix="/labs/rag", tags=["rag"])
provider = OllamaProvider()


class AskBody(BaseModel):
    question: str = Field(min_length=3, max_length=500)
    k: int = Field(default=4, ge=1, le=6)


PROMPT = """You answer only from the numbered passages. If they are not enough, say you do not know.
Cite sources as [filename] after the sentence they support. Do not invent files.

Question:
{question}

Passages:
{passages}
"""


@router.post("/ask")
def ask(body: AskBody) -> dict[str, object]:
    try:
        neighbors = store.query(provider, body.question, body.k)
        passages = "\n\n".join(
            f"[{index + 1}] ({item['source']}) {item['text']}"
            for index, item in enumerate(neighbors)
        )
        answer = provider.generate(PROMPT.format(question=body.question, passages=passages))
    except OllamaError as exc:
        raise HTTPException(status_code=503, detail="ollama_unavailable") from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"question": body.question, "answer": answer, "citations": neighbors}
