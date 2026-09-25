import type { Metadata } from "next";
import { LabArchitecture } from "@/components/lab/LabArchitecture";
import { AWS_TWINS, GRAPH_NODES } from "../graph";

export const metadata: Metadata = {
  title: "Agentic AI on AWS — Playground",
};

const ORDER = ["start", ...GRAPH_NODES, "end"] as const;

export default function RefillArchitecturePage() {
  return (
    <LabArchitecture
      eyebrow="Lab 05"
      title="Agentic AI on AWS"
      subtitle="Physical twin of the lab graph"
      labHref="/labs/refill"
      what="The same intake → policy → script → safety → decide → review → act graph, drawn as AWS boxes: Ingress, Intake, Knowledge, Script, Safety, Choice, Human task, Final, Egress."
      why="The live lab uses fictional in-memory tools. This page is the production-scale picture of those jobs."
      seeing="Each box is a stage. Arrows inside a box are service hops. Arrows between boxes follow the graph."
      blurb="Teaching map only. This playground still calls Ollama on localhost — no AWS keys, no real EHR or pharmacy APIs, no prompts leave the machine."
      twins={AWS_TWINS}
      order={ORDER}
    />
  );
}
