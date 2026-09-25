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
      what="Each corpus chunk becomes a 64-number vector from hashed character 3-grams. A query is embedded the same way. Cosine distance picks the nearest neighbors. No Ollama."
      why="This is the floor under RAG. If retrieval is messy, generation will sound sure and still be wrong. A local embedder lets you see the geometry even when Llama is not running."
      seeing="Sample queries, the first dimensions of your query vector, then ranked chunks with distances (lower is closer)."
    >
      <VectorPanel />
    </LabShell>
  );
}
