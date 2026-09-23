from typing import Protocol


class Provider(Protocol):
    name: str
    chat_model: str
    embed_model: str

    def embed(self, text: str) -> list[float]: ...

    def generate(self, prompt: str) -> str: ...

    def ping(self) -> dict[str, object]: ...
