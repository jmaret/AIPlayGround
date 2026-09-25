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
      architectureHref="/labs/refill/architecture"
    />
  );
}
