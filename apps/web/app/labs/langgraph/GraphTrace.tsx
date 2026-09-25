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
      architectureHref="/labs/langgraph/architecture"
      architectureLabel="LangGraph on AWS"
    />
  );
}
