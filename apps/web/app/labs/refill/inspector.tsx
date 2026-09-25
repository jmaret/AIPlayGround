"use client";

import { NODE_JOBS, isGraphNode, type GraphEvent } from "./graph";

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
            : "Run a sample request. Nodes light as each step finishes. Click a finished node to inspect it."}
        </p>
      </div>
    );
  }

  const name = isGraphNode(event.node) ? event.node : null;
  const update = event.update ?? {};
  const heading = name ? NODE_JOBS[name] : event.node === "await_human" ? "wait for a pharmacist" : "Node update";

  return (
    <div className="min-h-[12rem] rounded-lg border border-[var(--line)] bg-white/70 p-3 sm:p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
        {name ?? event.node}
      </p>
      <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">{heading}</h2>
      <div className="mt-3">{renderBody(event.node, update)}</div>
      <details className="mt-4">
        <summary className="cursor-pointer text-xs font-medium text-[var(--ink-muted)]">Raw update</summary>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--ink-muted)]">
          {JSON.stringify(update, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function Chip({ value }: { value: string }) {
  return <span className="chip font-mono">{value}</span>;
}

function renderBody(node: string, update: Record<string, unknown>) {
  if (node === "intake") {
    const channel = asString(update.channel);
    const medication = asString(update.medication);
    const matched = update.identifiers_matched === true;
    return (
      <div className="space-y-2 text-sm leading-relaxed text-[var(--ink)]">
        <p>
          <Chip value={channel || "—"} />{" "}
          <Chip value={matched ? "identifiers matched" : "identifiers missed"} />
        </p>
        <p className="text-[var(--ink-muted)]">Medication parsed from the request: {medication || "none"}.</p>
      </div>
    );
  }

  if (node === "retrieve_policy") {
    const chunks = asChunks(update.chunks);
    if (chunks.length === 0) {
      return <p className="text-sm text-[var(--ink-muted)]">No policy passages came back.</p>;
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

  if (node === "check_script") {
    return (
      <ul className="space-y-1 text-sm text-[var(--ink)]">
        <li>Refills remaining: {formatValue(update.refills_remaining)}</li>
        <li>Days since last fill: {formatValue(update.last_fill_days)}</li>
        <li>Expired: {update.expired === true ? "yes" : "no"}</li>
      </ul>
    );
  }

  if (node === "safety") {
    return (
      <ul className="space-y-1 text-sm text-[var(--ink)]">
        <li>Controlled: {update.controlled === true ? "yes" : "no"}</li>
        <li>Labs overdue: {update.labs_overdue === true ? "yes" : "no"}</li>
        <li>Early refill: {update.early_refill === true ? "yes" : "no"}</li>
      </ul>
    );
  }

  if (node === "decide") {
    const path = asString(update.path);
    return (
      <p>
        <Chip value={path || "—"} />
        <span className="mt-2 block text-sm text-[var(--ink-muted)]">
          A label from the tool flags, not a model guess. The rail stays linear.
        </span>
      </p>
    );
  }

  if (node === "await_human") {
    return (
      <div className="space-y-2 text-sm leading-relaxed text-[var(--ink)]">
        <p>
          <Chip value={asString(update.path) || "escalate"} />
        </p>
        <p className="text-[var(--ink-muted)]">{asString(update.proposed) || "A clinician should review this request."}</p>
      </div>
    );
  }

  if (node === "review") {
    const status = asString(update.status);
    const note = asString(update.note);
    return (
      <div className="space-y-2">
        {status ? <Chip value={status} /> : null}
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]">{note || "—"}</p>
      </div>
    );
  }

  if (node === "act") {
    const outcome = asString(update.outcome);
    const answer = asString(update.answer);
    return (
      <div className="space-y-2">
        {outcome ? <Chip value={outcome} /> : null}
        <p className="whitespace-pre-wrap rounded-md bg-[var(--success-soft)] px-3 py-2.5 text-sm leading-relaxed text-[var(--ink)]">
          {answer || "—"}
        </p>
      </div>
    );
  }

  return (
    <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-[var(--ink-muted)]">
      {JSON.stringify(update, null, 2)}
    </pre>
  );
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function formatValue(value: unknown): string {
  if (typeof value === "number") return String(value);
  if (value == null) return "—";
  return String(value);
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
