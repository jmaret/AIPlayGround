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
      architectureHref="/labs/vector-db/architecture"
      architectureLabel="Vector DB on AWS"
      seeing="Flow on the left lights as each step finishes. AWS Architecture on the right is that step’s box — click the title for the stacked twin. On GitHub Pages the hash runs in the browser — no localhost API. Click a finished step for cards, dimensions, or neighbors."
    >
      <VectorPanel />
    </LabShell>
  );
}
