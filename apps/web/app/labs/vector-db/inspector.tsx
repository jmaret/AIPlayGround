"use client";

import { NeighborCards, StepInspector } from "@/components/lab/StepInspector";
import { VECTOR_JOBS, type VectorStep } from "./pipeline";

type Chunk = { id: string; source: string; text: string };
type Neighbor = Chunk & { distance: number | null };

type VectorInspectorProps = {
  step: VectorStep | null;
  running: string | null;
  chunks: Chunk[];
  neighbors: Neighbor[];
  queryVector: number[];
  embedder: string;
  dim: number;
  ready: boolean;
};

export function VectorInspector({
  step,
  running,
  chunks,
  neighbors,
  queryVector,
  embedder,
  dim,
  ready,
}: VectorInspectorProps) {
  if (!step) {
    return (
      <StepInspector
        eyebrow="output"
        title="Step output"
        empty={
          running
            ? `${running} is running.`
            : ready
              ? "Index is warm. Run a query — or click ingest, hash, or index."
              : "Waiting for the hashed index (local API or in-browser)."
        }
      />
    );
  }

  const raw = rawFor(step, { chunks, neighbors, queryVector, embedder, dim, ready });

  return (
    <StepInspector eyebrow={step} title={VECTOR_JOBS[step]} raw={raw}>
      {bodyFor(step, { chunks, neighbors, queryVector, embedder, dim, ready })}
    </StepInspector>
  );
}

function bodyFor(
  step: VectorStep,
  data: { chunks: Chunk[]; neighbors: Neighbor[]; queryVector: number[]; embedder: string; dim: number; ready: boolean },
) {
  if (step === "ingest") {
    return (
      <ol className="space-y-2 text-sm leading-relaxed">
        {data.chunks.map((item) => (
          <li key={item.id}>
            <strong className="text-[var(--ink)]">{item.source}:</strong>{" "}
            <span className="text-[var(--ink-muted)]">{item.text}</span>
          </li>
        ))}
      </ol>
    );
  }
  if (step === "hash") {
    return (
      <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
        Each card became a <span className="font-mono text-[var(--ink)]">{data.dim || 64}</span>-dimension vector from
        hashed content words (stopwords dropped, signed bins, L2-normalized). Embedder:{" "}
        <span className="font-mono text-[var(--ink)]">{data.embedder || "hashed-ngram"}</span>. This is a teaching
        stand-in for Titan or nomic-embed-text.
      </p>
    );
  }
  if (step === "index") {
    return (
      <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
        {data.ready
          ? `${data.chunks.length} vectors sit in process memory (LocalVectorIndex). Restart wipes them. Nothing is written to disk.`
          : "The local API has not finished building the in-memory index."}
      </p>
    );
  }
  if (step === "query") {
    if (data.queryVector.length === 0) {
      return <p className="text-sm text-[var(--ink-muted)]">Run a query to see the first dimensions.</p>;
    }
    return (
      <p className="font-mono text-xs leading-relaxed text-[var(--ink-muted)]">
        query vector (first 12): [{data.queryVector.join(", ")}…]
      </p>
    );
  }
  return <NeighborCards items={data.neighbors} />;
}

function rawFor(
  step: VectorStep,
  data: { chunks: Chunk[]; neighbors: Neighbor[]; queryVector: number[]; embedder: string; dim: number; ready: boolean },
) {
  if (step === "ingest") return { chunks: data.chunks };
  if (step === "hash" || step === "index") return { embedder: data.embedder, dim: data.dim, ready: data.ready, count: data.chunks.length };
  if (step === "query") return { query_vector: data.queryVector };
  return { neighbors: data.neighbors };
}
