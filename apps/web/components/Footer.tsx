import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-3 md:px-10">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-lg leading-relaxed text-cream/80">
            A local classroom for retrieval, graphs, and vector search. Prompts stay on this machine.
          </p>
        </div>
        <div>
          <p className="font-display text-xl font-bold">Explore</p>
          <ul className="mt-4 space-y-2 text-lg">
            <li>
              <Link href="/labs/vector-db">Vector DB</Link>
            </li>
            <li>
              <Link href="/labs/rag">RAG</Link>
            </li>
            <li>
              <Link href="/labs/langgraph">LangGraph</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-display text-xl font-bold">Trust</p>
          <ul className="mt-4 space-y-2 text-lg">
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
            <li>Living docs live in the repo under docs/</li>
          </ul>
        </div>
      </div>
      <p className="border-t border-cream/15 px-5 py-6 text-center text-sm text-cream/60 md:px-10">
        Local only. No accounts. No newsletter. © {new Date().getFullYear()} Playground.
      </p>
    </footer>
  );
}
