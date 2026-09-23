export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

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
  if (code === "ollama_unavailable" || code === "Failed to fetch") {
    return "Ollama is not reachable on this machine. Install it, then run ollama pull llama3.2 and ollama pull nomic-embed-text.";
  }
  if (code === "index_unavailable" || code === "index_failed" || code === "missing_models") {
    return "The local index is not ready. Pull the models with ollama pull llama3.2 and ollama pull nomic-embed-text, then restart make api.";
  }
  return "The local API could not finish that request. Check that make api is running on 127.0.0.1:8000.";
}
