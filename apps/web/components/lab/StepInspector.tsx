"use client";

import type { ReactNode } from "react";

type StepInspectorProps = {
  eyebrow: string;
  title: string;
  empty: string;
  raw?: unknown;
  children?: ReactNode;
};

export function StepInspector({ eyebrow, title, empty, raw, children }: StepInspectorProps) {
  if (!children) {
    return (
      <div className="flex min-h-[12rem] flex-col justify-center rounded-lg border border-dashed border-[var(--line)] bg-white/50 px-4 py-6">
        <p className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">Step output</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{empty}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[12rem] rounded-lg border border-[var(--line)] bg-white/70 p-3 sm:p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{eyebrow}</p>
      <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">{title}</h2>
      <div className="mt-3">{children}</div>
      {raw !== undefined ? (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs font-medium text-[var(--ink-muted)]">Raw update</summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--ink-muted)]">
            {JSON.stringify(raw, null, 2)}
          </pre>
        </details>
      ) : null}
    </div>
  );
}

export function NeighborCards({
  items,
}: {
  items: { id?: string; source?: string; text?: string; distance?: number | null }[];
}) {
  if (items.length === 0) {
    return <p className="text-sm text-[var(--ink-muted)]">No neighbors yet.</p>;
  }
  return (
    <ol className="space-y-2">
      {items.map((item, index) => {
        const closeness = item.distance == null ? 0 : Math.max(0, Math.min(1, 1 - item.distance));
        return (
          <li key={item.id ?? `${item.source}-${index}`} className="rounded-md border border-[var(--line)] bg-white/80 p-2.5">
            {item.distance != null ? (
              <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-[var(--line)]/50">
                <div className="h-full bg-[var(--accent)]" style={{ width: `${Math.round(closeness * 100)}%` }} />
              </div>
            ) : null}
            <p className="font-mono text-xs text-[var(--ink-muted)]">
              {item.source ?? "corpus"}
              {item.distance == null ? "" : ` · distance ${item.distance.toFixed(3)}`}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]">{item.text}</p>
          </li>
        );
      })}
    </ol>
  );
}
