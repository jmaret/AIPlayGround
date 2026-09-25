"use client";

import { FormEvent, useState } from "react";
import { PipelineTrace } from "@/components/lab/PipelineTrace";
import { api, friendlyError } from "@/lib/api";
import { RagInspector } from "./inspector";
import { RAG_JOBS, RAG_STEPS, RAG_TWINS, isRagStep, type RagStep } from "./pipeline";

type Citation = { id: string; source: string; text: string; distance: number | null };

export function RagPanel() {
  const [question, setQuestion] = useState("What does RAG do when the corpus does not have the fact?");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<RagStep | null>(null);
  const [follow, setFollow] = useState(true);

  const hasRun = Boolean(answer || citations.length);
  const completed: string[] = hasRun ? [...RAG_STEPS] : [];
  const running = busy ? "embed" : null;
  const failed = error && !busy ? "embed" : null;
  const lastDone = completed.at(-1);
  const selected = follow ? (lastDone && isRagStep(lastDone) ? lastDone : null) : picked;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setAnswer("");
    setCitations([]);
    setPicked(null);
    setFollow(true);
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
        mapHint="Adjacent map: how this step could run at AWS scale. This lab still uses Ollama on localhost — no cloud keys, no prompts leave the machine."
        mapAbout="Each strip is a static picture of production RAG: Titan embed, Bedrock Knowledge Bases, OpenSearch, Claude or Llama generate, Guardrails. This playground uses Ollama + in-memory Chroma. Hover or click any dotted label or card."
      />
      <RagInspector step={selected} running={running} question={question} answer={answer} citations={citations} />
    </div>
  );
}
