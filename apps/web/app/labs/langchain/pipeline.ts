import type { AwsTwinMap } from "@/components/lab/aws";

export const CHAIN_STEPS = ["bind", "retrieve", "template", "invoke", "parse"] as const;
export type ChainStep = (typeof CHAIN_STEPS)[number];

export const CHAIN_JOBS: Record<ChainStep, string> = {
  bind: "name the pipe",
  retrieve: "fetch three passages",
  template: "fill the prompt",
  invoke: "run the model",
  parse: "read JSON out",
};

export function isChainStep(value: string): value is ChainStep {
  return (CHAIN_STEPS as readonly string[]).includes(value);
}

export const CHAIN_TWINS: Record<ChainStep | "start" | "end", AwsTwinMap> = {
  start: {
    title: "Ingress",
    about: "The question enters a managed API, then a composed LangChain pipe. Twin of POST /labs/langchain/run.",
    scale: "HTTP auto-scale; one request, one generate",
    scaleAbout: "API Gateway scales the door. The chain itself is in-process (Lambda or Fargate) or Step Functions if you split hops.",
    boxes: [
      { name: "API Gateway", role: "POST /run", glyph: "edge", about: "Accepts the question. Can stream SSE as each runnable finishes." },
      { name: "Lambda", role: "hold the chain", glyph: "compute", about: "The LCEL object lives here for a lab-sized load. ECS Fargate if the chain is heavy." },
    ],
  },
  bind: {
    title: "Compose",
    about: "LangChain’s lesson: retrieve | prompt | llm | parser. Each hop is a runnable you can swap. This is not a graph — it is a straight pipe.",
    scale: "No extra model — just object graph",
    scaleAbout: "Composition is CPU and memory. Cost starts when retrieve embeds and invoke generates.",
    boxes: [
      { name: "Lambda", role: "LCEL pipe", glyph: "workflow", about: "Construct ChatPromptTemplate, retriever, parser. Same objects this lab builds in-process." },
      { name: "Parameter Store", role: "prompt text", glyph: "cache", about: "Optional: store the template string outside code. This lab keeps the template in the handler." },
    ],
  },
  retrieve: {
    title: "Retriever",
    about: "A LangChain retriever is a runnable that returns documents. Locally: Chroma + Ollama embed. On AWS: Bedrock Knowledge Bases.",
    models: [
      {
        name: "Titan Text Embeddings V2",
        about: "Embeds the question so the vector store can rank neighbors. Same job as nomic-embed-text here.",
      },
    ],
    scale: "OpenSearch OCUs; k is small",
    scaleAbout: "k=3 keeps the next prompt short. The engine fans out the k-NN.",
    boxes: [
      { name: "Bedrock KB", role: "retriever", glyph: "search", about: "Managed document retriever. Twin of store.query in this lab." },
      { name: "OpenSearch", role: "vector k-NN", glyph: "search", about: "Where the KB keeps vectors. Twin of in-memory Chroma." },
    ],
  },
  template: {
    title: "Prompt",
    about: "ChatPromptTemplate fills {question} and {context}. You can inspect the formatted string before it hits the model — that is the chain being honest.",
    scale: "String assembly; no tokens billed yet",
    scaleAbout: "Templates are free. The formatted prompt is request-scoped. Do not write it to S3.",
    boxes: [
      { name: "Bedrock Prompts", role: "managed template", glyph: "workflow", about: "Optional Prompt Management for versions of the system + human messages." },
      { name: "Lambda", role: "partial + format", glyph: "compute", about: "ChatPromptTemplate.partial and invoke. This lab does that in langchain-core." },
    ],
  },
  invoke: {
    title: "Model",
    about: "The llm runnable. Locally Ollama via the provider seam (not a second Ollama client). On AWS: Bedrock Converse.",
    models: [
      { name: "Claude Sonnet", about: "Strong default for JSON-shaped answers from context." },
      { name: "Llama 3.3 70B", about: "Open-weight option on Bedrock. Same hop: one completion." },
    ],
    scale: "On-demand Bedrock; one call per chain run",
    scaleAbout: "This is the expensive hop. Multi-AZ. Do not log the formatted prompt.",
    boxes: [
      { name: "Bedrock Runtime", role: "Converse / Invoke", glyph: "model", about: "The generate API. Twin of provider.generate wrapped as RunnableLambda." },
      { name: "Guardrails", role: "optional filter", glyph: "shield", about: "Can sit around invoke. The parser still has to accept the text." },
    ],
  },
  parse: {
    title: "Parser",
    about: "JsonOutputParser turns model text into {answer, grounded, sources}. If the model wanders, the parser fails closed and the lab still shows the raw string.",
    scale: "CPU only; fail closed",
    scaleAbout: "Parsing is cheap. A failed parse should not silently become a fluent essay.",
    boxes: [
      { name: "Lambda", role: "JsonOutputParser", glyph: "compute", about: "langchain-core parser or a Pydantic model. Deterministic." },
      { name: "Bedrock", role: "tool / JSON mode", glyph: "model", about: "Some models can emit schema-constrained JSON. The parser still validates." },
    ],
  },
  end: {
    title: "Egress",
    about: "Return the parsed object and the intermediates. Metrics only — not the prompt body in logs.",
    scale: "Status, duration, token counts",
    scaleAbout: "Same privacy as this playground: method, path, status, duration.",
    boxes: [
      { name: "API Gateway", role: "SSE / JSON", glyph: "edge", about: "Stream each runnable, then done. Nothing persisted." },
      { name: "CloudWatch", role: "latency / tokens", glyph: "metrics", about: "Operational numbers only." },
    ],
  },
};
