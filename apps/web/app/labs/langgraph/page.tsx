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
      why="Hidden agents are hard to learn from. A visible timeline is the lesson."
      seeing="Server-sent events as each node finishes, including intermediate draft and critique."
    >
      <GraphPanel />
    </LabShell>
  );
}
