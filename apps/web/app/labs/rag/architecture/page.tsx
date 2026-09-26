import type { Metadata } from "next";
import { LabArchitecture } from "@/components/lab/LabArchitecture";
import { RAG_REGION } from "@/components/lab/region-pictures";
import { RAG_STEPS, RAG_TWINS } from "../pipeline";

export const metadata: Metadata = {
  title: "RAG on AWS — Playground",
};

const ORDER = ["start", ...RAG_STEPS, "end"] as const;

export default function RagArchitecturePage() {
  return (
    <LabArchitecture
      eyebrow="Lab 02"
      title="RAG on AWS"
      subtitle="Physical twin of the lab path"
      labHref="/labs/rag"
      what="The same embed → retrieve → ground → generate → cite path, drawn as AWS boxes: Ingress, Question vector, Knowledge, Prompt bind, Answer, Ground check, Egress."
      why="The live lab uses Ollama and in-memory Chroma. This page is the production-scale picture of those jobs."
      seeing="The region picture shows Browser → Edge → named lab states → egress. Stage boxes below are the same twin grouped as the live Flow column."
      blurb="Teaching map only. Inference stays on Ollama at localhost — no cloud keys, no hosted models, no prompts leave the machine."
      picture={RAG_REGION}
      twins={RAG_TWINS}
      order={ORDER}
    />
  );
}
