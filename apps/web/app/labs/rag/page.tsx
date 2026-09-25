import type { Metadata } from "next";
import { LabShell } from "@/components/LabShell";
import { RagPanel } from "./panel";

export const metadata: Metadata = {
  title: "RAG — Playground",
};

export default function RagPage() {
  return (
    <LabShell
      eyebrow="Lab 02"
      title="RAG"
      what="Retrieve the nearest passages, then generate an answer that is allowed to use only those passages."
      why="A fluent model is not the same as a grounded one. Citations make the difference visible."
      architectureHref="/labs/rag/architecture"
      architectureLabel="RAG on AWS"
      seeing="Flow on the left lights as each step finishes. AWS Architecture on the right is that step’s box — click the title for the stacked twin. Click a finished step for passages or the grounded answer."
    >
      <RagPanel />
    </LabShell>
  );
}
