"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, friendlyError } from "@/lib/api";

type Chunk = { id: string; source: string; text: string };
type Neighbor = Chunk & { distance: number | null };

const SAMPLES = [
  "Why keep prompts off disk?",
  "What is a vector embedding?",
  "How does a graph of steps work?",
  "What happens when retrieval is messy?",
];

export function VectorPanel() {
  const [query, setQuery] = useState(SAMPLES[0]);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [neighbors, setNeighbors] = useState<Neighbor[]>([]);
  const [queryVector, setQueryVector] = useState<number[]>([]);
  const [embedder, setEmbedder] = useState("");
  const [dim, setDim] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ ready: boolean; chunks: Chunk[]; embedder: string; dim: number }>("/labs/vector-db/preview")
      .then((data) => {
        setReady(data.ready);
        setChunks(data.chunks);
        setEmbedder(data.embedder);
        setDim(data.dim);
      })
      .catch((err) => setError(friendlyError(err)));
  }, []);

  async function runQuery(next: string) {
    setBusy(true);
    setError("");
    try {
      const data = await api<{
        neighbors: Neighbor[];
        query_vector: number[];
        embedder: string;
        dim: number;
      }>("/labs/vector-db/query", {
        method: "POST",
        body: JSON.stringify({ query: next, k: 4 }),
      });
      setNeighbors(data.neighbors);
      setQueryVector(data.query_vector);
      setEmbedder(data.embedder);
      setDim(data.dim);
      setReady(true);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void runQuery(query);
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--ink-muted)]">
        This example runs entirely in the API process. It does not call Llama or any other model.
        {embedder ? (
          <>
            {" "}
            Embedder: <span className="font-mono text-xs text-[var(--ink)]">{embedder}</span>
            {dim ? ` · ${dim} dimensions` : ""}.
          </>
        ) : null}
      </p>
      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((sample) => (
          <button
            key={sample}
            type="button"
            className="chip hover:bg-white hover:text-[var(--ink)]"
            onClick={() => {
              setQuery(sample);
              void runQuery(sample);
            }}
          >
            {sample}
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm font-semibold" htmlFor="vector-query">
          Query the local index
        </label>
        <input
          id="vector-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="field"
        />
        <button type="submit" disabled={busy} className="btn-accent">
          {busy ? "Searching…" : "Find neighbors"}
        </button>
      </form>
      {error ? (
        <p className="rounded-lg bg-[var(--danger-soft)] px-3 py-2.5 text-sm text-[var(--danger)]">{error}</p>
      ) : null}
      <p className="text-sm font-medium text-[var(--ink)]">
        {ready ? "Hashed n-gram index is in memory. No Ollama required." : "Waiting for the local API on 127.0.0.1:8000."}
      </p>
      {queryVector.length > 0 ? (
        <p className="font-mono text-xs leading-relaxed text-[var(--ink-muted)]">
          query vector (first 12): [{queryVector.join(", ")}…]
        </p>
      ) : null}
      {neighbors.length > 0 ? (
        <ol className="space-y-3">
          {neighbors.map((item) => {
            const closeness = item.distance == null ? 0 : Math.max(0, Math.min(1, 1 - item.distance));
            return (
              <li key={item.id} className="rounded-lg border border-[var(--line)] bg-white/70 p-3">
                <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-[var(--line)]/50">
                  <div className="h-full bg-[var(--accent)]" style={{ width: `${Math.round(closeness * 100)}%` }} />
                </div>
                <p className="font-mono text-xs text-[var(--ink-muted)]">
                  {item.source} · distance {item.distance?.toFixed(3) ?? "—"}
                </p>
                <p className="mt-2 text-sm leading-relaxed">{item.text}</p>
              </li>
            );
          })}
        </ol>
      ) : (
        <ol className="space-y-3 text-sm leading-relaxed text-[var(--ink-muted)]">
          {chunks.map((item) => (
            <li key={item.id}>
              <strong className="text-[var(--ink)]">{item.source}:</strong> {item.text}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
