import Image from "next/image";
import Link from "next/link";
import { WorkspacePanel } from "@/components/WorkspacePanel";

const labs = [
  {
    href: "/labs/vector-db",
    title: "Vector DB",
    copy: "Watch meaning become geometry. Query a local index and see the neighbors.",
  },
  {
    href: "/labs/rag",
    title: "RAG",
    copy: "Retrieve first. Generate second. Read the passages the answer stands on.",
  },
  {
    href: "/labs/langgraph",
    title: "LangGraph",
    copy: "A graph you can see: route, retrieve, draft, critique, answer.",
  },
];

const faqs = [
  {
    q: "Is it really free?",
    a: "Yes. It runs on your machine with Ollama. There is no paid API and no account.",
  },
  {
    q: "Does anything leave my machine?",
    a: "Not in this version. The site, API, embeddings, and generation all stay on localhost.",
  },
  {
    q: "What happens to what I type?",
    a: "It lives for the request, maybe a few minutes in memory, then it is gone. Restart the API and the slate is clean.",
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-col gap-5">
      <WorkspacePanel padded={false}>
        <div className="relative min-h-[220px] overflow-hidden sm:min-h-[280px]">
          <Image
            src="/brand/impact-mural.png"
            alt="Line illustration of people learning, making, and caring, loosely linked by a constellation"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(21,32,40,0.55)] via-[rgba(21,32,40,0.15)] to-transparent" />
        </div>
        <div className="p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Local AI classroom</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
            See how AI meets a life
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
            A playground for retrieval, graphs, and vector search. People stay in the foreground. Nothing you type is
            kept.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/labs" className="btn-accent">
              Open a lab
            </Link>
            <Link href="/#how" className="btn-ghost">
              How it works
            </Link>
          </div>
        </div>
      </WorkspacePanel>

      <WorkspacePanel>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
          AI has felt like a black box for too long.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
          It is not about collecting more tools. It is about seeing the steps: a chunk, a neighbor, a citation, a node
          on a graph. This site is built so you can watch that happen on your own machine.
        </p>
      </WorkspacePanel>

      <WorkspacePanel>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Three doors in</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">Start with a lab</h2>
        <div className="mt-5 grid gap-3">
          {labs.map((lab) => (
            <Link
              key={lab.href}
              href={lab.href}
              className="rounded-lg border border-[var(--line)] bg-white/70 px-4 py-3 transition hover:bg-white"
            >
              <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">{lab.title}</h3>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">{lab.copy}</p>
            </Link>
          ))}
        </div>
      </WorkspacePanel>

      <WorkspacePanel>
        <div id="how">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">How it works</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            Learn. Try. See the trace.
          </h2>
          <ol className="mt-5 space-y-4 text-sm leading-relaxed text-[var(--ink-muted)]">
            <li>
              <span className="chip text-[var(--ink)]">Learn</span>
              <p className="mt-2">Each lab tells you what the idea is and why it exists, in plain language.</p>
            </li>
            <li>
              <span className="chip text-[var(--ink)]">Try</span>
              <p className="mt-2">Ask a question of a bundled teaching corpus. Your words are not saved.</p>
            </li>
            <li>
              <span className="chip text-[var(--ink)]">See</span>
              <p className="mt-2">Neighbors, citations, and graph nodes show up beside the answer. The work is visible.</p>
            </li>
          </ol>
        </div>
      </WorkspacePanel>

      <WorkspacePanel>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Top questions</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
          You might be wondering...
        </h2>
        <div className="mt-5 space-y-4">
          {faqs.map((item) => (
            <details key={item.q} className="group border-b border-[var(--line)]/70 pb-4 last:border-0">
              <summary className="cursor-pointer font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
                {item.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{item.a}</p>
            </details>
          ))}
        </div>
      </WorkspacePanel>
    </main>
  );
}
