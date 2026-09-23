"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, friendlyError } from "@/lib/api";

type Chunk = { id: string; source: string; text: string };
type Neighbor = Chunk & { distance: number | null };

export function VectorPanel() {
  const [query, setQuery] = useState("Why keep prompts off disk?");
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [neighbors, setNeighbors] = useState<Neighbor[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ ready: boolean; chunks: Chunk[] }>("/labs/vector-db/preview")
      .then((data) => {
        setReady(data.ready);
        setChunks(data.chunks);
      })
      .catch((err) => setError(friendlyError(err)));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api<{ neighbors: Neighbor[] }>("/labs/vector-db/query", {
        method: "POST",
        body: JSON.stringify({ query, k: 4 }),
      });
      setNeighbors(data.neighbors);
      setReady(true);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm font-semibold" htmlFor="vector-query">
          Query the local index
        </label>
        <input
          id="vector-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-3"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-ink px-5 py-2.5 font-semibold text-cream disabled:opacity-60"
        >
          {busy ? "Searching…" : "Find neighbors"}
        </button>
      </form>
      {error ? <p className="rounded-2xl bg-blush/70 px-4 py-3">{error}</p> : null}
      <p className="text-sm font-semibold">{ready ? "Index is in memory." : "Index is not ready yet."}</p>
      {neighbors.length > 0 ? (
        <ol className="space-y-4">
          {neighbors.map((item) => (
            <li key={item.id} className="rounded-2xl bg-sky/40 p-4">
              <p className="text-sm font-semibold">
                {item.source} · distance {item.distance?.toFixed(3) ?? "—"}
              </p>
              <p className="mt-2 leading-relaxed">{item.text}</p>
            </li>
          ))}
        </ol>
      ) : (
        <ol className="space-y-3 text-sm leading-relaxed text-ink/80">
          {chunks.map((item) => (
            <li key={item.id}>
              <strong>{item.source}:</strong> {item.text.slice(0, 180)}…
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
