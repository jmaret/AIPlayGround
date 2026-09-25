"use client";

import { NODE_JOBS, isGraphNode, type GraphEvent, type GraphNodeName } from "./graph";

type Chunk = { source?: string; distance?: number | null; text?: string };

type NodeInspectorProps = {
  event: GraphEvent | null;
  running: string | null;
};

export function NodeInspector({ event, running }: NodeInspectorProps) {
  if (!event) {
    return (
      <div className="flex min-h-[12rem] flex-col justify-center rounded-lg border border-dashed border-[var(--line)] bg-white/50 px-4 py-6">
        <p className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">Node output</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
          {running && isGraphNode(running)
            ? `${running} is running — ${NODE_JOBS[running]}.`
            : "Run the graph — nodes light as each step finishes. Click a finished node to inspect it."}
        </p>
      </div>
    );
  }

  const name = isGraphNode(event.node) ? event.node : null;
  const update = event.update ?? {};

  return (
    <div className="min-h-[12rem] rounded-lg border border-[var(--line)] bg-white/70 p-3 sm:p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
        {name ?? event.node}
      </p>
      <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
        {name ? NODE_JOBS[name] : "Node update"}
      </h2>
      <div className="mt-3">{renderBody(name, update)}</div>
      <details className="mt-4">
        <summary className="cursor-pointer text-xs font-medium text-[var(--ink-muted)]">Raw update</summary>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--ink-muted)]">
          {JSON.stringify(update, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function renderBody(name: GraphNodeName | null, update: Record<string, unknown>) {
  if (name === "route") {
    const route = typeof update.route === "string" ? update.route : "—";
    return (
      <p>
        <span className="chip font-mono">{route}</span>
        <span className="mt-2 block text-sm text-[var(--ink-muted)]">
          A label on this run, not a fork — retrieve still runs next.
        </span>
      </p>
    );
  }

  if (name === "retrieve") {
    const chunks = asChunks(update.chunks);
    if (chunks.length === 0) {
      return <p className="text-sm text-[var(--ink-muted)]">No passages came back.</p>;
    }
    return (
      <ol className="space-y-2">
        {chunks.map((item, index) => (
          <li key={`${item.source ?? "chunk"}-${index}`} className="rounded-md border border-[var(--line)] bg-white/80 p-2.5">
            <p className="font-mono text-xs text-[var(--ink-muted)]">
              {item.source ?? "corpus"}
              {item.distance == null ? "" : ` · distance ${item.distance.toFixed(3)}`}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]">{item.text}</p>
          </li>
        ))}
      </ol>
    );
  }

  if (name === "draft" || name === "critique" || name === "answer") {
    const text = typeof update[name] === "string" ? (update[name] as string) : "";
    const surface = name === "answer" ? "bg-[var(--success-soft)] text-[var(--ink)]" : "text-[var(--ink)]";
    return <p className={`whitespace-pre-wrap text-sm leading-relaxed ${surface} ${name === "answer" ? "rounded-md px-3 py-2.5" : ""}`}>{text || "—"}</p>;
  }

  return (
    <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-[var(--ink-muted)]">
      {JSON.stringify(update, null, 2)}
    </pre>
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
