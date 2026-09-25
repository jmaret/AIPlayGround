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
      seeing="Each step lights as it finishes, with an AWS-scale map beside it. Hover or click a service, model, or scale line for more. Click a finished node for that step’s output."
    >
      <GraphPanel />
    </LabShell>
  );
}
