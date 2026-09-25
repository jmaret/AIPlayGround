import type { Metadata } from "next";
import { LabArchitecture } from "@/components/lab/LabArchitecture";
import { VECTOR_STEPS, VECTOR_TWINS } from "../pipeline";

export const metadata: Metadata = {
  title: "Vector DB on AWS — Playground",
};

const ORDER = ["start", ...VECTOR_STEPS, "end"] as const;

export default function VectorDbArchitecturePage() {
  return (
    <LabArchitecture
      eyebrow="Lab 01"
      title="Vector DB on AWS"
      subtitle="Physical twin of the lab path"
      labHref="/labs/vector-db"
      what="The same ingest → hash → index → query → rank path, drawn as AWS boxes: Ingress, Corpus, Embed, Store, Query embed, k-NN, Egress."
      why="The live lab hashes in RAM. This page is the production-scale picture of those jobs."
      seeing="Each box is a stage. Arrows inside a box are service hops. Arrows between boxes follow the path."
      blurb="Teaching map only. This playground hashes word tokens in process memory — no Bedrock, no OpenSearch, no AWS keys, and no prompts leave the machine."
      twins={VECTOR_TWINS}
      order={ORDER}
    />
  );
}
