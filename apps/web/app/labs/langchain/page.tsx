import type { Metadata } from "next";
import { LabShell } from "@/components/LabShell";
import { ChainPanel } from "./panel";

export const metadata: Metadata = {
  title: "LangChain — Playground",
};

export default function LangChainPage() {
  return (
    <LabShell
      eyebrow="Lab 04"
      title="LangChain"
      what="A chain of runnables: retrieve, fill a prompt template, invoke the model, parse JSON. Each hop is a small object you can swap."
      why="A hidden call that “just uses the library” is hard to learn from. The pipe — retriever | prompt | llm | parser — is the lesson. A chain is not a graph; branches live in LangGraph."
      seeing="Hops light as each runnable finishes, with an AWS-scale map beside it. Click a finished hop for passages, the formatted prompt, raw text, or parsed JSON."
    >
      <ChainPanel />
    </LabShell>
  );
}
