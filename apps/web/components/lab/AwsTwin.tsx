"use client";

import type { AwsBox, AwsGlyph, AwsTwinMap } from "./aws";
import { InfoTip } from "./InfoTip";

type AwsTwinProps = {
  map: AwsTwinMap;
  active?: boolean;
  compact?: boolean;
};

export function AwsTwin({ map, active = false, compact = false }: AwsTwinProps) {
  return (
    <div
      className={`min-w-0 rounded-xl border ${
        compact ? "px-3 py-2.5" : "px-4 py-3.5"
      } ${active ? "border-[var(--accent)] bg-white" : "border-[var(--line)] bg-white"}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <InfoTip label={map.title} body={map.about}>
          <span
            className={`font-[family-name:var(--font-display)] text-[var(--ink)] underline decoration-dotted decoration-[var(--line)] underline-offset-2 ${
              compact ? "text-base" : "text-lg"
            }`}
          >
            {map.title}
          </span>
        </InfoTip>
        {map.models?.length ? (
          <p className="flex flex-wrap gap-x-1.5 gap-y-0.5 font-mono text-[10px] text-[var(--ink-muted)]">
            {map.models.map((model, index) => (
              <span key={model.name} className="inline-flex items-center gap-1">
                {index > 0 ? <span aria-hidden>·</span> : null}
                <InfoTip label={model.name} body={model.about}>
                  <span className="underline decoration-dotted decoration-[var(--line)] underline-offset-2">
                    {model.name}
                  </span>
                </InfoTip>
              </span>
            ))}
          </p>
        ) : null}
      </div>
      {compact ? null : <p className="mt-1 text-xs leading-relaxed text-[var(--ink-muted)]">{map.about}</p>}
      <div
        className={`${compact ? "mt-2 flex-wrap" : "mt-3 overflow-x-auto pb-0.5"} flex items-stretch gap-1.5`}
      >
        {map.boxes.map((box, index) => (
          <div key={`${box.name}-${box.role}`} className="flex shrink-0 items-center gap-1.5">
            {index > 0 ? <FlowArrow /> : null}
            <ServiceCard box={box} compact={compact} />
          </div>
        ))}
      </div>
      <InfoTip label={map.scale} body={map.scaleAbout} className={`${compact ? "mt-2" : "mt-3"} block`}>
        <span className="text-[11px] leading-snug text-[var(--ink-muted)] underline decoration-dotted decoration-[var(--line)] underline-offset-2">
          {map.scale}
        </span>
      </InfoTip>
    </div>
  );
}

function ServiceCard({ box, compact = false }: { box: AwsBox; compact?: boolean }) {
  return (
    <InfoTip label={`${box.name} — ${box.role}`} body={box.about} className="block">
      <span
        className={`block rounded-md border border-[var(--line)] bg-[var(--background)] hover:border-[var(--accent)] ${
          compact ? "w-[5.5rem] px-1.5 py-1.5" : "w-[6.4rem] px-2 py-2"
        }`}
      >
        <Glyph kind={box.glyph} />
        <span className="mt-1 block truncate font-mono text-[10px] leading-tight text-[var(--ink)]">{box.name}</span>
        <span className="block truncate text-[9px] leading-tight text-[var(--ink-muted)]">{box.role}</span>
      </span>
    </InfoTip>
  );
}

function FlowArrow() {
  return (
    <InfoTip
      label="Next hop"
      body="The arrow is control and data flow: the left service finishes, then the right one runs. On AWS that is usually a Step Functions edge, a Lambda invoke, or a Bedrock API call — not a copied prompt log."
    >
      <svg width="18" height="12" viewBox="0 0 18 12" className="text-[var(--accent)]">
        <path
          d="M1 6h13M10.5 2 16 6 10.5 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </InfoTip>
  );
}

function Glyph({ kind }: { kind: AwsGlyph }) {
  const common = "text-[var(--accent)]";
  switch (kind) {
    case "edge":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className={common}>
          <path d="M2 8h12M11 4.5 14.5 8 11 11.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case "shield":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className={common}>
          <path d="M8 1.5 13 4v4.2c0 3.2-2.1 5.2-5 6.3-2.9-1.1-5-3.1-5-6.3V4Z" fill="none" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case "workflow":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className={common}>
          <circle cx="4" cy="4" r="1.6" fill="currentColor" />
          <circle cx="12" cy="8" r="1.6" fill="currentColor" />
          <circle cx="4" cy="12" r="1.6" fill="currentColor" />
          <path d="M5.6 4.6 10.2 7.4M5.6 11.4 10.2 8.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "compute":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className={common}>
          <rect x="3" y="3" width="10" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M6 6h4M6 8.5h4M6 11h2" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "model":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className={common}>
          <circle cx="8" cy="8" r="2" fill="currentColor" />
          <circle cx="3.2" cy="4.2" r="1.1" fill="currentColor" />
          <circle cx="12.8" cy="4.5" r="1.1" fill="currentColor" />
          <circle cx="12.2" cy="12.2" r="1.1" fill="currentColor" />
          <path d="M4.2 4.8 6.4 7M11.8 5.3 9.6 7.1M11.2 11.3 9.4 9.4" fill="none" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "bucket":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className={common}>
          <path d="M3 5.5h10l-1 7H4Z" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M3 5.5c0-1.4 2.2-2.5 5-2.5s5 1.1 5 2.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case "search":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className={common}>
          <circle cx="7" cy="7" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M9.6 9.6 13 13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "cache":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className={common}>
          <rect x="2.5" y="4" width="11" height="8" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5 7h6M5 9.5h4" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "metrics":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className={common}>
          <path d="M3 12V8.5M7 12V5M11 12V7.5M13.5 4.5 11 7" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
