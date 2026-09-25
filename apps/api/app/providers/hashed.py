import hashlib
import math
import re

DIM = 64
TOKEN = re.compile(r"[a-z0-9]+")
STOP = {
    "a",
    "an",
    "and",
    "does",
    "for",
    "how",
    "in",
    "is",
    "of",
    "on",
    "or",
    "the",
    "to",
    "what",
    "when",
    "why",
}


def hashed_ngram_embed(text: str, dim: int = DIM) -> list[float]:
    """Local, deterministic embedding. No Ollama. Content words hashed into `dim` bins."""
    vec = [0.0] * dim
    tokens = [token for token in TOKEN.findall(text.lower()) if token not in STOP]
    if not tokens:
        return vec
    for token in tokens:
        digest = hashlib.blake2b(token.encode("utf-8"), digest_size=8).digest()
        slot = int.from_bytes(digest[:4], "little") % dim
        sign = 1.0 if digest[4] & 1 else -1.0
        vec[slot] += sign
    norm = math.sqrt(sum(value * value for value in vec)) or 1.0
    return [value / norm for value in vec]


def cosine_distance(left: list[float], right: list[float]) -> float:
    return 1.0 - sum(a * b for a, b in zip(left, right))
