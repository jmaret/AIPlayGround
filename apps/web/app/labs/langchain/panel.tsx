"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { SampleChips, StaticDemoNote } from "@/components/lab/SampleChips";
import { PipelineTrace } from "@/components/lab/PipelineTrace";
import { API_URL, friendlyError } from "@/lib/api";
import { loadFixture, matchQuery, questionsFor } from "@/lib/fixtures";
import { replaySequence } from "@/lib/replay";
import { STATIC_DEMO } from "@/lib/static-mode";
import { ChainInspector } from "./inspector";
import { CHAIN_JOBS, CHAIN_STEPS, CHAIN_TWINS, isChainStep, type ChainStep } from "./pipeline";

type ChainEvent = { node: string; update?: Record<string, unknown>; detail?: string };
type ChainFixture = { events: ChainEvent[] };

const SAMPLES = questionsFor("langchain");

export function ChainPanel() {
  const [question, setQuestion] = useState(SAMPLES[0]);
  const [events, setEvents] = useState<ChainEvent[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<ChainStep | null>(null);
  const [follow, setFollow] = useState(true);
  const runId = useRef(0);

  const completed = events.map((item) => item.node);
  const running = busy ? (CHAIN_STEPS.find((name) => !completed.includes(name)) ?? null) : null;
  const failed = error && !busy ? (CHAIN_STEPS.find((name) => !completed.includes(name)) ?? null) : null;
  const lastNode = events.at(-1)?.node;
  const selected = follow ? (lastNode && isChainStep(lastNode) ? lastNode : null) : picked;
  const selectedEvent = useMemo(
    () => (selected ? (events.find((item) => item.node === selected) ?? null) : null),
    [events, selected],
  );
  const pipe = events.find((item) => item.node === "bind")?.update?.pipe;
  const pipeChip = typeof pipe === "string" ? pipe : null;

  async function playEvents(items: ChainEvent[], my: number) {
    await replaySequence(
      items,
      (item) => {
        setEvents((current) => [...current, item]);
      },
      (item) => item.node,
      () => runId.current === my,
    );
  }

  async function runQuestion(next: string) {
    const my = ++runId.current;
    setBusy(true);
    setError("");
    setEvents([]);
    setPicked(null);
    setFollow(true);
    try {
      if (STATIC_DEMO) {
        const match = matchQuery("langchain", next);
        if (!match) throw new Error("static_sample_only");
        const data = await loadFixture<ChainFixture>("langchain", match.id);
        await playEvents(data.events, my);
        return;
      }
      const response = await fetch(`${API_URL}/labs/langchain/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: next }),
      });
      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(typeof payload.detail === "string" ? payload.detail : "request_failed");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.replace(/^data: /, "");
          if (!line) continue;
          const parsed = JSON.parse(line) as ChainEvent;
          if (parsed.node === "error") {
            setError(friendlyError(new Error(parsed.detail ?? "ollama_unavailable")));
          } else if (parsed.node !== "done" && runId.current === my) {
            setEvents((current) => [...current, parsed]);
          }
        }
      }
    } catch (err) {
      if (runId.current !== my) return;
      const code = err instanceof Error ? err.message : "request_failed";
      setError(
        code === "static_sample_only"
          ? "This GitHub Pages demo only replays the sample questions. Clone the repo and run make dev for live Ollama."
          : friendlyError(err),
      );
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
        <label className="block text-sm font-semibold" htmlFor="chain-question">
          Run the chain
        </label>
        <textarea
          id="chain-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={3}
          className="field"
          disabled={STATIC_DEMO}
        />
        <button type="submit" disabled={busy} className="btn-accent">
          {busy ? "Streaming runnables…" : "Stream the pipe"}
        </button>
      </form>
      {error ? <p className="rounded-lg bg-[var(--danger-soft)] px-3 py-2.5 text-sm text-[var(--danger)]">{error}</p> : null}
      <PipelineTrace
        steps={CHAIN_STEPS.map((id) => ({ id, label: id, job: CHAIN_JOBS[id] }))}
        twins={CHAIN_TWINS}
        completed={completed}
        running={running}
        failed={failed}
        selected={selected}
        chips={{ bind: pipeChip }}
        onSelect={(id) => {
          if (!isChainStep(id)) return;
          setPicked(id);
          setFollow(false);
        }}
        startDetail="accept the question"
        endDetail="return parsed JSON"
        mapHint="Adjacent map: how this hop could run at AWS scale. This lab still uses Ollama on localhost — no cloud keys, no prompts leave the machine."
        mapAbout="Each strip is a static picture of a production LangChain pipe: Knowledge Bases, Bedrock prompts, Converse, a JSON parser. This playground uses langchain-core + Ollama. Hover or click any dotted label or card."
      />
      <ChainInspector step={selected} running={running} event={selectedEvent} />
    </div>
  );
}
