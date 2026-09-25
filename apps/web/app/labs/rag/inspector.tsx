"use client";

import { NeighborCards, StepInspector } from "@/components/lab/StepInspector";
import { RAG_JOBS, type RagStep } from "./pipeline";

type Citation = { id: string; source: string; text: string; distance: number | null };

type RagInspectorProps = {
  step: RagStep | null;
  running: string | null;
  question: string;
  answer: string;
  citations: Citation[];
};

export function RagInspector({ step, running, question, answer, citations }: RagInspectorProps) {
  const hasRun = Boolean(answer || citations.length);
  if (!step) {
    return (
      <StepInspector
        eyebrow="output"
        title="Step output"
        empty={running ? `${running} is running — ${running === "embed" ? "vector the question" : RAG_JOBS[running as RagStep] ?? "working"}.` : "Ask the corpus — steps light when the answer returns. Click a finished step to inspect it."}
      />
    );
  }

  if (!hasRun && step !== "embed") {
    return <StepInspector eyebrow={step} title={RAG_JOBS[step]} empty="Run a question to fill this step." />;
  }

  return (
    <StepInspector eyebrow={step} title={RAG_JOBS[step]} raw={rawFor(step, { question, answer, citations })}>
      {bodyFor(step, { question, answer, citations })}
    </StepInspector>
  );
}

function bodyFor(step: RagStep, data: { question: string; answer: string; citations: Citation[] }) {
  if (step === "embed") {
    return (
      <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
        The question is embedded by Ollama (<span className="font-mono text-[var(--ink)]">nomic-embed-text</span>) so it
        can be compared to Chroma. This lab does not return the raw vector — only the hops after it.
      </p>
    );
  }
  if (step === "retrieve") {
    return <NeighborCards items={data.citations} />;
  }
  if (step === "ground") {
    return (
      <div className="space-y-2 text-sm leading-relaxed text-[var(--ink-muted)]">
        <p>The generate prompt is allowed only these passages. If they cannot support an answer, the model must say it does not know.</p>
        <ol className="list-decimal space-y-1 pl-4">
          {data.citations.map((item) => (
            <li key={item.id}>
              <span className="font-mono text-xs">{item.source}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  if (step === "generate") {
    return (
      <div className="rounded-md bg-[var(--success-soft)] px-3 py-2.5">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]">{data.answer || "—"}</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--ink-muted)]">Citations the model was given — and should mark as [filename].</p>
      <NeighborCards items={data.citations} />
    </div>
  );
}

function rawFor(step: RagStep, data: { question: string; answer: string; citations: Citation[] }) {
  if (step === "generate") return { answer: data.answer };
  if (step === "embed") return { question: data.question };
  return { citations: data.citations };
}
