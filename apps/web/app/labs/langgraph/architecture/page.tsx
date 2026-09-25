import type { Metadata } from "next";
import { LabArchitecture } from "@/components/lab/LabArchitecture";
import { AWS_TWINS, GRAPH_NODES } from "../graph";

export const metadata: Metadata = {
  title: "LangGraph on AWS — Playground",
};

const ORDER = ["start", ...GRAPH_NODES, "end"] as const;

export default function LangGraphArchitecturePage() {
  return (
    <LabArchitecture
      eyebrow="Lab 03"
      title="LangGraph on AWS"
      subtitle="Physical twin of the lab graph"
      labHref="/labs/langgraph"
      what="The same START → route → retrieve → draft → critique → answer → END path, drawn as AWS boxes: Ingress, Intent, Knowledge, Generate, Review, Final, Egress."
      why="The live lab streams LangGraph nodes on localhost. This page is the production-scale picture of those jobs."
      seeing="Each box is a stage. Arrows inside a box are service hops. Arrows between boxes follow the graph."
      blurb="Teaching map only. This playground still calls Ollama on localhost — no AWS keys, no hosted models, no prompts leave the machine."
      twins={AWS_TWINS}
      order={ORDER}
    />
  );
}
