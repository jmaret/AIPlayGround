import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePanel } from "@/components/WorkspacePanel";

export const metadata: Metadata = {
  title: "Labs — Playground",
};

const labs = [
  {
    href: "/labs/vector-db",
    title: "Vector DB",
    copy: "Live ingest→rank path. Each Flow step sits beside its AWS Architecture box.",
  },
  {
    href: "/labs/rag",
    title: "RAG",
    copy: "Live retrieve-then-generate path. Each Flow step sits beside its AWS Architecture box.",
  },
  {
    href: "/labs/langgraph",
    title: "LangGraph",
    copy: "Live nodes. Each Flow step sits beside its AWS Architecture box.",
  },
  {
    href: "/labs/langchain",
    title: "LangChain",
    copy: "A live LCEL pipe. Each Flow hop sits beside its AWS Architecture box.",
  },
  {
    href: "/labs/refill",
    title: "Agentic AI",
    copy: "A live refill graph. Each Flow step sits beside its AWS Architecture box.",
  },
];

export default function LabsPage() {
  return (
    <main className="flex flex-col gap-5">
      <WorkspacePanel>
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)]">Labs</h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)] sm:text-base">
          Five doors into the same local corpus. No sign-in. No leftover chat.
        </p>
        <div className="mt-5 grid gap-3">
          {labs.map((lab) => (
            <Link
              key={lab.href}
              href={lab.href}
              className="rounded-lg border border-[var(--line)] bg-white/70 px-4 py-3 transition hover:bg-white"
            >
              <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">{lab.title}</h2>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">{lab.copy}</p>
            </Link>
          ))}
        </div>
      </WorkspacePanel>
    </main>
  );
}
