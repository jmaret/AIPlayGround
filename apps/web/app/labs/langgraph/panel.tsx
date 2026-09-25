"use client";

import { FormEvent, useState } from "react";
import { API_URL, friendlyError } from "@/lib/api";

type EventItem = { node: string; update?: Record<string, unknown>; detail?: string };

export function GraphPanel() {
  const [question, setQuestion] = useState("How does a graph make the control flow visible?");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setEvents([]);
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
          const parsed = JSON.parse(line) as EventItem;
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
      <ol className="space-y-3">
        {events.map((item, index) => (
          <li key={`${item.node}-${index}`} className="rounded-lg border border-[var(--line)] bg-white/70 p-3">
            <p className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">{item.node}</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--ink-muted)]">
              {JSON.stringify(item.update ?? {}, null, 2)}
            </pre>
          </li>
        ))}
      </ol>
    </div>
  );
}
