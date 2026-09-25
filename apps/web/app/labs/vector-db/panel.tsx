"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { SampleChips, StaticDemoNote } from "@/components/lab/SampleChips";
import { PipelineTrace } from "@/components/lab/PipelineTrace";
import { api, friendlyError } from "@/lib/api";
import { replaySequence } from "@/lib/replay";
import { STATIC_DEMO } from "@/lib/static-mode";
import { buildVectorIndex, queryVectorIndex } from "@/lib/vector-browser";
import { VECTOR_CARDS } from "@/lib/vector-cards";
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
  const browserIndex = useMemo(() => (STATIC_DEMO ? buildVectorIndex(VECTOR_CARDS) : null), []);
  const [query, setQuery] = useState(SAMPLES[0]);
  const [chunks, setChunks] = useState<Chunk[]>(browserIndex?.chunks ?? []);
  const [neighbors, setNeighbors] = useState<Neighbor[]>([]);
  const [queryVector, setQueryVector] = useState<number[]>([]);
  const [embedder, setEmbedder] = useState(browserIndex?.embedder ?? "");
  const [dim, setDim] = useState(browserIndex?.dim ?? 0);
  const [ready, setReady] = useState(Boolean(browserIndex));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<VectorStep | null>(null);
  const [follow, setFollow] = useState(true);
  const [searchSteps, setSearchSteps] = useState<VectorStep[]>([]);
  const runId = useRef(0);

  const warm = ready ? (["ingest", "hash", "index"] satisfies VectorStep[]) : [];
  const completed: string[] = [...warm, ...searchSteps];
  const running = busy ? (searchSteps.includes("query") ? "rank" : "query") : null;
  const failed = error && !busy ? "query" : null;
  const lastDone = completed.at(-1);
  const selected = follow ? (lastDone && isVectorStep(lastDone) ? lastDone : null) : picked;

  useEffect(() => {
    if (STATIC_DEMO) return;
    api<{ ready: boolean; chunks: Chunk[]; embedder: string; dim: number }>("/labs/vector-db/preview")
      .then((data) => {
        setReady(data.ready);
        setChunks(data.chunks);
        setEmbedder(data.embedder);
        setDim(data.dim);
      })
      .catch((err) => setError(friendlyError(err)));
  }, []);

  async function applyResult(data: { neighbors: Neighbor[]; query_vector: number[]; embedder: string; dim: number }, my: number) {
    if (STATIC_DEMO) {
      await replaySequence(
        ["query", "rank"] as const,
        (step) => {
          if (step === "query") {
            setQueryVector(data.query_vector);
            setEmbedder(data.embedder);
            setDim(data.dim);
          } else {
            setNeighbors(data.neighbors);
          }
          setSearchSteps((current) => (current.includes(step) ? current : [...current, step]));
        },
        (step) => step,
        () => runId.current === my,
      );
      return;
    }
    setNeighbors(data.neighbors);
    setQueryVector(data.query_vector.slice(0, 12));
    setEmbedder(data.embedder);
    setDim(data.dim);
    setReady(true);
    setSearchSteps(["query", "rank"]);
  }

  async function runQuery(next: string) {
    const my = ++runId.current;
    setBusy(true);
    setError("");
    setPicked(null);
    setFollow(true);
    setNeighbors([]);
    setQueryVector([]);
    setSearchSteps([]);
    try {
      if (browserIndex) {
        const data = queryVectorIndex(browserIndex, next, 4);
        await applyResult(data, my);
        return;
      }
      const data = await api<{
        neighbors: Neighbor[];
        query_vector: number[];
        embedder: string;
        dim: number;
      }>("/labs/vector-db/query", {
        method: "POST",
        body: JSON.stringify({ query: next, k: 4 }),
      });
      if (runId.current !== my) return;
      await applyResult(data, my);
    } catch (err) {
      if (runId.current !== my) return;
      setError(friendlyError(err));
    } finally {
      if (runId.current === my) setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void runQuery(query);
  }

  return (
    <div className="space-y-6">
      {STATIC_DEMO ? <StaticDemoNote /> : null}
      <p className="text-sm text-[var(--ink-muted)]">
        {STATIC_DEMO
          ? "This example hashes in your browser. It does not call the local API or Llama."
          : "This example runs entirely in the API process. It does not call Llama or any other model."}
        {embedder ? (
          <>
            {" "}
            Embedder: <span className="font-mono text-xs text-[var(--ink)]">{embedder}</span>
            {dim ? ` · ${dim} dimensions` : ""}.
          </>
        ) : null}
      </p>
      <SampleChips
        samples={SAMPLES}
        disabled={busy}
        onPick={(sample) => {
          setQuery(sample);
          void runQuery(sample);
        }}
      />
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm font-semibold" htmlFor="vector-query">
          Query the {STATIC_DEMO ? "in-browser" : "local"} index
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
        architectureHref="/labs/vector-db/architecture"
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
