import Image from "next/image";
import Link from "next/link";

const ticks = [
  "Vector search",
  "RAG with citations",
  "LangGraph traces",
  "Local models",
  "No retention",
  "Zero cost",
];

const labs = [
  {
    href: "/labs/vector-db",
    title: "Vector DB",
    copy: "Watch meaning become geometry. Query a local index and see the neighbors.",
    tone: "bg-sky",
  },
  {
    href: "/labs/rag",
    title: "RAG",
    copy: "Retrieve first. Generate second. Read the passages the answer stands on.",
    tone: "bg-blush",
  },
  {
    href: "/labs/langgraph",
    title: "LangGraph",
    copy: "A graph you can see: route, retrieve, draft, critique, answer.",
    tone: "bg-butter",
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
    <main>
      <section className="relative min-h-[86vh] overflow-hidden bg-apricot">
        <Image
          src="/brand/impact-mural.png"
          alt="Line illustration of people learning, making, and caring, loosely linked by a constellation"
          fill
          priority
          className="object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cream/90 via-cream/70 to-apricot/35" />
        <div className="relative mx-auto flex min-h-[86vh] max-w-6xl flex-col justify-center px-5 py-24 md:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/70">Local AI classroom</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-black leading-[0.95] md:text-7xl">
            See how AI meets a life
          </h1>
          <p className="mt-6 max-w-xl text-xl font-medium leading-relaxed md:text-2xl">
            A playground for retrieval, graphs, and vector search. People stay in the foreground. Nothing you type is
            kept.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/labs" className="rounded-full bg-ink px-7 py-3 text-lg font-semibold text-cream">
              Open a lab
            </Link>
            <Link href="/#how" className="rounded-full bg-cream px-7 py-3 text-lg font-semibold text-ink">
              How it works
            </Link>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-y border-ink/10 bg-cream py-5">
        <div className="marquee-track flex w-max gap-10 whitespace-nowrap text-lg font-semibold">
          {[...ticks, ...ticks].map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-10">
              {item}
              <span aria-hidden>•</span>
            </span>
          ))}
        </div>
      </section>

      <section className="bg-apricot px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-4xl font-black leading-tight md:text-6xl">
            AI has felt like a black box
            <span className="mt-3 block w-fit rounded-full bg-ink px-4 py-1 text-cream">for too long.</span>
          </h2>
          <p className="mt-8 max-w-2xl text-xl font-medium leading-relaxed">
            It is not about collecting more tools. It is about seeing the steps: a chunk, a neighbor, a citation, a
            node on a graph. This site is built so you can watch that happen on your own machine.
          </p>
        </div>
      </section>

      <section className="bg-cream px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em]">Three doors in</p>
          <h2 className="mt-3 font-display text-4xl font-black md:text-6xl">Start with a lab</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {labs.map((lab) => (
              <Link
                key={lab.href}
                href={lab.href}
                className={`${lab.tone} flex min-h-[280px] flex-col justify-between rounded-card p-8`}
              >
                <h3 className="font-display text-4xl font-black">{lab.title}</h3>
                <p className="text-lg font-medium leading-relaxed">{lab.copy}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="bg-ink px-5 py-20 text-cream md:px-10 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-apricot">How it works</p>
            <h2 className="mt-3 font-display text-4xl font-black md:text-6xl">Learn. Try. See the trace.</h2>
          </div>
          <ol className="space-y-8 text-lg leading-relaxed">
            <li>
              <span className="rounded-full bg-sky px-4 py-1 font-semibold text-ink">Learn</span>
              <p className="mt-3">Each lab tells you what the idea is and why it exists, in plain language.</p>
            </li>
            <li>
              <span className="rounded-full bg-butter px-4 py-1 font-semibold text-ink">Try</span>
              <p className="mt-3">Ask a question of a bundled teaching corpus. Your words are not saved.</p>
            </li>
            <li>
              <span className="rounded-full bg-blush px-4 py-1 font-semibold text-ink">See</span>
              <p className="mt-3">Neighbors, citations, and graph nodes show up beside the answer. The work is visible.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="bg-cream px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-4xl">
          <p className="inline-flex rounded-full bg-blush px-4 py-1 text-sm font-semibold">Top questions</p>
          <h2 className="mt-4 font-display text-4xl font-black md:text-6xl">You might be wondering...</h2>
          <div className="mt-10 space-y-6">
            {faqs.map((item) => (
              <details key={item.q} className="group border-b border-ink/10 pb-6">
                <summary className="cursor-pointer font-display text-2xl font-bold">{item.q}</summary>
                <p className="mt-3 text-lg leading-relaxed text-ink/80">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sky px-5 py-20 text-center md:px-10 md:py-28">
        <h2 className="font-display text-5xl font-black leading-none md:text-7xl">
          Get curious.
          <br />
          Get local.
          <br />
          Get the trace.
        </h2>
        <Link href="/labs" className="mt-10 inline-flex rounded-full bg-ink px-8 py-3 text-lg font-semibold text-cream">
          Open a lab
        </Link>
      </section>
    </main>
  );
}
