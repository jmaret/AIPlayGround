"use client";

export function SampleChips({
  samples,
  disabled,
  onPick,
}: {
  samples: string[];
  disabled?: boolean;
  onPick: (sample: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {samples.map((sample) => (
        <button
          key={sample}
          type="button"
          disabled={disabled}
          className="chip hover:bg-white hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => onPick(sample)}
        >
          {sample}
        </button>
      ))}
    </div>
  );
}

export function StaticDemoNote() {
  return (
    <p className="rounded-lg border border-[var(--line)] bg-white/70 px-3 py-2 text-sm text-[var(--ink-muted)]">
      Static GitHub Pages demo — sample questions replay recorded runs with paced animations. Clone the repo and{" "}
      <span className="font-mono text-xs text-[var(--ink)]">make dev</span> for live Ollama.
    </p>
  );
}
