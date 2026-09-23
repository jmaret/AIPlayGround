import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Labs — Playground",
};

const labs = [
  {
    href: "/labs/vector-db",
    title: "Vector DB",
    copy: "Chunk, embed, query. See nearest neighbors and distances.",
    tone: "bg-sky",
  },
  {
    href: "/labs/rag",
    title: "RAG",
    copy: "Retrieve passages, then generate an answer that has to cite them.",
    tone: "bg-blush",
  },
  {
    href: "/labs/langgraph",
    title: "LangGraph",
    copy: "Watch route → retrieve → draft → critique → answer as it happens.",
    tone: "bg-butter",
  },
];

export default function LabsPage() {
  return (
    <main className="bg-cream px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-5xl font-black md:text-6xl">Labs</h1>
        <p className="mt-4 max-w-2xl text-xl">Three doors into the same local corpus. No sign-in. No leftover chat.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {labs.map((lab) => (
            <Link key={lab.href} href={lab.href} className={`${lab.tone} min-h-[240px] rounded-card p-8`}>
              <h2 className="font-display text-4xl font-black">{lab.title}</h2>
              <p className="mt-6 text-lg font-medium leading-relaxed">{lab.copy}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
