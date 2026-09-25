"use client";

import { PipelineTrace } from "@/components/lab/PipelineTrace";
import { AWS_TWINS, GRAPH_NODES, NODE_JOBS, type GraphNodeName } from "./graph";

type GraphTraceProps = {
  completed: string[];
  running: string | null;
  failed: string | null;
  selected: string | null;
  routeLabel: string | null;
  onSelect: (node: GraphNodeName) => void;
};

export function GraphTrace({ onSelect, routeLabel, ...rest }: GraphTraceProps) {
  return (
    <PipelineTrace
      {...rest}
      steps={GRAPH_NODES.map((id) => ({ id, label: id, job: NODE_JOBS[id] }))}
      twins={AWS_TWINS}
      chips={{ route: routeLabel }}
      onSelect={(id) => onSelect(id as GraphNodeName)}
      startDetail="accept the request"
      endDetail="return the answer"
      mapHint="Adjacent map: how this step could run at AWS scale. This lab still calls Ollama on localhost — no cloud keys, no prompts leave the machine."
      mapAbout="Each strip is a static picture of how that LangGraph node could run in a production AWS account: edge, orchestration, Bedrock models, search, and metrics. Hover or click any dotted label or service card. This playground still calls Ollama on 127.0.0.1 — no AWS keys, no prompts leave the machine."
    />
  );
}
