import type { ReactNode } from "react";
import Link from "next/link";
import { WorkspacePanel } from "./WorkspacePanel";

export function LabShell({
  eyebrow,
  title,
  what,
  why,
  seeing,
  subtitle,
  architectureHref,
  architectureLabel,
  children,
}: {
  eyebrow: string;
  title: string;
  what: string;
  why: string;
  seeing: string;
  subtitle?: string;
  architectureHref?: string;
  architectureLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <WorkspacePanel>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{eyebrow}</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)]">
          {title}
        </h1>
        {subtitle ? <p className="mt-2 text-base text-[var(--ink-muted)]">{subtitle}</p> : null}
        <dl className="mt-5 space-y-4 text-sm leading-relaxed">
          <div>
            <dt className="font-semibold text-[var(--ink)]">What</dt>
            <dd className="text-[var(--ink-muted)]">{what}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--ink)]">Why</dt>
            <dd className="text-[var(--ink-muted)]">{why}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--ink)]">What you are seeing</dt>
            <dd className="text-[var(--ink-muted)]">{seeing}</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/labs" className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            All labs
          </Link>
          {architectureHref ? (
            <Link
              href={architectureHref}
              className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              {architectureLabel ?? "Physical architecture"}
            </Link>
          ) : null}
        </div>
      </WorkspacePanel>
      <WorkspacePanel>{children}</WorkspacePanel>
    </div>
  );
}
