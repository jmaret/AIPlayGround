import type { AwsRegionPictureSpec } from "./AwsRegionPicture";

export const LANGGRAPH_REGION: AwsRegionPictureSpec = {
  caption: "LangGraph physical architecture on AWS",
  engine: "Step Functions",
  engineNote: "Named states, same order as the lab",
  edge: [
    { name: "CloudFront", kind: "edge" },
    { name: "WAF", kind: "policy" },
    { name: "API Gateway", kind: "edge" },
  ],
  states: [
    {
      id: "route",
      icons: [
        { name: "Lambda", kind: "orchestrate" },
        { name: "Bedrock", kind: "model", note: "Nova Micro" },
      ],
    },
    {
      id: "retrieve",
      icons: [
        { name: "S3", kind: "storage" },
        { name: "Bedrock KB", kind: "model" },
        { name: "OpenSearch", kind: "search" },
      ],
    },
    {
      id: "draft",
      icons: [{ name: "Bedrock Runtime", kind: "model", note: "AZ-a / AZ-b" }],
    },
    {
      id: "critique",
      icons: [
        { name: "Guardrails", kind: "policy" },
        { name: "Bedrock", kind: "model" },
        { name: "Lambda", kind: "orchestrate" },
      ],
    },
    {
      id: "answer",
      icons: [
        { name: "Bedrock", kind: "model" },
        { name: "Guardrails", kind: "policy" },
        { name: "API Gateway", kind: "edge" },
      ],
    },
  ],
  metrics: { name: "CloudWatch", kind: "search", note: "metrics only" },
  session: { name: "ElastiCache", kind: "storage", note: "TTL session" },
  egress: { name: "CloudFront", kind: "edge", note: "egress" },
};

export const VECTOR_REGION: AwsRegionPictureSpec = {
  caption: "Vector DB physical architecture on AWS",
  engine: "Query path",
  engineNote: "Named steps, same order as the lab",
  edge: [
    { name: "API Gateway", kind: "edge" },
    { name: "WAF", kind: "policy" },
    { name: "Lambda", kind: "orchestrate" },
  ],
  states: [
    {
      id: "ingest",
      icons: [
        { name: "S3", kind: "storage" },
        { name: "Lambda", kind: "orchestrate" },
      ],
    },
    {
      id: "hash",
      icons: [
        { name: "Bedrock", kind: "model", note: "Titan embed" },
        { name: "Lambda", kind: "orchestrate" },
      ],
    },
    {
      id: "index",
      icons: [
        { name: "OpenSearch", kind: "search" },
        { name: "Aurora", kind: "storage", note: "pgvector option" },
      ],
    },
    {
      id: "query",
      icons: [
        { name: "API Gateway", kind: "edge" },
        { name: "Bedrock", kind: "model" },
      ],
    },
    {
      id: "rank",
      icons: [
        { name: "OpenSearch", kind: "search" },
        { name: "Lambda", kind: "orchestrate" },
      ],
    },
  ],
  metrics: { name: "CloudWatch", kind: "search", note: "metrics only" },
  egress: { name: "API Gateway", kind: "edge", note: "egress" },
};

export const RAG_REGION: AwsRegionPictureSpec = {
  caption: "RAG physical architecture on AWS",
  engine: "Step Functions",
  engineNote: "Named states, same order as the lab",
  edge: [
    { name: "CloudFront", kind: "edge" },
    { name: "API Gateway", kind: "edge" },
    { name: "Step Functions", kind: "orchestrate" },
  ],
  states: [
    {
      id: "embed",
      icons: [
        { name: "Bedrock", kind: "model", note: "Titan embed" },
        { name: "Lambda", kind: "orchestrate" },
      ],
    },
    {
      id: "retrieve",
      icons: [
        { name: "S3", kind: "storage" },
        { name: "Bedrock KB", kind: "model" },
        { name: "OpenSearch", kind: "search" },
      ],
    },
    {
      id: "ground",
      icons: [
        { name: "Lambda", kind: "orchestrate" },
        { name: "Guardrails", kind: "policy" },
      ],
    },
    {
      id: "generate",
      icons: [{ name: "Bedrock Runtime", kind: "model", note: "AZ-a / AZ-b" }],
    },
    {
      id: "cite",
      icons: [
        { name: "Guardrails", kind: "policy" },
        { name: "Lambda", kind: "orchestrate" },
      ],
    },
  ],
  metrics: { name: "CloudWatch", kind: "search", note: "metrics only" },
  egress: { name: "CloudFront", kind: "edge", note: "egress" },
};

