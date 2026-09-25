"use client";

import { NeighborCards, StepInspector } from "@/components/lab/StepInspector";
import { CHAIN_JOBS, type ChainStep } from "./pipeline";

type Chunk = { source?: string; distance?: number | null; text?: string };
type ChainEvent = { node: string; update?: Record<string, unknown> };

type ChainInspectorProps = {
  step: ChainStep | null;
  running: string | null;
  event: ChainEvent | null;
};

export function ChainInspector({ step, running, event }: ChainInspectorProps) {
  if (!step || !event) {
    return (
      <StepInspector
        eyebrow="output"
        title="Runnable output"
        empty={
          running
            ? `${running} is running — ${CHAIN_JOBS[running as ChainStep] ?? "working"}.`
            : "Run the chain — hops light as each runnable finishes. Click a finished hop to inspect it."
        }
      />
    );
  }

  const update = event.update ?? {};
  return (
    <StepInspector eyebrow={step} title={CHAIN_JOBS[step]} raw={update}>
      {bodyFor(step, update)}
    </StepInspector>
  );
}

function bodyFor(step: ChainStep, update: Record<string, unknown>) {
  if (step === "bind") {
    const pipe = typeof update.pipe === "string" ? update.pipe : "retriever | prompt | llm | parser";
    const question = typeof update.question === "string" ? update.question : "";
    return (
      <div className="space-y-2 text-sm leading-relaxed">
        <p className="font-mono text-xs text-[var(--accent)]">{pipe}</p>
        <p className="text-[var(--ink-muted)]">
          A straight LCEL pipe, not a graph. Question bound as the retriever input.
        </p>
        {question ? <p className="text-[var(--ink)]">{question}</p> : null}
      </div>
    );
  }
  if (step === "retrieve") {
    return <NeighborCards items={asChunks(update.chunks)} />;
  }
  if (step === "template") {
    const prompt = typeof update.prompt === "string" ? update.prompt : "";
    return (
      <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--ink-muted)]">
        {prompt || "—"}
      </pre>
    );
  }
  if (step === "invoke") {
    const raw = typeof update.raw === "string" ? update.raw : "";
    return <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]">{raw || "—"}</p>;
  }
  const parsed = update.parsed && typeof update.parsed === "object" ? (update.parsed as Record<string, unknown>) : {};
  const answer = typeof parsed.answer === "string" ? parsed.answer : "";
  const grounded = parsed.grounded === true;
  const parseError = parsed.parse_error === true;
  return (
    <div className="space-y-3">
      {parseError ? (
        <p className="text-sm text-[var(--warn)]">Parser could not read JSON. Showing a fallback object.</p>
      ) : null}
      <div className={`rounded-md px-3 py-2.5 ${grounded ? "bg-[var(--success-soft)]" : "bg-[var(--warn-soft)]"}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          {grounded ? "grounded" : "not grounded"}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]">{answer || "—"}</p>
      </div>
    </div>
  );
}

function asChunks(value: unknown): Chunk[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (!item || typeof item !== "object") return {};
    const row = item as Record<string, unknown>;
    return {
      source: typeof row.source === "string" ? row.source : undefined,
      distance: typeof row.distance === "number" ? row.distance : null,
      text: typeof row.text === "string" ? row.text : undefined,
    };
  });
}
