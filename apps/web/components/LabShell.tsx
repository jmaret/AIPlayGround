import type { ReactNode } from "react";
import Link from "next/link";
import { WorkspacePanel } from "./WorkspacePanel";

export function LabShell({
  eyebrow,
  title,
  what,
  why,
  seeing,
  children,
}: {
  eyebrow: string;
  title: string;
  what: string;
  why: string;
  seeing: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <WorkspacePanel>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{eyebrow}</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)]">
          {title}
        </h1>
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
        <Link href="/labs" className="mt-5 inline-flex text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline">
          All labs
        </Link>
      </WorkspacePanel>
      <WorkspacePanel>{children}</WorkspacePanel>
    </div>
  );
}
