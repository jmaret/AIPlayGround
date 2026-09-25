import queries from "./lab-queries.json";
import { fixtureUrl, normalizeQuestion } from "./static-mode";

export type LabName = "rag" | "langchain" | "langgraph" | "refill";

export type QueryItem = {
  id: string;
  question: string;
  route?: string;
  path?: string;
  decision?: string;
};

export const LAB_QUERIES = queries as Record<LabName, QueryItem[]>;

export function questionsFor(lab: LabName): string[] {
  return LAB_QUERIES[lab].map((item) => item.question);
}

export function matchQuery(lab: LabName, question: string): QueryItem | null {
  const wanted = normalizeQuestion(question);
  return LAB_QUERIES[lab].find((item) => normalizeQuestion(item.question) === wanted) ?? null;
}

export async function loadFixture<T>(lab: LabName, id: string): Promise<T> {
  const response = await fetch(fixtureUrl(`${lab}/${id}.json`), { cache: "no-store" });
  if (!response.ok) {
    throw new Error("fixture_missing");
  }
  return (await response.json()) as T;
}
