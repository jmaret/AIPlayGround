"use client";

import type { ReactNode } from "react";
import type { AwsTwinMap } from "./aws";
import { AwsTwin } from "./AwsTwin";
import { InfoTip } from "./InfoTip";

export type NodeVisual = "idle" | "running" | "done" | "error";

export type PipelineStep = {
  id: string;
  label: string;
  job: string;
};

type PipelineTraceProps = {
  steps: readonly PipelineStep[];
  twins: Record<string, AwsTwinMap>;
  completed: string[];
  running: string | null;
  failed: string | null;
  selected: string | null;
  chips?: Record<string, string | null | undefined>;
  onSelect: (id: string) => void;
  mapAbout: string;
  mapHint: string;
  startDetail?: string;
  endDetail?: string;
};

function visualFor(id: string, props: PipelineTraceProps): NodeVisual {
  if (props.completed.includes(id)) return "done";
  if (props.failed === id) return "error";
  if (props.running === id) return "running";
  return "idle";
}

export function PipelineTrace(props: PipelineTraceProps) {
  const { steps, twins, completed, running, selected, chips, onSelect } = props;
  const startLit = Boolean(running || completed.length);
  const endLit = completed.length === steps.length && !running && !props.failed;

  return (
    <div className="min-w-0 space-y-2">
      <InfoTip label="AWS-scale map" body={props.mapAbout}>
        <span className="text-xs leading-relaxed text-[var(--ink-muted)] underline decoration-dotted decoration-[var(--line)] underline-offset-2">
          {props.mapHint}
        </span>
      </InfoTip>
      <ol className="space-y-0">
        <li>
          <TwinRow>
            <TerminalCard label="START" detail={props.startDetail ?? "accept the request"} lit={startLit} />
            {twins.start ? <AwsTwin map={twins.start} active={startLit} /> : null}
          </TwinRow>
          <Rail flowing={running === steps[0]?.id} lit={completed.includes(steps[0]?.id ?? "") || running === steps[0]?.id} />
        </li>
        {steps.map((step, index) => {
          const visual = visualFor(step.id, props);
          const next = steps[index + 1];
          const railFlowing = next ? running === next.id : false;
          const railLit = next ? completed.includes(next.id) || running === next.id : endLit;
          return (
            <li key={step.id}>
              <TwinRow>
                <NodeCard
                  label={step.label}
                  job={step.job}
                  visual={visual}
                  selected={selected === step.id}
                  chip={chips?.[step.id] ?? null}
                  onSelect={() => onSelect(step.id)}
                />
                {twins[step.id] ? <AwsTwin map={twins[step.id]} active={visual === "running" || visual === "done"} /> : <div />}
              </TwinRow>
              <Rail flowing={railFlowing} lit={railLit} />
            </li>
          );
        })}
        <li>
          <TwinRow>
            <TerminalCard label="END" detail={props.endDetail ?? "return the result"} lit={endLit} />
            {twins.end ? <AwsTwin map={twins.end} active={endLit} /> : null}
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
  label,
  job,
  visual,
  selected,
  chip,
  onSelect,
}: {
  label: string;
  job: string;
  visual: NodeVisual;
  selected: boolean;
  chip: string | null;
  onSelect: () => void;
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
      title={job}
      onClick={onSelect}
      className={`relative flex min-h-[4.5rem] flex-col items-start rounded-lg border px-2.5 py-2 text-left transition ${tone} ${selectedRing} ${
        clickable ? "cursor-pointer" : "cursor-default"
      } ${visual === "running" ? "animate-pulse" : ""}`}
    >
      <span className={`font-[family-name:var(--font-display)] text-sm ${done ? "text-white" : ""}`}>{label}</span>
      <span className={`mt-0.5 text-[10px] leading-snug ${done ? "text-white/80" : "text-[var(--ink-muted)]"}`}>{job}</span>
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
        <line x1="4" y1="0" x2="4" y2="16" stroke={lit || flowing ? "var(--accent)" : "var(--line)"} strokeWidth="1.5" />
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
