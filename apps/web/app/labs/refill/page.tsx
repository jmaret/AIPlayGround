import type { Metadata } from "next";
import { LabShell } from "@/components/LabShell";
import { RefillPanel } from "./panel";

export const metadata: Metadata = {
  title: "Agentic AI — Playground",
};

export default function RefillPage() {
  return (
    <LabShell
      eyebrow="Lab 05"
      title="Agentic AI"
      what="An explicit refill graph: intake, policy, script, safety, decide, review, act. Local tools pick the path. The model writes the note."
      why="A hidden refill bot is hard to trust. A visible graph — and a pharmacist click on escalate — is the lesson."
      seeing="Click a sample prompt to read what that path means in plain language, then watch the graph. Controlled, expired, and labs pause for Approve or Deny. This is a fictional teaching chart, not a clinic."
    >
      <RefillPanel />
    </LabShell>
  );
}
