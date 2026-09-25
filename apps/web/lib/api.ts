export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof payload.detail === "string" ? payload.detail : "request_failed";
    throw new Error(detail);
  }
  return payload as T;
}

export function friendlyError(error: unknown): string {
  const code = error instanceof Error ? error.message : "request_failed";
  if (code === "Failed to fetch") {
    return "The local API is not reachable. From AIPlayGround run make api, then retry. The Vector DB lab does not need Ollama.";
  }
  if (code === "ollama_unavailable") {
    return "Ollama is not reachable on this machine. RAG and LangGraph need: ollama pull llama3.2 && ollama pull nomic-embed-text. The Vector DB lab works without it.";
  }
  if (code === "index_unavailable" || code === "index_failed" || code === "missing_models") {
    return "The local index is not ready. Pull the models with ollama pull llama3.2 and ollama pull nomic-embed-text, then restart make api.";
  }
  return "The local API could not finish that request. Check that make api is running on localhost:8000.";
}
