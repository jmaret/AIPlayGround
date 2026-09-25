import type { Metadata } from "next";
import { LabShell } from "@/components/LabShell";
import { GraphPanel } from "./panel";

export const metadata: Metadata = {
  title: "LangGraph — Playground",
};

export default function LangGraphPage() {
  return (
    <LabShell
      eyebrow="Lab 03"
      title="LangGraph"
      what="An explicit graph: route, retrieve, draft, critique, answer. Each node has one job."
      why="Hidden agents are hard to learn from. A visible graph is the lesson."
      architectureHref="/labs/langgraph/architecture"
      architectureLabel="LangGraph on AWS"
      seeing="Flow on the left lights as each step finishes. AWS Architecture on the right is that step’s box — click the title for the stacked twin. Click a finished node for that step’s output."
    >
      <GraphPanel />
    </LabShell>
  );
}
