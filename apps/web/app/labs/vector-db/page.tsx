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
      what="Text becomes chunks, then vectors, then neighbors in an in-memory Chroma index."
      why="This is the floor under RAG. If retrieval is messy, generation will sound sure and still be wrong."
      seeing="A preview of the bundled corpus, then the nearest chunks and their distances when you query."
    >
      <VectorPanel />
    </LabShell>
  );
}
