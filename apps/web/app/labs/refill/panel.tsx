"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { SampleChips, StaticDemoNote } from "@/components/lab/SampleChips";
import { API_URL, friendlyError } from "@/lib/api";
import { loadFixture, matchQuery, questionsFor } from "@/lib/fixtures";
import { replaySequence } from "@/lib/replay";
import { STATIC_DEMO } from "@/lib/static-mode";
import { GraphTrace } from "./GraphTrace";
import { GRAPH_NODES, isGraphNode, type GraphEvent, type GraphNodeName } from "./graph";
import { NodeInspector } from "./inspector";
import { guideForQuestion } from "./scenarios";

type GraphFixture = { events: GraphEvent[] };
type Decision = "approve" | "deny";

const SAMPLES = questionsFor("refill");

export function RefillPanel() {
  const [question, setQuestion] = useState(SAMPLES[0] ?? "");
  const [events, setEvents] = useState<GraphEvent[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<GraphNodeName | null>(null);
  const [follow, setFollow] = useState(true);
  const runId = useRef(0);

  const completed = events.filter((item) => isGraphNode(item.node)).map((item) => item.node);
  const lastEvent = events.at(-1);
  const awaiting = lastEvent?.node === "await_human" ? lastEvent : null;
  const running = busy
    ? (GRAPH_NODES.find((name) => !completed.includes(name)) ?? null)
    : awaiting
      ? "review"
      : null;
  const failed = error && !busy && !awaiting ? (GRAPH_NODES.find((name) => !completed.includes(name)) ?? null) : null;
  const lastNode = lastEvent?.node;
  const selected = follow
    ? lastNode && isGraphNode(lastNode)
      ? lastNode
      : lastNode === "await_human"
        ? "review"
        : null
    : picked;
  const selectedEvent = useMemo(() => {
    if (!selected) return null;
    if (selected === "review" && awaiting) return awaiting;
    return events.find((item) => item.node === selected) ?? null;
  }, [awaiting, events, selected]);

  const chips = {
    intake: stringField(events, "intake", "channel"),
    decide: stringField(events, "decide", "path"),
    review: reviewChip(events, awaiting),
    act: stringField(events, "act", "outcome"),
  };

  async function playEvents(items: GraphEvent[], my: number) {
    await replaySequence(
      items,
      (item) => setEvents((current) => [...current, item]),
      (item) => item.node,
      () => runId.current === my,
    );
  }

  async function consumeSse(response: Response, my: number) {
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
        const parsed = JSON.parse(line) as GraphEvent;
        if (parsed.node === "error") {
          setError(friendlyError(new Error(parsed.detail ?? "ollama_unavailable")));
        } else if (parsed.node !== "done" && runId.current === my) {
          setEvents((current) => [...current, parsed]);
        }
      }
    }
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
        const match = matchQuery("refill", next);
        if (!match) throw new Error("static_sample_only");
        const data = await loadFixture<GraphFixture>("refill", match.id);
        await playEvents(data.events, my);
        return;
      }
      const response = await fetch(`${API_URL}/labs/refill/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: next }),
      });
      await consumeSse(response, my);
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

  async function resume(decision: Decision) {
    const update = awaiting?.update;
    const resumeId = typeof update?.run_id === "string" ? update.run_id : "";
    if (!resumeId || STATIC_DEMO) return;
    const my = runId.current;
    setBusy(true);
    setError("");
    setFollow(true);
    try {
      const response = await fetch(`${API_URL}/labs/refill/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ run_id: resumeId, decision }),
      });
      await consumeSse(response, my);
    } catch (err) {
      if (runId.current !== my) return;
      setError(friendlyError(err));
    } finally {
      if (runId.current === my) setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void runQuestion(question);
  }

  const match = matchQuery("refill", question);
  const guide = guideForQuestion(question);

  return (
    <div className="space-y-8">
      {STATIC_DEMO ? <StaticDemoNote /> : null}
      <SampleChips
        samples={SAMPLES}
        disabled={busy}
        active={match?.question}
        onPick={(sample) => {
          setQuestion(sample);
          void runQuestion(sample);
        }}
      />
      {guide ? (
        <div className="rounded-lg border border-[var(--line)] bg-white/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">What this prompt does</p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">{guide.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]">{guide.story}</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
            <span className="font-semibold text-[var(--ink)]">What happens. </span>
            {guide.happens}
          </p>
        </div>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm font-semibold" htmlFor="refill-question">
          Run the agentic graph
        </label>
        <textarea
          id="refill-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={3}
          className="field"
          disabled={STATIC_DEMO}
        />
        <button type="submit" disabled={busy} className="btn-accent">
          {busy ? "Streaming nodes…" : "Stream the nodes"}
        </button>
      </form>
      {awaiting && !STATIC_DEMO ? (
        <div className="rounded-lg border border-[var(--line)] bg-white/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Pharmacist review</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]">
            {typeof awaiting.update?.proposed === "string"
              ? awaiting.update.proposed
              : "This path cannot auto-approve. Choose approve or deny."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn-accent" disabled={busy} onClick={() => void resume("approve")}>
              Approve
            </button>
            <button type="button" className="btn-ghost" disabled={busy} onClick={() => void resume("deny")}>
              Deny
            </button>
          </div>
        </div>
      ) : null}
      {error ? <p className="rounded-lg bg-[var(--danger-soft)] px-3 py-2.5 text-sm text-[var(--danger)]">{error}</p> : null}
      <GraphTrace
        completed={completed}
        running={running}
        failed={failed}
        selected={selected}
        chips={chips}
        onSelect={(node) => {
          setPicked(node);
          setFollow(false);
        }}
      />
      <NodeInspector event={selectedEvent} running={running} />
    </div>
  );
}

function stringField(events: GraphEvent[], node: string, key: string): string | null {
  const event = events.find((item) => item.node === node);
  const value = event?.update?.[key];
  return typeof value === "string" && value ? value : null;
}

function reviewChip(events: GraphEvent[], awaiting: GraphEvent | null): string | null {
  const status = stringField(events, "review", "status");
  if (status) return status;
  if (awaiting) return "awaiting";
  return null;
}
