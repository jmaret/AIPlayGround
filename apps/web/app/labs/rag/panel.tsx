"use client";

import { FormEvent, useState } from "react";
import { api, friendlyError } from "@/lib/api";

type Citation = { id: string; source: string; text: string; distance: number | null };

export function RagPanel() {
  const [question, setQuestion] = useState("What does RAG do when the corpus does not have the fact?");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api<{ answer: string; citations: Citation[] }>("/labs/rag/ask", {
        method: "POST",
        body: JSON.stringify({ question }),
      });
      setAnswer(data.answer);
      setCitations(data.citations);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm font-semibold" htmlFor="rag-question">
          Ask the corpus
        </label>
        <textarea
          id="rag-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={3}
          className="field"
        />
        <button type="submit" disabled={busy} className="btn-accent">
          {busy ? "Retrieving…" : "Ask with citations"}
        </button>
      </form>
      {error ? <p className="rounded-lg bg-[var(--danger-soft)] px-3 py-2.5 text-sm text-[var(--danger)]">{error}</p> : null}
      {answer ? (
        <div className="rounded-lg border border-[var(--line)] bg-[var(--success-soft)] p-4">
          <p className="text-sm font-semibold text-[var(--ink)]">Answer</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
        </div>
      ) : null}
      {citations.length > 0 ? (
        <ol className="space-y-3">
          {citations.map((item) => (
            <li key={item.id} className="rounded-lg border border-[var(--line)] bg-white/70 p-3">
              <p className="font-mono text-xs text-[var(--ink-muted)]">
                {item.source} · distance {item.distance?.toFixed(3) ?? "—"}
              </p>
              <p className="mt-2 text-sm leading-relaxed">{item.text}</p>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
