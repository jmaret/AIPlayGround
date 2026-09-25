from __future__ import annotations

import time
from threading import Lock
from typing import Any
from uuid import uuid4


class EphemeralStore:
    """Process-memory only. Dies on restart. Never write this to disk."""

    def __init__(self, ttl_seconds: int) -> None:
        self.ttl_seconds = ttl_seconds
        self._items: dict[str, tuple[float, Any]] = {}
        self._lock = Lock()

    def put(self, value: Any) -> str:
        key = uuid4().hex
        with self._lock:
            self._purge_locked()
            self._items[key] = (time.time(), value)
        return key

    def get(self, key: str) -> Any | None:
        with self._lock:
            self._purge_locked()
            item = self._items.get(key)
            return None if item is None else item[1]

    def pop(self, key: str) -> Any | None:
        with self._lock:
            self._purge_locked()
            item = self._items.pop(key, None)
            return None if item is None else item[1]

    def _purge_locked(self) -> None:
        now = time.time()
        expired = [key for key, (ts, _) in self._items.items() if now - ts > self.ttl_seconds]
        for key in expired:
            del self._items[key]