export const LANGCHAIN_REGION: AwsRegionPictureSpec = {
  caption: "LangChain physical architecture on AWS",
  engine: "LCEL pipe",
  engineNote: "Named hops, same order as the lab",
  edge: [
    { name: "API Gateway", kind: "edge" },
    { name: "Lambda", kind: "orchestrate" },
  ],
  states: [
    {
      id: "bind",
      icons: [
        { name: "Lambda", kind: "orchestrate" },
        { name: "Parameter Store", kind: "storage" },
      ],
    },
    {
      id: "retrieve",
      icons: [
        { name: "Bedrock KB", kind: "model" },
        { name: "OpenSearch", kind: "search" },
      ],
    },
    {
      id: "template",
      icons: [
        { name: "Bedrock Prompts", kind: "orchestrate" },
        { name: "Lambda", kind: "orchestrate" },
      ],
    },
    {
      id: "invoke",
      icons: [
        { name: "Bedrock Runtime", kind: "model" },
        { name: "Guardrails", kind: "policy" },
      ],
    },
    {
      id: "parse",
      icons: [
        { name: "Lambda", kind: "orchestrate" },
        { name: "Bedrock", kind: "model" },
      ],
    },
  ],
  metrics: { name: "CloudWatch", kind: "search", note: "metrics only" },
  egress: { name: "API Gateway", kind: "edge", note: "egress" },
};

export const REFILL_REGION: AwsRegionPictureSpec = {
  caption: "Agentic AI physical architecture on AWS",
  engine: "Step Functions",
  engineNote: "Named states, same order as the lab",
  edge: [
    { name: "CloudFront", kind: "edge" },
    { name: "WAF", kind: "policy" },
    { name: "API Gateway", kind: "edge" },
  ],
  states: [
    {
      id: "intake",
      icons: [
        { name: "Lambda", kind: "orchestrate" },
        { name: "WAF", kind: "policy" },
      ],
    },
    {
      id: "retrieve_policy",
      icons: [
        { name: "S3", kind: "storage" },
        { name: "Bedrock KB", kind: "model" },
        { name: "OpenSearch", kind: "search" },
      ],
    },
    {
      id: "check_script",
      icons: [
        { name: "Lambda", kind: "orchestrate" },
        { name: "Step Functions", kind: "orchestrate" },
      ],
    },
    {
      id: "safety",
      icons: [
        { name: "Lambda", kind: "orchestrate" },
        { name: "Guardrails", kind: "policy" },
      ],
    },
    {
      id: "decide",
      icons: [
        { name: "Step Functions", kind: "orchestrate" },
        { name: "Lambda", kind: "orchestrate" },
      ],
    },
    {
      id: "review",
      icons: [
        { name: "Step Functions", kind: "orchestrate" },
        { name: "ElastiCache", kind: "storage" },
        { name: "Bedrock", kind: "model" },
      ],
    },
    {
      id: "act",
      icons: [
        { name: "Bedrock", kind: "model" },
        { name: "Guardrails", kind: "policy" },
        { name: "API Gateway", kind: "edge" },
      ],
    },
  ],
  metrics: { name: "CloudWatch", kind: "search", note: "metrics only" },
  session: { name: "ElastiCache", kind: "storage", note: "TTL session" },
  egress: { name: "CloudFront", kind: "edge", note: "egress" },
};
