"use client";

import type { ReactNode } from "react";
import { AwsTwin } from "./AwsTwin";
import { AWS_TWINS, GRAPH_NODES, NODE_JOBS, type GraphNodeName } from "./graph";
import { InfoTip } from "./InfoTip";

export type NodeVisual = "idle" | "running" | "done" | "error";

type GraphTraceProps = {
  completed: string[];
  running: string | null;
  failed: string | null;
  selected: string | null;
  routeLabel: string | null;
  onSelect: (node: GraphNodeName) => void;
};

function visualFor(name: GraphNodeName, props: GraphTraceProps): NodeVisual {
  if (props.completed.includes(name)) return "done";
  if (props.failed === name) return "error";
  if (props.running === name) return "running";
  return "idle";
}

export function GraphTrace(props: GraphTraceProps) {
  const { completed, running, selected, routeLabel, onSelect } = props;
  const startLit = Boolean(running || completed.length);
  const endLit = completed.length === GRAPH_NODES.length && !running && !props.failed;

  return (
    <div className="min-w-0 space-y-2">
      <InfoTip
        label="AWS-scale map"
        body="Each strip is a static picture of how that LangGraph node could run in a production AWS account: edge, orchestration, Bedrock models, search, and metrics. Hover or click any dotted label or service card. This playground still calls Ollama on 127.0.0.1 — no AWS keys, no prompts leave the machine."
      >
        <span className="text-xs leading-relaxed text-[var(--ink-muted)] underline decoration-dotted decoration-[var(--line)] underline-offset-2">
          Adjacent map: how this step could run at AWS scale. This lab still calls Ollama on localhost — no cloud keys,
          no prompts leave the machine.
        </span>
      </InfoTip>
      <ol className="space-y-0">
        <li>
          <TwinRow>
            <TerminalCard label="START" detail="accept the request" lit={startLit} />
            <AwsTwin map={AWS_TWINS.start} active={startLit} />
          </TwinRow>
          <Rail flowing={running === "route"} lit={completed.includes("route") || running === "route"} />
        </li>
        {GRAPH_NODES.map((name, index) => {
          const visual = visualFor(name, props);
          const next = GRAPH_NODES[index + 1];
          const railFlowing = next ? running === next : false;
          const railLit = next ? completed.includes(next) || running === next : endLit;
          return (
            <li key={name}>
              <TwinRow>
                <NodeCard
                  name={name}
                  visual={visual}
                  selected={selected === name}
                  chip={name === "route" ? routeLabel : null}
                  onSelect={onSelect}
                />
                <AwsTwin map={AWS_TWINS[name]} active={visual === "running" || visual === "done"} />
              </TwinRow>
              <Rail flowing={railFlowing} lit={railLit} />
            </li>
          );
        })}
        <li>
          <TwinRow>
            <TerminalCard label="END" detail="return the answer" lit={endLit} />
            <AwsTwin map={AWS_TWINS.end} active={endLit} />
          </TwinRow>
        </li>
      </ol>
    </div>
  );
}

function TwinRow({ children }: { children: ReactNode }) {
  return <div className="grid items-stretch gap-2 sm:grid-cols-[9.5rem_1fr]">{children}</div>;
}

function NodeCard({
  name,
  visual,
  selected,
  chip,
  onSelect,
}: {
  name: GraphNodeName;
  visual: NodeVisual;
  selected: boolean;
  chip: string | null;
  onSelect: (node: GraphNodeName) => void;
}) {
  const done = visual === "done";
  const clickable = done;
  const tone =
    visual === "done"
      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
      : visual === "error"
        ? "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]"
        : visual === "running"
          ? "border-[var(--accent)] bg-white text-[var(--ink)] shadow-[0_0_0_3px_rgba(15,76,92,0.16)]"
          : "border-[var(--line)] bg-white/80 text-[var(--ink)]";
  const selectedRing = selected ? "ring-2 ring-[var(--accent)]" : "";

  return (
    <button
      type="button"
      disabled={!clickable}
      aria-pressed={selected}
      title={NODE_JOBS[name]}
      onClick={() => onSelect(name)}
      className={`relative flex min-h-[4.5rem] flex-col items-start rounded-lg border px-2.5 py-2 text-left transition ${tone} ${selectedRing} ${
        clickable ? "cursor-pointer" : "cursor-default"
      } ${visual === "running" ? "animate-pulse" : ""}`}
    >
      <span className={`font-[family-name:var(--font-display)] text-sm ${done ? "text-white" : ""}`}>{name}</span>
      <span className={`mt-0.5 text-[10px] leading-snug ${done ? "text-white/80" : "text-[var(--ink-muted)]"}`}>
        {NODE_JOBS[name]}
      </span>
      {chip ? (
        <span
          className={`mt-1 rounded px-1 py-px font-mono text-[9px] ${
            done ? "bg-white/15 text-white" : "border border-[var(--line)] bg-[var(--background)] text-[var(--ink-muted)]"
          }`}
        >
          {chip}
        </span>
      ) : null}
      {done ? (
        <span className="absolute right-2 top-2 text-[10px] text-white" aria-hidden>
          ✓
        </span>
      ) : null}
    </button>
  );
}

function TerminalCard({ label, detail, lit }: { label: string; detail: string; lit: boolean }) {
  return (
    <div
      className={`flex min-h-[4.5rem] flex-col justify-center rounded-lg border px-2.5 py-2 ${
        lit ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--line)] bg-white/70 text-[var(--ink)]"
      }`}
    >
      <p className="font-mono text-[10px] font-semibold tracking-wide">{label}</p>
      <p className={`mt-0.5 text-[10px] ${lit ? "text-white/80" : "text-[var(--ink-muted)]"}`}>{detail}</p>
    </div>
  );
}

function Rail({ flowing, lit }: { flowing: boolean; lit: boolean }) {
  return (
    <div className="flex h-4 justify-center sm:justify-start sm:pl-[4.4rem]" aria-hidden>
      <svg width="8" height="16" viewBox="0 0 8 16" className="overflow-visible">
        <line
          x1="4"
          y1="0"
          x2="4"
          y2="16"
          stroke={lit || flowing ? "var(--accent)" : "var(--line)"}
          strokeWidth="1.5"
        />
        {flowing ? (
          <>
            <line x1="4" y1="0" x2="4" y2="16" stroke="var(--accent)" strokeWidth="2" className="graph-edge-flow" />
            <circle r="2.4" fill="var(--accent)">
              <animateMotion dur="0.7s" repeatCount="indefinite" path="M4,0 L4,16" />
            </circle>
          </>
        ) : null}
      </svg>
    </div>
  );
}
