"use client";

import { FormEvent, useMemo, useState } from "react";
import { API_URL, friendlyError } from "@/lib/api";
import { GraphTrace } from "./GraphTrace";
import { GRAPH_NODES, isGraphNode, type GraphEvent, type GraphNodeName } from "./graph";
import { NodeInspector } from "./NodeInspector";

export function GraphPanel() {
  const [question, setQuestion] = useState("How does a graph make the control flow visible?");
  const [events, setEvents] = useState<GraphEvent[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<GraphNodeName | null>(null);
  const [follow, setFollow] = useState(true);

  const completed = events.map((item) => item.node);
  const running = busy ? (GRAPH_NODES.find((name) => !completed.includes(name)) ?? null) : null;
  const failed = error && !busy ? (GRAPH_NODES.find((name) => !completed.includes(name)) ?? null) : null;
  const lastNode = events.at(-1)?.node;
  const selected = follow
    ? lastNode && isGraphNode(lastNode)
      ? lastNode
      : null
    : picked;
  const selectedEvent = useMemo(
    () => (selected ? (events.find((item) => item.node === selected) ?? null) : null),
    [events, selected],
  );
  const routeEvent = events.find((item) => item.node === "route");
  const routeLabel = typeof routeEvent?.update?.route === "string" ? routeEvent.update.route : null;

  function selectNode(node: GraphNodeName) {
    setPicked(node);
    setFollow(false);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setEvents([]);
    setPicked(null);
    setFollow(true);
    try {
      const response = await fetch(`${API_URL}/labs/langgraph/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(typeof payload.detail === "string" ? payload.detail : "request_failed");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.replace(/^data: /, "");
          if (!line) continue;
          const parsed = JSON.parse(line) as GraphEvent;
          if (parsed.node === "error") {
            setError(friendlyError(new Error(parsed.detail ?? "ollama_unavailable")));
          } else if (parsed.node !== "done") {
            setEvents((current) => [...current, parsed]);
          }
        }
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm font-semibold" htmlFor="graph-question">
          Run the graph
        </label>
        <textarea
          id="graph-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={3}
          className="field"
        />
        <button type="submit" disabled={busy} className="btn-accent">
          {busy ? "Streaming nodes…" : "Stream the nodes"}
        </button>
      </form>
      {error ? <p className="rounded-lg bg-[var(--danger-soft)] px-3 py-2.5 text-sm text-[var(--danger)]">{error}</p> : null}
      <GraphTrace
        completed={completed}
        running={running}
        failed={failed}
        selected={selected}
        routeLabel={routeLabel}
        onSelect={selectNode}
      />
      <NodeInspector event={selectedEvent} running={running} />
    </div>
  );
}
