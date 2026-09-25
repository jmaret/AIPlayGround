import type { AwsTwinMap } from "@/components/lab/aws";

export const VECTOR_STEPS = ["ingest", "hash", "index", "query", "rank"] as const;
export type VectorStep = (typeof VECTOR_STEPS)[number];

export const VECTOR_JOBS: Record<VectorStep, string> = {
  ingest: "load example cards",
  hash: "64-d word tokens",
  index: "keep vectors in RAM",
  query: "hash the question",
  rank: "cosine neighbors",
};

export function isVectorStep(value: string): value is VectorStep {
  return (VECTOR_STEPS as readonly string[]).includes(value);
}

export const VECTOR_TWINS: Record<VectorStep | "start" | "end", AwsTwinMap> = {
  start: {
    title: "Ingress",
    about: "A query API in front of a vector index. No generation — only embed and rank. The production twin of this lab’s FastAPI preview/query routes.",
    scale: "Auto-scaled HTTP, read-heavy",
    scaleAbout: "API Gateway and Lambda (or Fargate) scale on query QPS. The index tier scales separately from the door.",
    boxes: [
      { name: "API Gateway", role: "query HTTP", glyph: "edge", about: "Managed HTTP API for /preview and /query. Throttles search storms. The twin of localhost:8000." },
      { name: "WAF", role: "rate limits", glyph: "shield", about: "Stops scrape-and-dump of the index. Not an embedder." },
      { name: "Lambda", role: "query worker", glyph: "compute", about: "A short function that embeds the question and calls the vector engine. No GPU of its own." },
    ],
  },
  ingest: {
    title: "Corpus",
    about: "Source texts land in object storage, then get chunked. Locally those are the short cards in data/examples/vector-cards.md.",
    scale: "S3 is the system of record",
    scaleAbout: "S3 holds the raw cards. You can rebuild the index from the bucket without keeping vectors on a laptop disk.",
    boxes: [
      { name: "S3", role: "source objects", glyph: "bucket", about: "Durable store for the example cards (or later PDFs). This lab reads a bundled markdown file instead." },
      { name: "Lambda", role: "chunk cards", glyph: "compute", about: "Split one-idea cards (or longer docs) into retrieve-able pieces. Locally the file is already one card per idea." },
    ],
  },
  hash: {
    title: "Embed",
    about: "This lab hashes content words into 64 signed bins — a transparent stand-in for a model embedder. On AWS you would call Bedrock Titan (or Cohere) instead of the hash.",
    models: [
      {
        name: "Titan Text Embeddings V2",
        about: "Amazon’s embedding model on Bedrock. Same job as this lab’s hash: text in, a unit vector out. Higher quality, not inspectable as bins.",
      },
    ],
    scale: "Batch embed on ingest; on-demand for queries",
    scaleAbout: "Ingest can run as a batch (SQS + Lambda or Bedrock batch). Queries embed one string at a time.",
    boxes: [
      { name: "Bedrock", role: "Titan embed", glyph: "model", about: "Managed embedding API. The production replacement for hashed_ngram_embed. Still no prompt log if you do not write one." },
      { name: "Lambda", role: "local hash twin", glyph: "compute", about: "You could keep a hash embedder in Lambda for a zero-model demo. This playground does that in-process." },
    ],
  },
  index: {
    title: "Store",
    about: "Vectors live next to their text. Locally that is LocalVectorIndex in process memory. On AWS it is a vector engine that can add OCUs under load.",
    scale: "OpenSearch OCUs autoscale",
    scaleAbout: "OpenSearch Serverless grows compute with query load. Aurora PostgreSQL with pgvector is the SQL-shaped alternative.",
    boxes: [
      { name: "OpenSearch", role: "vector k-NN", glyph: "search", about: "Serverless vector engine. The twin of the in-memory list of 64-d cards. Distances still mean closeness, not truth." },
      { name: "Aurora", role: "pgvector option", glyph: "cache", about: "If you want SQL + vectors in one place. Not used in this lab; shown so you see the fork." },
    ],
  },
  query: {
    title: "Query embed",
    about: "The question must use the same embedder as the cards. Here: the same word-token hash. On AWS: the same Titan model ID you used at ingest.",
    models: [
      {
        name: "Titan Text Embeddings V2",
        about: "Same model as ingest. Mixing embedders silently ruins ranking — the first thing this lab makes visible.",
      },
    ],
    scale: "On-demand, one vector per question",
    scaleAbout: "Each search embeds one string. Cache only if the same question repeats and you accept a short TTL.",
    boxes: [
      { name: "API Gateway", role: "POST /query", glyph: "edge", about: "Accepts the question text. Does not persist it." },
      { name: "Bedrock", role: "embed query", glyph: "model", about: "One Invoke for the query vector. Locally this is a hash in the API process." },
    ],
  },
  rank: {
    title: "k-NN",
    about: "Cosine distance (1 − dot of L2-normalized vectors). Lower is closer. The lab shows a closeness bar so the geometry is obvious.",
    scale: "k small (3–8); fan-out inside the engine",
    scaleAbout: "The engine compares the query vector to the index. You ask for k=4. Scale is inside OpenSearch, not a loop in Lambda.",
    boxes: [
      { name: "OpenSearch", role: "cosine / k-NN", glyph: "search", about: "Approximate or exact nearest neighbors. Same lesson as LocalVectorIndex.query." },
      { name: "Lambda", role: "shape the list", glyph: "compute", about: "Trim to {source, distance, text} — drop raw ids if you do not need them." },
    ],
  },
  end: {
    title: "Egress",
    about: "Return ranked neighbors. Metrics only — not the query string in logs.",
    scale: "Latency and k, not bodies",
    scaleAbout: "CloudWatch: status, duration, k. The question and card text stay out of logs, as in this playground.",
    boxes: [
      { name: "API Gateway", role: "JSON neighbors", glyph: "edge", about: "Returns the ranked list. Nothing is written under data/." },
      { name: "CloudWatch", role: "latency only", glyph: "metrics", about: "Operational numbers. Never the query or chunk text." },
    ],
  },
};
