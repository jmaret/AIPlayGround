import type { Metadata } from "next";
import { WorkspacePanel } from "@/components/WorkspacePanel";

export const metadata: Metadata = {
  title: "Privacy — Playground",
};

export default function PrivacyPage() {
  return (
    <main>
      <WorkspacePanel>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Trust</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)]">
          Nothing you type is kept
        </h1>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
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
      </WorkspacePanel>
    </main>
  );
}
