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
            scripts. Servers bind to localhost.
          </p>
          <p>
            Questions exist for the current request and, at most, a few minutes in process memory — fifteen minutes if a
            refill is waiting for Approve or Deny. Restart the API and that memory is gone. We do not write prompts,
            answers, or uploads to disk, and we do not keep them in the browser.
          </p>
          <p>
            Live labs use Ollama on this machine. The Vector DB lab hashes in process — or in the browser on GitHub
            Pages — and does not call a model. Hugging Face hosted inference and other cloud models are not in this
            build.
          </p>
          <p>
            AWS Architecture on each lab is a teaching map of how those steps could run in production. It is not an API
            call. No AWS keys, no hosted models.
          </p>
          <p>
            The GitHub Pages demo only replays canned teaching questions. It never sends visitor text anywhere.
          </p>
          <p>The longer write-up lives in the repo at docs/privacy-and-security.md.</p>
        </div>
      </WorkspacePanel>
    </main>
  );
}
