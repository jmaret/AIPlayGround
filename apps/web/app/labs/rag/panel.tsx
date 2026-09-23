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
          className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-3"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-ink px-5 py-2.5 font-semibold text-cream disabled:opacity-60"
        >
          {busy ? "Retrieving…" : "Ask with citations"}
        </button>
      </form>
      {error ? <p className="rounded-2xl bg-blush/70 px-4 py-3">{error}</p> : null}
      {answer ? (
        <div className="rounded-2xl bg-blush/50 p-5">
          <p className="text-sm font-semibold">Answer</p>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed">{answer}</p>
        </div>
      ) : null}
      {citations.length > 0 ? (
        <ol className="space-y-4">
          {citations.map((item) => (
            <li key={item.id} className="rounded-2xl bg-cream p-4">
              <p className="text-sm font-semibold">
                {item.source} · distance {item.distance?.toFixed(3) ?? "—"}
              </p>
              <p className="mt-2 leading-relaxed">{item.text}</p>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
