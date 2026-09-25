export const GRAPH_NODES = ["route", "retrieve", "draft", "critique", "answer"] as const;

export type GraphNodeName = (typeof GRAPH_NODES)[number];

export type GraphEvent = {
  node: string;
  update?: Record<string, unknown>;
  detail?: string;
};

export const NODE_JOBS: Record<GraphNodeName, string> = {
  route: "label the path",
  retrieve: "fetch three passages",
  draft: "write from passages",
  critique: "check the draft",
  answer: "apply the critique",
};

export function isGraphNode(value: string): value is GraphNodeName {
  return (GRAPH_NODES as readonly string[]).includes(value);
}

export type AwsGlyph = "edge" | "shield" | "workflow" | "compute" | "model" | "bucket" | "search" | "cache" | "metrics";

export type AwsBox = {
  name: string;
  role: string;
  glyph: AwsGlyph;
  about: string;
};

export type AwsModel = {
  name: string;
  about: string;
};

export type AwsTwinMap = {
  title: string;
  about: string;
  models?: AwsModel[];
  scale: string;
  scaleAbout: string;
  boxes: AwsBox[];
};

export const AWS_TWINS: Record<GraphNodeName | "start" | "end", AwsTwinMap> = {
  start: {
    title: "Ingress",
    about: "The front door. Users never talk to a model directly. Traffic hits a CDN and firewall, then a managed HTTP API that starts the state machine — the production twin of this LangGraph.",
    scale: "Multi-AZ edge, auto-scaled HTTP APIs",
    scaleAbout:
      "CloudFront and API Gateway scale per request across Availability Zones. You do not provision boxes at the edge. A zone failure should not take the door offline.",
    boxes: [
      {
        name: "CloudFront",
        role: "TLS + cache",
        glyph: "edge",
        about: "Amazon’s CDN. It terminates TLS near the user, can cache safe GETs, and forwards the API call to API Gateway. Global points of presence absorb spikes before they reach compute.",
      },
      {
        name: "WAF",
        role: "edge filters",
        glyph: "shield",
        about: "Web Application Firewall. Rate limits, bot control, and common HTTP exploits. It is not an LLM and does not read your prompt for meaning — it only inspects the request as web traffic.",
      },
      {
        name: "API Gateway",
        role: "HTTP API",
        glyph: "edge",
        about: "Managed HTTP front. Throttles, validates the body, and can stream or return JSON. This is the scalable stand-in for FastAPI on 127.0.0.1:8000.",
      },
      {
        name: "Step Functions",
        role: "the graph",
        glyph: "workflow",
        about: "AWS’s state machine. Named states, retries, and Choice branches. In production this graph would be a Step Functions definition (or LangGraph on ECS/Fargate) instead of an in-process compile.",
      },
    ],
  },
  route: {
    title: "Intent",
    about: "Decide what kind of question this is before spending a large model. Cheap rules first, then a small classifier if the words are ambiguous.",
    models: [
      {
        name: "Nova Micro",
        about: "Amazon Nova Micro is the smallest text-only Nova model on Bedrock. Fast and inexpensive. Built for classification, routing, and short labels — not long grounded essays. That is why it sits on this step.",
      },
      {
        name: "Claude Haiku",
        about: "Anthropic’s fastest Claude on Bedrock. Another small-model option for intent. You would pick Micro or Haiku for latency and price, not for the final answer.",
      },
    ],
    scale: "On-demand Bedrock + Lambda reserved concurrency",
    scaleAbout:
      "Bedrock on-demand charges per token and scales without you standing up GPUs. Lambda reserved concurrency keeps a warm pool so the keyword path stays in the tens of milliseconds.",
    boxes: [
      {
        name: "Step Functions",
        role: "Choice state",
        glyph: "workflow",
        about: "A Choice state branches on the route label. In this lab the label is written but retrieve still always runs. In AWS you could actually skip retrieval when the question is only about the graph.",
      },
      {
        name: "Lambda",
        role: "rules / keywords",
        glyph: "compute",
        about: "A short function that does the same keyword check this lab does in Python. No model cost. Reserved concurrency avoids a cold start on the hot path.",
      },
      {
        name: "Bedrock",
        role: "small classifier",
        glyph: "model",
        about: "Bedrock is a managed API to many foundation models. Here you would invoke a tiny one (Nova Micro or Claude Haiku) only if rules cannot decide. You never SSH to a GPU box.",
      },
    ],
  },
  retrieve: {
    title: "Knowledge",
    about: "Turn the question into a vector, then fetch nearby passages. On AWS the corpus lives in S3; Bedrock Knowledge Bases owns chunking, embedding, and query.",
    models: [
      {
        name: "Titan Text Embeddings V2",
        about: "Amazon’s embedding model on Bedrock. It maps text to a vector so OpenSearch can rank neighbors by distance — the same job nomic-embed-text or the hashed index does locally.",
      },
    ],
    scale: "OpenSearch OCUs autoscale; corpus in S3",
    scaleAbout:
      "OpenSearch Serverless adds or removes OCUs (OpenSearch Compute Units) with query load. S3 holds the source files so you can rebuild the index without a local disk of prompts.",
    boxes: [
      {
        name: "S3",
        role: "corpus objects",
        glyph: "bucket",
        about: "Object storage for the teaching corpus (markdown, later PDFs). Durable and cheap. Bedrock Knowledge Bases reads from a bucket instead of `data/corpus/` on disk.",
      },
      {
        name: "Bedrock KB",
        role: "ingest + query",
        glyph: "search",
        about: "Bedrock Knowledge Bases: managed RAG. It chunks objects, embeds them, stores vectors, and returns passages. You do not wire chunk → embed → query yourself.",
      },
      {
        name: "OpenSearch",
        role: "vector engine",
        glyph: "search",
        about: "OpenSearch Serverless vector engine (k-NN). This is the production twin of in-memory Chroma or the hashed index. Distances still mean “how close,” not “true.”",
      },
    ],
  },
  draft: {
    title: "Generate",
    about: "Write a first answer from the retrieved passages only. This is the expensive token step, so you run it in more than one Availability Zone and pick a mid-size model.",
    models: [
      {
        name: "Claude Sonnet",
        about: "Anthropic’s mid-size Claude on Bedrock. Strong at drafting from passages, cheaper than Opus. A common default for the generate node.",
      },
      {
        name: "Llama 3.3 70B",
        about: "Meta’s open-weight 70B-class model, available on Bedrock. An alternative generator if you want a non-Anthropic option or different price/quality.",
      },
      {
        name: "Nova Pro",
        about: "Amazon Nova Pro is the more capable Nova (text and image). Heavier than Micro. Use it when you want an Amazon model for the draft, not for routing.",
      },
    ],
    scale: "On-demand, three AZs; provisioned throughput if QPS is steady",
    scaleAbout:
      "On-demand is pay-per-token and fine for a lab-like load. Provisioned throughput reserves Bedrock capacity when traffic is steady and you cannot wait on a busy model.",
    boxes: [
      {
        name: "Bedrock Runtime",
        role: "cross-AZ infer",
        glyph: "model",
        about: "The Bedrock Invoke / Converse API. AWS runs the model in the region. You send the draft prompt and passages; you do not manage GPUs or AMIs.",
      },
      {
        name: "AZ-a",
        role: "Sonnet",
        glyph: "model",
        about: "An Availability Zone is an isolated data center in the region. Showing AZ-a means “run this inference in more than one building” so a single-zone outage does not stall every draft.",
      },
      {
        name: "AZ-b",
        role: "Llama 3.3",
        glyph: "model",
        about: "A second zone, optionally a second model. Some teams pin one model per AZ for capacity; others let Bedrock place the call. The picture is resilience, not a required split.",
      },
    ],
  },
  critique: {
    title: "Review",
    about: "A second pass that must not invent facts. Guardrails check groundedness; a stronger model writes the critique; Lambda can enforce hard rules (citations present, length).",
    models: [
      {
        name: "Claude",
        about: "A stronger Claude (often Sonnet or Opus) reviews the draft against the passages. Using a different call — and sometimes a different model — keeps the critic from rubber-stamping the drafter.",
      },
      {
        name: "Guardrails groundedness",
        about: "Bedrock Guardrails can score whether a reply stays inside the retrieved sources. Fail closed: if the check fails, do not ship the draft as the answer.",
      },
    ],
    scale: "Separate model call; fail closed on policy hits",
    scaleAbout:
      "Critique is another billed invocation. Keep it separate so retries and timeouts do not mix with draft. If Guardrails or the critic flags the text, the graph should revise or refuse — not continue.",
    boxes: [
      {
        name: "Bedrock Guardrails",
        role: "ground + filter",
        glyph: "shield",
        about: "A policy layer in front of or after a model: denied topics, PII redaction, and groundedness versus source passages. This is product safety, not the graph’s critique prose.",
      },
      {
        name: "Bedrock",
        role: "stronger reviewer",
        glyph: "model",
        about: "A second Bedrock generate — “does this draft stay in the passages, and what should tighten?” Same API as draft, different prompt and often a higher-quality model.",
      },
      {
        name: "Lambda",
        role: "deterministic checks",
        glyph: "compute",
        about: "Code that does not need an LLM: require at least one citation, cap length, reject empty drafts. Cheap, testable, and the right place for rules a model might skip.",
      },
    ],
  },
  answer: {
    title: "Final",
    about: "Apply the critique, write the user-facing answer, then filter it again on the way out. This is the last model call before API Gateway streams the result.",
    models: [
      {
        name: "Claude Sonnet",
        about: "Same mid-size Claude as draft, now instructed to apply the critique and cite files. Reusing the family keeps tone consistent; you could also pin a cheaper model here.",
      },
      {
        name: "Llama 3.3",
        about: "Alternate final generator on Bedrock. Useful if the draft model was Claude and you want a second opinion — or if cost points at Llama for this hop.",
      },
    ],
    scale: "Apply critique, then Guardrails on the way out",
    scaleAbout:
      "Generation then policy. Guardrails after the final write catch PII or ungrounded sentences the critic missed. The client should see the filtered answer, not the raw model dump.",
    boxes: [
      {
        name: "Bedrock",
        role: "final generate",
        glyph: "model",
        about: "Last Converse/Invoke call. Prompt includes the question, draft, critique, and passages. Output is the answer this lab shows in the inspector.",
      },
      {
        name: "Guardrails",
        role: "output filter",
        glyph: "shield",
        about: "Run Guardrails on the finished text before it leaves the region. Blocks or rewrites policy hits. Complements, does not replace, the critique node.",
      },
      {
        name: "API Gateway",
        role: "stream / JSON",
        glyph: "edge",
        about: "Returns the answer to the browser — JSON or a streamed response, the production twin of this lab’s SSE. Still no prompt logging on the gateway if you keep access logs metadata-only.",
      },
    ],
  },
  end: {
    title: "Egress",
    about: "Hand the answer back and keep only operational numbers. Sessions can live in a TTL cache the way this playground keeps state in process memory.",
    scale: "Metrics only — no prompt bodies in logs",
    scaleAbout:
      "CloudWatch should see latency, status, and token counts. Request bodies and model text stay out of logs — the same rule as this playground.",
    boxes: [
      {
        name: "API Gateway",
        role: "response",
        glyph: "edge",
        about: "The HTTP response that ends the state machine. Status and duration are fine to record. The body is the answer, not something to persist.",
      },
      {
        name: "CloudFront",
        role: "to the client",
        glyph: "edge",
        about: "Same CDN as ingress, now on the way out. Do not cache personalized answers at the edge unless the response is truly public.",
      },
      {
        name: "CloudWatch",
        role: "latency / tokens",
        glyph: "metrics",
        about: "Metrics and (optional) logs. For this design: method, path, status, duration, token use. Never the question, draft, or chunks.",
      },
      {
        name: "ElastiCache",
        role: "TTL session",
        glyph: "cache",
        about: "Redis or Memcached with a short TTL — the AWS twin of this app’s in-memory session. Restart or expiry drops the run. Not a prompt archive.",
      },
    ],
  },
};
