import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy — Playground",
};

export default function PrivacyPage() {
  return (
    <main className="bg-cream px-5 py-16 md:px-10 md:py-24">
      <article className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-apricot">Trust</p>
        <h1 className="mt-3 font-display text-5xl font-black">Nothing you type is kept</h1>
        <div className="mt-8 space-y-6 text-lg leading-relaxed">
          <p>
            Playground is a local learning tool. There are no accounts, no newsletter, no analytics, and no third-party
            scripts. Servers bind to 127.0.0.1.
          </p>
          <p>
            Questions exist for the current request and, at most, a few minutes in process memory. Restart the API and
            that memory is gone. We do not write prompts, answers, or uploads to disk.
          </p>
          <p>
            v1 talks only to Ollama on this machine. Hugging Face hosted inference and other cloud models are not in
            this build.
          </p>
          <p>The longer write-up lives in the repo at docs/privacy-and-security.md.</p>
        </div>
      </article>
    </main>
  );
}
