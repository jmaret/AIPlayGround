import type { Metadata } from "next";
import { LabArchitecture } from "@/components/lab/LabArchitecture";
import { CHAIN_STEPS, CHAIN_TWINS } from "../pipeline";

export const metadata: Metadata = {
  title: "LangChain on AWS — Playground",
};

const ORDER = ["start", ...CHAIN_STEPS, "end"] as const;

export default function LangChainArchitecturePage() {
  return (
    <LabArchitecture
      eyebrow="Lab 04"
      title="LangChain on AWS"
      subtitle="Physical twin of the lab pipe"
      labHref="/labs/langchain"
      what="The same bind → retrieve → template → invoke → parse pipe, drawn as AWS boxes: Ingress, Compose, Retriever, Prompt, Model, Parser, Egress."
      why="The live lab streams runnables on localhost. This page is the production-scale picture of those hops."
      seeing="Each box is a stage. Arrows inside a box are service hops. Arrows between boxes follow the pipe."
      blurb="Teaching map only. This playground uses langchain-core plus Ollama on localhost — no AWS keys, no hosted models, no prompts leave the machine."
      twins={CHAIN_TWINS}
      order={ORDER}
    />
  );
}
