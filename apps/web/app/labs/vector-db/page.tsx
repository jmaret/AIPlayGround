import type { Metadata } from "next";
import { LabShell } from "@/components/LabShell";
import { VectorPanel } from "./panel";

export const metadata: Metadata = {
  title: "Vector DB — Playground",
};

export default function VectorDbPage() {
  return (
    <LabShell
      eyebrow="Lab 01"
      title="Vector DB"
      what="Each example card becomes a 64-number vector from hashed content words. A query is embedded the same way. Cosine distance picks the nearest neighbors. No Ollama."
      why="This is the floor under RAG. If retrieval is messy, generation will sound sure and still be wrong. A local embedder lets you see the geometry even when Llama is not running."
      seeing="A live ingest→hash→index→query→rank path with an AWS-scale map beside each step. Click a finished step for cards, dimensions, or neighbors."
    >
      <VectorPanel />
    </LabShell>
  );
}
