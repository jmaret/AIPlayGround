"use client";

import { FormEvent, useRef, useState } from "react";
import { SampleChips, StaticDemoNote } from "@/components/lab/SampleChips";
import { PipelineTrace } from "@/components/lab/PipelineTrace";
import { api, friendlyError } from "@/lib/api";
import { loadFixture, matchQuery, questionsFor } from "@/lib/fixtures";
import { replaySequence } from "@/lib/replay";
import { STATIC_DEMO } from "@/lib/static-mode";
import { RagInspector } from "./inspector";
import { RAG_JOBS, RAG_STEPS, RAG_TWINS, isRagStep, type RagStep } from "./pipeline";

type Citation = { id: string; source: string; text: string; distance: number | null };
type RagFixture = { answer: string; citations: Citation[] };

const SAMPLES = questionsFor("rag");

export function RagPanel() {
  const [question, setQuestion] = useState(SAMPLES[0]);
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [revealed, setRevealed] = useState<RagStep[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<RagStep | null>(null);
  const [follow, setFollow] = useState(true);
  const runId = useRef(0);

  const completed = revealed;
  const running = busy ? (RAG_STEPS.find((name) => !completed.includes(name)) ?? null) : null;
  const failed = error && !busy ? (RAG_STEPS.find((name) => !completed.includes(name)) ?? null) : null;
  const lastDone = completed.at(-1);
  const selected = follow ? (lastDone && isRagStep(lastDone) ? lastDone : null) : picked;

  async function playFixture(data: RagFixture, my: number) {
    await replaySequence(
      [...RAG_STEPS],
      (step) => {
        setRevealed((current) => (current.includes(step) ? current : [...current, step]));
        if (step === "retrieve" || step === "ground" || step === "cite") {
          setCitations(data.citations);
        }
        if (step === "generate" || step === "cite") {
          setAnswer(data.answer);
        }
      },
      (step) => step,
      () => runId.current === my,
    );
  }

  async function runQuestion(next: string) {
    const my = ++runId.current;
    setBusy(true);
    setError("");
    setAnswer("");
    setCitations([]);
    setRevealed([]);
    setPicked(null);
    setFollow(true);
    try {
      if (STATIC_DEMO) {
        const match = matchQuery("rag", next);
        if (!match) {
          throw new Error("static_sample_only");
        }
        const data = await loadFixture<RagFixture>("rag", match.id);
        await playFixture(data, my);
      } else {
        const data = await api<RagFixture>("/labs/rag/ask", {
          method: "POST",
          body: JSON.stringify({ question: next }),
        });
        if (runId.current !== my) return;
        await playFixture(data, my);
      }
    } catch (err) {
      if (runId.current !== my) return;
      const code = err instanceof Error ? err.message : "request_failed";
      setError(code === "static_sample_only" ? staticOnlyMessage() : friendlyError(err));
    } finally {
      if (runId.current === my) setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void runQuestion(question);
  }

  return (
    <div className="space-y-8">
      {STATIC_DEMO ? <StaticDemoNote /> : null}
      <SampleChips
        samples={SAMPLES}
        disabled={busy}
        onPick={(sample) => {
          setQuestion(sample);
          void runQuestion(sample);
        }}
      />
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
          disabled={STATIC_DEMO}
        />
        <button type="submit" disabled={busy} className="btn-accent">
          {busy ? "Retrieving…" : "Ask with citations"}
        </button>
      </form>
      {error ? <p className="rounded-lg bg-[var(--danger-soft)] px-3 py-2.5 text-sm text-[var(--danger)]">{error}</p> : null}
      <PipelineTrace
        steps={RAG_STEPS.map((id) => ({ id, label: id, job: RAG_JOBS[id] }))}
        twins={RAG_TWINS}
        completed={completed}
        running={running}
        failed={failed}
        selected={selected}
        onSelect={(id) => {
          if (!isRagStep(id)) return;
          setPicked(id);
          setFollow(false);
        }}
        startDetail="accept the question"
        endDetail="return answer + cites"
        architectureHref="/labs/rag/architecture"
      />
      <RagInspector step={selected} running={running} question={question} answer={answer} citations={citations} />
    </div>
  );
}

function staticOnlyMessage() {
  return "This GitHub Pages demo only replays the sample questions. Clone the repo and run make dev for live Ollama.";
}
