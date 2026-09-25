"use client";

import { FormEvent, useEffect, useState } from "react";
import { PipelineTrace } from "@/components/lab/PipelineTrace";
import { api, friendlyError } from "@/lib/api";
import { VectorInspector } from "./inspector";
import { VECTOR_JOBS, VECTOR_STEPS, VECTOR_TWINS, isVectorStep, type VectorStep } from "./pipeline";

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
  const [picked, setPicked] = useState<VectorStep | null>(null);
  const [follow, setFollow] = useState(true);

  const warm = ready ? (["ingest", "hash", "index"] satisfies VectorStep[]) : [];
  const searched = queryVector.length > 0 || neighbors.length > 0;
  const completed: string[] = searched ? [...warm, "query", "rank"] : [...warm];
  const running = busy ? "query" : null;
  const failed = error && !busy ? "query" : null;
  const lastDone = completed.at(-1);
  const selected = follow ? (lastDone && isVectorStep(lastDone) ? lastDone : null) : picked;

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
    setPicked(null);
    setFollow(true);
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
      setQueryVector(data.query_vector.slice(0, 12));
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
        <input id="vector-query" value={query} onChange={(event) => setQuery(event.target.value)} className="field" />
        <button type="submit" disabled={busy} className="btn-accent">
          {busy ? "Searching…" : "Find neighbors"}
        </button>
      </form>
      {error ? <p className="rounded-lg bg-[var(--danger-soft)] px-3 py-2.5 text-sm text-[var(--danger)]">{error}</p> : null}
      <PipelineTrace
        steps={VECTOR_STEPS.map((id) => ({ id, label: id, job: VECTOR_JOBS[id] }))}
        twins={VECTOR_TWINS}
        completed={completed}
        running={running}
        failed={failed}
        selected={selected}
        chips={{ hash: dim ? `${dim}-d` : null, query: dim ? `${dim}-d` : null }}
        onSelect={(id) => {
          if (!isVectorStep(id)) return;
          setPicked(id);
          setFollow(false);
        }}
        startDetail="accept the query"
        endDetail="return neighbors"
        mapHint="Adjacent map: how this step could run at AWS scale. This lab still hashes in-process — no Bedrock, no Ollama."
        mapAbout="Each strip is a static picture of a production vector path: S3 corpus, Titan embeddings, OpenSearch Serverless, k-NN. This playground uses hashed word tokens in RAM. Hover or click any dotted label or card. No AWS keys, no prompts leave the machine."
      />
      <VectorInspector
        step={selected}
        running={running}
        chunks={chunks}
        neighbors={neighbors}
        queryVector={queryVector}
        embedder={embedder}
        dim={dim}
        ready={ready}
      />
    </div>
  );
}
