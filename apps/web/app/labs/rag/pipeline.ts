import type { AwsTwinMap } from "@/components/lab/aws";

export const RAG_STEPS = ["embed", "retrieve", "ground", "generate", "cite"] as const;
export type RagStep = (typeof RAG_STEPS)[number];

export const RAG_JOBS: Record<RagStep, string> = {
  embed: "vector the question",
  retrieve: "nearest passages",
  ground: "bind only those",
  generate: "answer from them",
  cite: "sources or refuse",
};

export function isRagStep(value: string): value is RagStep {
  return (RAG_STEPS as readonly string[]).includes(value);
}

export const RAG_TWINS: Record<RagStep | "start" | "end", AwsTwinMap> = {
  start: {
    title: "Ingress",
    about: "Ask lands on a managed API, then a short workflow: embed, retrieve, generate. The twin of POST /labs/rag/ask.",
    scale: "HTTP auto-scale; one request, two model calls",
    scaleAbout: "API Gateway scales the door. Bedrock scales embed + generate. Keep the two model calls on the same request so state does not hit disk.",
    boxes: [
      { name: "CloudFront", role: "TLS edge", glyph: "edge", about: "CDN in front of the ask API. Do not cache personalized answers." },
      { name: "API Gateway", role: "POST /ask", glyph: "edge", about: "Validates the question length. Streams or returns JSON. Twin of FastAPI on loopback." },
      { name: "Step Functions", role: "embed→retrieve→gen", glyph: "workflow", about: "Optional state machine for the RAG hops. This lab does them in one Python handler." },
    ],
  },
  embed: {
    title: "Question vector",
    about: "The question is embedded with the same model that built the Chroma index (Ollama nomic-embed-text here). On AWS that is Titan on Bedrock.",
    models: [
      {
        name: "Titan Text Embeddings V2",
        about: "Bedrock embedding model. Same role as nomic-embed-text in this lab. Must match the index or ranking collapses.",
      },
    ],
    scale: "On-demand, one vector per ask",
    scaleAbout: "Cheap compared to generate. Still a billed call — batch only helps ingest, not a live question.",
    boxes: [
      { name: "Bedrock", role: "embed question", glyph: "model", about: "Invoke Titan (or Cohere embed). Locally Ollama embed via the Provider seam." },
      { name: "Lambda", role: "hold the vector", glyph: "compute", about: "Keeps the query vector in the request. Does not write it to S3." },
    ],
  },
  retrieve: {
    title: "Knowledge",
    about: "Top-k passages from the corpus index. Locally ephemeral Chroma over data/corpus/. On AWS: Bedrock Knowledge Bases on OpenSearch Serverless.",
    models: [
      {
        name: "Titan Text Embeddings V2",
        about: "Used when the KB was built. Query-time retrieve uses the stored vectors plus this same space.",
      },
    ],
    scale: "OpenSearch OCUs; k is 3–6",
    scaleAbout: "The engine fans out the k-NN. You only ask for a handful of chunks so the next prompt stays small.",
    boxes: [
      { name: "S3", role: "corpus objects", glyph: "bucket", about: "Source markdown (or PDFs) that were ingested into the KB. Twin of data/corpus/." },
      { name: "Bedrock KB", role: "managed RAG index", glyph: "search", about: "Chunks, embeds, stores, and queries. You do not run Chroma yourself." },
      { name: "OpenSearch", role: "vector store", glyph: "search", about: "Where the KB keeps vectors. Twin of in-memory Chroma." },
    ],
  },
  ground: {
    title: "Prompt bind",
    about: "The model is only allowed the retrieved passages. This lab’s prompt says: if they are not enough, say you do not know. That bind is the whole point of RAG.",
    scale: "No extra model — just string assembly",
    scaleAbout: "A Lambda (or the same handler) formats numbered passages. Cheap, testable, and the last place you can drop a chunk before spend.",
    boxes: [
      { name: "Lambda", role: "build the prompt", glyph: "compute", about: "Joins [1] (source) text… into the generate prompt. Same as rag.py PROMPT." },
      { name: "Guardrails", role: "denied topics", glyph: "shield", about: "Optional pre-filter before you spend a generate call." },
    ],
  },
  generate: {
    title: "Answer",
    about: "One completion from the bound passages. Locally llama3.2 via Ollama. On AWS: Bedrock Claude or Llama, on-demand or provisioned.",
    models: [
      { name: "Claude Sonnet", about: "Strong default for grounded answers with citations. Mid-size, cheaper than Opus." },
      { name: "Llama 3.3 70B", about: "Open-weight option on Bedrock. Same job: answer only from the numbered passages." },
    ],
    scale: "On-demand; provisioned if QPS is steady",
    scaleAbout: "This is the expensive hop. Multi-AZ Bedrock. Do not log the prompt body.",
    boxes: [
      { name: "Bedrock Runtime", role: "Converse / Invoke", glyph: "model", about: "The generate API. Twin of provider.generate in this lab." },
      { name: "AZ-a · AZ-b", role: "multi-AZ infer", glyph: "model", about: "Inference survives a single-zone outage. You do not pin GPUs." },
    ],
  },
  cite: {
    title: "Ground check",
    about: "Citations ([filename]) and a refuse-if-unsupported rule. Guardrails can score groundedness. The UI shows the exact chunks the model was given.",
    models: [
      {
        name: "Guardrails groundedness",
        about: "Bedrock Guardrails can check the answer against the retrieved sources. Fail closed if it drifts.",
      },
    ],
    scale: "Filter on the way out; no second essay unless you want one",
    scaleAbout: "A policy pass is cheaper than a second generate. Only add a critic graph if you need prose (see the LangGraph lab).",
    boxes: [
      { name: "Bedrock Guardrails", role: "groundedness", glyph: "shield", about: "Score whether the answer stays in the passages. Complements the prompt rule." },
      { name: "Lambda", role: "require [file]", glyph: "compute", about: "Deterministic: reject an answer with no citation marks if your product needs them." },
    ],
  },
  end: {
    title: "Egress",
    about: "Return the answer plus citation cards. Metrics only — not the question or passages in logs.",
    scale: "Status, duration, token counts",
    scaleAbout: "Same privacy as this playground: method, path, status, duration. No request bodies.",
    boxes: [
      { name: "API Gateway", role: "answer + cites", glyph: "edge", about: "JSON { answer, citations }. Nothing persisted." },
      { name: "CloudWatch", role: "latency / tokens", glyph: "metrics", about: "Operational numbers only." },
    ],
  },
};
