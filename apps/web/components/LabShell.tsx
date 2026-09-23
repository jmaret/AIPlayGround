import type { ReactNode } from "react";
import Link from "next/link";

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
    <div className="bg-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] md:px-10 md:py-16">
        <aside>
          <p className="text-sm font-semibold uppercase tracking-wide text-apricot">{eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl font-black leading-none md:text-5xl">{title}</h1>
          <dl className="mt-8 space-y-5 text-lg leading-relaxed">
            <div>
              <dt className="font-semibold">What</dt>
              <dd className="text-ink/80">{what}</dd>
            </div>
            <div>
              <dt className="font-semibold">Why</dt>
              <dd className="text-ink/80">{why}</dd>
            </div>
            <div>
              <dt className="font-semibold">What you are seeing</dt>
              <dd className="text-ink/80">{seeing}</dd>
            </div>
          </dl>
          <Link href="/labs" className="mt-8 inline-flex text-base font-semibold underline">
            All labs
          </Link>
        </aside>
        <section className="rounded-card bg-white/70 p-6 shadow-none md:p-8">{children}</section>
      </div>
    </div>
  );
}
