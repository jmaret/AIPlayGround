#!/usr/bin/env python3
"""Record canned RAG / LangChain / LangGraph / refill runs for the GitHub Pages demo."""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUERIES = ROOT / "apps/web/lib/lab-queries.json"
OUT = ROOT / "apps/web/public/fixtures"
API = "http://localhost:8000"


def _request(method, path, body=None):
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        f"{API}{path}",
        data=data,
        method=method,
        headers={"Content-Type": "application/json"} if body is not None else {},
    )
    try:
        with urllib.request.urlopen(req, timeout=240) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read()


def _require_api() -> None:
    try:
        status, raw = _request("GET", "/health")
    except urllib.error.URLError as exc:
        raise SystemExit(f"API is not reachable on {API}. From AIPlayGround run: make api\n{exc}") from exc
    if status != 200:
        raise SystemExit(f"API /health failed: {status} {raw[:200]!r}")
    status, raw = _request("GET", "/ready")
    if status != 200:
        raise SystemExit(f"API /ready failed (need Ollama + index): {status} {raw[:400]!r}")


def _parse_sse(raw: bytes) -> list[dict]:
    events: list[dict] = []
    for block in raw.decode("utf-8").split("\n\n"):
        line = block.strip()
        if line.startswith("data: "):
            line = line[6:]
        if not line:
            continue
        payload = json.loads(line)
        if payload.get("node") == "error":
            raise SystemExit(f"Lab stream error: {payload}")
        if payload.get("node") != "done":
            events.append(payload)
    return events


def _write(lab: str, item_id: str, payload: dict) -> None:
    folder = OUT / lab
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / f"{item_id}.json"
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)}")


def main() -> None:
    _require_api()
    catalog = json.loads(QUERIES.read_text(encoding="utf-8"))

    for item in catalog["rag"]:
        status, raw = _request("POST", "/labs/rag/ask", {"question": item["question"]})
        if status != 200:
            raise SystemExit(f"RAG failed for {item['id']}: {status} {raw[:400]!r}")
        body = json.loads(raw)
        _write(
            "rag",
            item["id"],
            {
                "id": item["id"],
                "question": item["question"],
                "answer": body.get("answer", ""),
                "citations": body.get("citations", []),
            },
        )

    for item in catalog["langchain"]:
        status, raw = _request("POST", "/labs/langchain/run", {"question": item["question"]})
        if status != 200:
            raise SystemExit(f"LangChain failed for {item['id']}: {status} {raw[:400]!r}")
        _write(
            "langchain",
            item["id"],
            {"id": item["id"], "question": item["question"], "events": _parse_sse(raw)},
        )

    for item in catalog["langgraph"]:
        status, raw = _request("POST", "/labs/langgraph/run", {"question": item["question"]})
        if status != 200:
            raise SystemExit(f"LangGraph failed for {item['id']}: {status} {raw[:400]!r}")
        events = _parse_sse(raw)
        route = next(
            (
                ev.get("update", {}).get("route")
                for ev in events
                if ev.get("node") == "route" and isinstance(ev.get("update"), dict)
            ),
            None,
        )
        _write(
            "langgraph",
            item["id"],
            {
                "id": item["id"],
                "question": item["question"],
                "route": route,
                "events": events,
            },
        )

    for item in catalog["refill"]:
        body = {"question": item["question"]}
        if item.get("decision"):
            body["decision"] = item["decision"]
        status, raw = _request("POST", "/labs/refill/run", body)
        if status != 200:
            raise SystemExit(f"Refill failed for {item['id']}: {status} {raw[:400]!r}")
        events = _parse_sse(raw)
        path = next(
            (
                ev.get("update", {}).get("path")
                for ev in events
                if ev.get("node") == "decide" and isinstance(ev.get("update"), dict)
            ),
            item.get("path"),
        )
        payload = {
            "id": item["id"],
            "question": item["question"],
            "path": path,
            "events": events,
        }
        if item.get("decision"):
            payload["decision"] = item["decision"]
        _write("refill", item["id"], payload)

    print("fixtures recorded")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
