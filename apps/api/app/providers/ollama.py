import httpx

from app.config import settings


class OllamaError(RuntimeError):
    pass


class OllamaProvider:
    name = "ollama"

    def __init__(self) -> None:
        self.base_url = settings.ollama_base_url.rstrip("/")
        self.chat_model = settings.ollama_chat_model
        self.embed_model = settings.ollama_embed_model

    def ping(self) -> dict[str, object]:
        try:
            response = httpx.get(f"{self.base_url}/api/tags", timeout=3.0)
            response.raise_for_status()
            names = [item.get("name", "") for item in response.json().get("models", [])]
            missing = [
                model
                for model in (self.chat_model, self.embed_model)
                if not self._has_model(names, model)
            ]
            return {
                "ok": True,
                "models": names,
                "missing_models": missing,
                "chat_model": self.chat_model,
                "embed_model": self.embed_model,
            }
        except httpx.HTTPError:
            return {
                "ok": False,
                "models": [],
                "missing_models": [self.chat_model, self.embed_model],
                "chat_model": self.chat_model,
                "embed_model": self.embed_model,
            }

    @staticmethod
    def _has_model(names: list[str], wanted: str) -> bool:
        return any(name == wanted or name.startswith(f"{wanted}:") for name in names)

    def embed(self, text: str) -> list[float]:
        try:
            response = httpx.post(
                f"{self.base_url}/api/embed",
                json={"model": self.embed_model, "input": text},
                timeout=90.0,
            )
            if response.status_code == 404:
                response = httpx.post(
                    f"{self.base_url}/api/embeddings",
                    json={"model": self.embed_model, "prompt": text},
                    timeout=90.0,
                )
            response.raise_for_status()
            payload = response.json()
            if "embeddings" in payload:
                vectors = payload["embeddings"]
                return vectors[0] if vectors and isinstance(vectors[0], list) else vectors
            return payload["embedding"]
        except httpx.HTTPError as exc:
            raise OllamaError("Ollama embeddings are unavailable") from exc

    def generate(self, prompt: str) -> str:
        try:
            response = httpx.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": self.chat_model,
                    "stream": False,
                    "messages": [{"role": "user", "content": prompt}],
                },
                timeout=180.0,
            )
            response.raise_for_status()
            return response.json()["message"]["content"]
        except httpx.HTTPError as exc:
            raise OllamaError("Ollama generation is unavailable") from exc
