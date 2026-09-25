"use client";

import { PipelineTrace } from "@/components/lab/PipelineTrace";
import { AWS_TWINS, GRAPH_NODES, NODE_JOBS, type GraphNodeName } from "./graph";

type GraphTraceProps = {
  completed: string[];
  running: string | null;
  failed: string | null;
  selected: string | null;
  chips?: Record<string, string | null | undefined>;
  onSelect: (node: GraphNodeName) => void;
};

export function GraphTrace({ onSelect, chips, ...rest }: GraphTraceProps) {
  return (
    <PipelineTrace
      {...rest}
      steps={GRAPH_NODES.map((id) => ({ id, label: id, job: NODE_JOBS[id] }))}
      twins={AWS_TWINS}
      chips={chips}
      onSelect={(id) => onSelect(id as GraphNodeName)}
      startDetail="accept the request"
      endDetail="return the outcome"
      mapHint="Adjacent map: how this step could run at AWS scale. This lab still calls Ollama on localhost — no cloud keys, no prompts leave the machine."
      mapAbout="Each strip is a static picture of how that refill node could run in a production AWS account: edge, policy retrieval, deterministic checks, a Choice state, and a human task. Hover or click any dotted label or service card. This playground still calls Ollama on localhost — no AWS keys, no real EHR or pharmacy APIs."
    />
  );
}
