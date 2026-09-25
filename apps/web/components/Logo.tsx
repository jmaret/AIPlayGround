import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="min-w-0 shrink-0">
      <span className="flex items-center gap-2.5">
        <img src="/brand/logo.svg" alt="" width={36} height={36} className="size-8 shrink-0 sm:size-9" />
        <span className="min-w-0">
          <span className="block font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--ink)] sm:text-2xl">
            Playground
          </span>
          <span className="mt-0.5 hidden text-[11px] leading-tight text-[var(--ink-muted)] sm:block">
            Local labs for RAG, graphs, and vectors.
          </span>
        </span>
      </span>
    </Link>
  );
}
