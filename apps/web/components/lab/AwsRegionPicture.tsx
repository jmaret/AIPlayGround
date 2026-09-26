export type LaneKind = "edge" | "orchestrate" | "model" | "storage" | "search" | "policy";

export type RegionIcon = {
  name: string;
  kind: LaneKind;
  note?: string;
};

export type RegionState = {
  id: string;
  icons: RegionIcon[];
};

export type AwsRegionPictureSpec = {
  caption: string;
  engine: string;
  engineNote: string;
  edge: RegionIcon[];
  states: RegionState[];
  metrics?: RegionIcon;
  session?: RegionIcon;
  egress: RegionIcon;
};

const LANES: { kind: LaneKind; label: string }[] = [
  { kind: "edge", label: "Edge" },
  { kind: "orchestrate", label: "Orchestrate" },
  { kind: "model", label: "Model" },
  { kind: "storage", label: "Storage" },
  { kind: "search", label: "Search" },
  { kind: "policy", label: "Policy" },
];

const LANE_TONE: Record<LaneKind, string> = {
  edge: "border-[#f3d2b8] bg-[#fff1e4] text-[#9a4b12]",
  orchestrate: "border-[#f3c7d8] bg-[#fde8f0] text-[#9b2c5a]",
  model: "border-[#b7e4f2] bg-[#e5f7fb] text-[#0f5f73]",
  storage: "border-[#bfe3c4] bg-[#e8f6ea] text-[#1f6b4a]",
  search: "border-[#b7d4f5] bg-[#e4f0fc] text-[#1d4f91]",
  policy: "border-[#f3c4c4] bg-[#fdeaea] text-[#9b2c2c]",
};

const LANE_DOT: Record<LaneKind, string> = {
  edge: "bg-[#e08a3c]",
  orchestrate: "bg-[#e38aa8]",
  model: "bg-[#5ec4d6]",
  storage: "bg-[#5aaa6a]",
  search: "bg-[#4a7fd4]",
  policy: "bg-[#d45454]",
};

export function AwsRegionPicture({ spec }: { spec: AwsRegionPictureSpec }) {
  return (
    <div className="min-w-0 overflow-x-auto pb-1">
      <div className="min-w-[36rem]">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--ink-muted)]">
          {LANES.map((lane) => (
            <li key={lane.kind} className="inline-flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${LANE_DOT[lane.kind]}`} aria-hidden />
              {lane.label}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-col items-center">
          <p className="text-sm text-[var(--ink)]">Browser</p>
          <DownArrow />
        </div>

        <div className="rounded-xl border border-[var(--line)] bg-[#f6f6f6] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-muted)]">Edge</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {spec.edge.map((icon) => (
              <ServiceMark key={icon.name} icon={icon} />
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <DownArrow />
        </div>

        <div className="relative rounded-xl border border-[var(--ink)] bg-[#fbf3f7] px-4 pb-5 pt-6">
          <p className="absolute -top-2.5 left-3 bg-[#f6f6f6] px-1.5 text-[11px] text-[var(--ink-muted)]">Region</p>
          <p className="absolute -top-2.5 left-1/2 max-w-[80%] -translate-x-1/2 truncate rounded-md border border-[var(--line)] bg-white px-2 py-0.5 text-center text-[11px] text-[var(--ink)]">
            {spec.caption}
          </p>
          <p className="font-[family-name:var(--font-display)] text-base text-[var(--ink)]">{spec.engine}</p>
          <p className="text-xs text-[var(--ink-muted)]">{spec.engineNote}</p>
          <div className="mt-4 space-y-0">
            {spec.states.map((state, index) => (
              <div key={state.id} className="grid items-center gap-3 sm:grid-cols-[7.5rem_1fr]">
                <div className="flex flex-col items-center">
                  <span className="inline-flex min-h-[2.25rem] min-w-[6.5rem] items-center justify-center rounded-full border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]">
                    {state.id}
                  </span>
                  {index < spec.states.length - 1 ? <DownArrow /> : <div className="h-4" />}
                </div>
                <div className="flex flex-wrap items-center gap-2 pb-1">
                  {state.icons.map((icon) => (
                    <ServiceMark key={`${state.id}-${icon.name}-${icon.note ?? ""}`} icon={icon} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <DownArrow />
        </div>

        <div className="grid items-start gap-3 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-1">
            {spec.metrics ? <ServiceMark icon={spec.metrics} /> : <div />}
          </div>
          <div className="flex flex-col items-center gap-1">
            {spec.session ? <ServiceMark icon={spec.session} /> : <div />}
          </div>
          <div className="flex flex-col items-center gap-1">
            <ServiceMark icon={spec.egress} wide />
            <DownArrow />
            <p className="text-sm text-[var(--ink)]">Browser</p>
            <p className="text-[10px] text-[var(--ink-muted)]">{spec.egress.note ?? "egress"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceMark({ icon, wide = false }: { icon: RegionIcon; wide?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex flex-col items-center justify-center rounded-xl border px-2.5 py-2 ${LANE_TONE[icon.kind]} ${
          wide ? "min-w-[7.5rem]" : "min-w-[5.6rem]"
        }`}
      >
        <LaneGlyph kind={icon.kind} />
        <span className="mt-1 text-center text-[11px] leading-tight">{icon.name}</span>
      </div>
      {icon.note && !wide ? <p className="max-w-[7rem] text-center text-[10px] text-[var(--ink-muted)]">{icon.note}</p> : null}
    </div>
  );
}

function DownArrow() {
  return (
    <svg width="12" height="18" viewBox="0 0 12 18" className="text-[var(--ink)]" aria-hidden>
      <path d="M6 1v14M2 11.5 6 16 10 11.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function LaneGlyph({ kind }: { kind: LaneKind }) {
  const common = "currentColor";
  switch (kind) {
    case "edge":
      return (
        <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden>
          <ellipse cx="11" cy="7" rx="9" ry="5" fill="none" stroke={common} strokeWidth="1.3" />
          <path d="M6 7h10" stroke={common} strokeWidth="1.2" />
        </svg>
      );
    case "orchestrate":
      return (
        <svg width="18" height="16" viewBox="0 0 18 16" aria-hidden>
          <text x="1" y="13" fontSize="14" fill={common}>
            λ
          </text>
        </svg>
      );
    case "model":
      return (
        <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden>
          <rect x="1" y="2" width="18" height="10" rx="2" fill="none" stroke={common} strokeWidth="1.3" />
        </svg>
      );
    case "storage":
      return (
        <svg width="20" height="16" viewBox="0 0 20 16" aria-hidden>
          <path d="M3 5h14l-1.2 9H4.2Z" fill="none" stroke={common} strokeWidth="1.3" />
          <path d="M3 5c0-1.6 3-2.8 7-2.8S17 3.4 17 5" fill="none" stroke={common} strokeWidth="1.3" />
        </svg>
      );
    case "search":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
          <circle cx="8" cy="8" r="4.2" fill="none" stroke={common} strokeWidth="1.3" />
          <path d="M11.2 11.2 15 15" stroke={common} strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "policy":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
          <path d="M8 1.5 13 4v4.2c0 3.2-2.1 5.2-5 6.3-2.9-1.1-5-3.1-5-6.3V4Z" fill="none" stroke={common} strokeWidth="1.3" />
        </svg>
      );
    default:
      return null;
  }
}
