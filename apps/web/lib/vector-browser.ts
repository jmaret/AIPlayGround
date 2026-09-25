import { DIM, cosineDistance, hashedNgramEmbed } from "./hashed";
import type { VectorCard } from "./vector-cards";

export type VectorNeighbor = VectorCard & { distance: number | null };

export type BrowserVectorIndex = {
  chunks: VectorCard[];
  vectors: number[][];
  embedder: string;
  dim: number;
};

export function buildVectorIndex(cards: VectorCard[]): BrowserVectorIndex {
  return {
    chunks: cards,
    vectors: cards.map((card) => hashedNgramEmbed(card.text)),
    embedder: "hashed_tokens",
    dim: DIM,
  };
}

export function queryVectorIndex(index: BrowserVectorIndex, text: string, k = 4) {
  const queryVec = hashedNgramEmbed(text);
  const neighbors: VectorNeighbor[] = index.chunks
    .map((chunk, i) => ({
      ...chunk,
      distance: Number(cosineDistance(queryVec, index.vectors[i] ?? []).toFixed(4)),
    }))
    .sort((left, right) => (left.distance ?? 0) - (right.distance ?? 0))
    .slice(0, k);
  return {
    neighbors,
    query_vector: queryVec.slice(0, 12).map((value) => Number(value.toFixed(3))),
    embedder: index.embedder,
    dim: index.dim,
  };
}
