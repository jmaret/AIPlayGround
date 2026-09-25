import type { AwsTwinMap } from "@/components/lab/aws";

export type { AwsBox, AwsGlyph, AwsModel, AwsTwinMap } from "@/components/lab/aws";

export const GRAPH_NODES = [
  "intake",
  "retrieve_policy",
  "check_script",
  "safety",
  "decide",
  "review",
  "act",
] as const;

export type GraphNodeName = (typeof GRAPH_NODES)[number];

export type GraphEvent = {
  node: string;
  update?: Record<string, unknown>;
  detail?: string;
};

export const NODE_JOBS: Record<GraphNodeName, string> = {
  intake: "read channel and identifiers",
  retrieve_policy: "fetch refill rules",
  check_script: "look up the teaching script",
  safety: "controlled, labs, early fill",
  decide: "label the path",
  review: "pharmacist gate or skip",
  act: "approve, deny, or refuse",
};

export function isGraphNode(value: string): value is GraphNodeName {
  return (GRAPH_NODES as readonly string[]).includes(value);
}

export const AWS_TWINS: Record<GraphNodeName | "start" | "end", AwsTwinMap> = {
  start: {
    title: "Ingress",
    about: "The front door for a refill request. In production this is a patient app or a pharmacy callback, never a model on the public internet. This lab is a localhost POST.",
    scale: "Multi-AZ edge, WAF, no PHI in access logs",
    scaleAbout:
      "CloudFront and API Gateway scale per request. Access logs should keep method, path, status, and duration — not names, dates of birth, or the question body.",
    boxes: [
      {
        name: "CloudFront",
        role: "TLS + cache",
        glyph: "edge",
        about: "Terminates TLS near the caller. Do not cache personalized refill answers at the edge.",
      },
      {
        name: "WAF",
        role: "edge filters",
        glyph: "shield",
        about: "Rate limits and bot control. It does not read the prompt for clinical meaning.",
      },
      {
        name: "API Gateway",
        role: "HTTP API",
        glyph: "edge",
        about: "Managed HTTP front. The production twin of FastAPI on localhost:8000.",
      },
      {
        name: "Step Functions",
        role: "the graph",
        glyph: "workflow",
        about: "Named states and Choice branches. This lab compiles LangGraph in-process instead.",
      },
    ],
  },
  intake: {
    title: "Intake",
    about: "Parse channel (patient vs pharmacy) and match teaching identifiers. Cheap rules first. Do not log the raw request body.",
    models: [
      {
        name: "Nova Micro",
        about: "A small classifier if the words are messy. This lab uses deterministic parse rules so the six paths stay stable.",
      },
    ],
    scale: "Lambda reserved concurrency + metadata-only logs",
    scaleAbout:
      "Identity matching is a short function. Reserved concurrency keeps the hot path warm. CloudWatch should never see the identifiers themselves.",
    boxes: [
      {
        name: "API Gateway",
        role: "accept the request",
        glyph: "edge",
        about: "Validates size and content type. The playground caps the question at 500 characters.",
      },
      {
        name: "Lambda",
        role: "parse + match",
        glyph: "compute",
        about: "Extracts channel, medication, and 2-of-3 teaching identifiers against an in-memory chart.",
      },
      {
        name: "WAF",
        role: "no body logs",
        glyph: "shield",
        about: "Remind the edge: method and status are fine. Prescription text is not.",
      },
    ],
  },
  retrieve_policy: {
    title: "Knowledge",
    about: "Fetch the teaching refill policy, not a live chart. On AWS the corpus lives in S3; Bedrock Knowledge Bases owns chunking and query.",
    models: [
      {
        name: "Titan Text Embeddings V2",
        about: "Maps policy text to a vector so OpenSearch can rank neighbors. Locally this is nomic-embed-text.",
      },
    ],
    scale: "OpenSearch OCUs; policy objects in S3",
    scaleAbout:
      "Keep patient facts out of the corpus. The index holds rules. The chart is a separate, short-lived store.",
    boxes: [
      {
        name: "S3",
        role: "policy objects",
        glyph: "bucket",
        about: "Durable source files — the production twin of data/corpus/refill.md.",
      },
      {
        name: "Bedrock KB",
        role: "ingest + query",
        glyph: "search",
        about: "Managed RAG over the policy. This lab filters Chroma to source refill.md.",
      },
      {
        name: "OpenSearch",
        role: "vector engine",
        glyph: "search",
        about: "k-NN over policy passages. Distances mean closeness, not truth.",
      },
    ],
  },
  check_script: {
    title: "Script",
    about: "A deterministic lookup: refills remaining, last fill, expired. Not an LLM. In production this is an EHR or eRx read.",
    scale: "Short Lambda against a clinical API, not a model",
    scaleAbout:
      "Structured reads are cheap and testable. Do not ask a model whether three refills remain.",
    boxes: [
      {
        name: "Lambda",
        role: "get_script",
        glyph: "compute",
        about: "The local tool in this lab. At AWS scale, a function that calls FHIR or a native eRx module.",
      },
      {
        name: "Step Functions",
        role: "named state",
        glyph: "workflow",
        about: "A Task state with retries if the EHR is briefly down. Fail over to a human queue, not a guess.",
      },
    ],
  },
  safety: {
    title: "Safety",
    about: "Controlled-substance, early-refill, and overdue-lab flags. Rules first. Guardrails can add a second policy pass.",
    models: [
      {
        name: "Guardrails",
        about: "Denied topics and PII filters. They do not replace the Schedule II–V rule: never auto-approve controlled drugs.",
      },
    ],
    scale: "Fail closed on policy hits",
    scaleAbout:
      "If the EHR or PBM flag is missing, escalate. Do not invent a clean record.",
    boxes: [
      {
        name: "Lambda",
        role: "deterministic checks",
        glyph: "compute",
        about: "check_controlled, check_early_refill, check_labs. Same jobs as the Python tools in this lab.",
      },
      {
        name: "Bedrock Guardrails",
        role: "policy layer",
        glyph: "shield",
        about: "A second fence for PII and denied topics after the structured flags.",
      },
    ],
  },
  decide: {
    title: "Choice",
    about: "Write a path label from the tool results: auto-approve, controlled, renewal, early-or-labs, or identity. The model does not pick the gate.",
    models: [
      {
        name: "Nova Micro",
        about: "Only if you needed a messy-language classifier. This lab uses a pure function over tool flags.",
      },
    ],
    scale: "Step Functions Choice on structured flags",
    scaleAbout:
      "A Choice state branches on path. The teaching UI stays a linear rail and hangs the label as a chip.",
    boxes: [
      {
        name: "Step Functions",
        role: "Choice state",
        glyph: "workflow",
        about: "auto_approve vs escalate vs refuse. In this lab the label is a chip; review still has a node.",
      },
      {
        name: "Lambda",
        role: "decide_path",
        glyph: "compute",
        about: "Priority: identity, then controlled, then expired, then labs or early fill, else zero-touch.",
      },
    ],
  },
  review: {
    title: "Human task",
    about: "Zero-touch skips this gate. Identity refuses to the front desk. Controlled, renewal, and labs wait for Approve or Deny. State lives in a TTL cache, not a patient archive.",
    models: [
      {
        name: "Claude",
        about: "Drafts the short review note after a human clicks. The click is the gate; the model is the prose.",
      },
    ],
    scale: "Task token + ElastiCache TTL; 15 minutes in this playground",
    scaleAbout:
      "Step Functions can wait on a callback. If the token expires, the run dies. That is the AWS twin of EphemeralStore.",
    boxes: [
      {
        name: "Step Functions",
        role: "wait for callback",
        glyph: "workflow",
        about: "A .waitForTaskToken state. This lab yields await_human and stores the run in process memory.",
      },
      {
        name: "ElastiCache",
        role: "TTL run state",
        glyph: "cache",
        about: "Short-lived pending graph state. Restart or expiry drops it. Not a refill queue on disk.",
      },
      {
        name: "Bedrock",
        role: "review prose",
        glyph: "model",
        about: "After Approve or Deny, a short grounded note. Locally this is Ollama.",
      },
    ],
  },
  act: {
    title: "Final",
    about: "Submit a fictional PMS order, or say denied / refused. Filter the outgoing note. Do not persist the answer.",
    models: [
      {
        name: "Claude Sonnet",
        about: "Writes the patient-facing teaching note from policy passages and the structured outcome.",
      },
      {
        name: "Guardrails",
        about: "Output filter on the way out. Complements the structured path; does not replace it.",
      },
    ],
    scale: "Generate, then filter, then return",
    scaleAbout:
      "The client should see the filtered note, not a raw model dump. Metrics only in the logs.",
    boxes: [
      {
        name: "Bedrock",
        role: "final generate",
        glyph: "model",
        about: "Last model call. Prompt includes path, review status, and policy passages.",
      },
      {
        name: "Guardrails",
        role: "output filter",
        glyph: "shield",
        about: "Catch leftover identifiers or ungrounded advice before the response leaves the region.",
      },
      {
        name: "API Gateway",
        role: "stream / JSON",
        glyph: "edge",
        about: "SSE in this lab. Production could stream or return JSON. Still no prompt bodies in gateway logs.",
      },
    ],
  },
  end: {
    title: "Egress",
    about: "Hand the outcome back. Drop the run. Keep operational numbers only.",
    scale: "Metrics only — no refill text in logs",
    scaleAbout:
      "CloudWatch should see latency and status. The teaching chart and the note stay out of logs.",
    boxes: [
      {
        name: "API Gateway",
        role: "response",
        glyph: "edge",
        about: "Ends the state machine. The body is the answer, not something to archive.",
      },
      {
        name: "CloudWatch",
        role: "latency / status",
        glyph: "metrics",
        about: "Method, path, status, duration. Never the question or the mock chart.",
      },
      {
        name: "ElastiCache",
        role: "drop the run",
        glyph: "cache",
        about: "TTL already running. Resume pops the key. Restart wipes the rest.",
      },
    ],
  },
};
