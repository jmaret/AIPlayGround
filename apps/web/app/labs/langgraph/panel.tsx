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
          className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-3"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-ink px-5 py-2.5 font-semibold text-cream disabled:opacity-60"
        >
          {busy ? "Streaming nodes…" : "Stream the nodes"}
        </button>
      </form>
      {error ? <p className="rounded-2xl bg-blush/70 px-4 py-3">{error}</p> : null}
      <ol className="space-y-4">
        {events.map((item, index) => (
          <li key={`${item.node}-${index}`} className="rounded-2xl bg-butter/70 p-4">
            <p className="font-display text-2xl font-bold">{item.node}</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-sm leading-relaxed">
              {JSON.stringify(item.update ?? {}, null, 2)}
            </pre>
          </li>
        ))}
      </ol>
    </div>
  );
}
