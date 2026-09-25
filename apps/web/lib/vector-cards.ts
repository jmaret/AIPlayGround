/** Keep in sync with `data/examples/vector-cards.md`. */

export type VectorCard = { id: string; source: string; text: string };

export const VECTOR_CARDS: VectorCard[] = [
  {
    id: "privacy-disk",
    source: "privacy-disk",
    text: "Prompts must never be written to disk. Questions live in memory and vanish when the process exits.",
  },
  {
    id: "privacy-localhost",
    source: "privacy-localhost",
    text: "Servers bind to localhost. Nothing you type is sent to a cloud model in the Vector DB lab.",
  },
  {
    id: "embedding-meaning",
    source: "embedding-meaning",
    text: "A vector embedding is a list of numbers that stands in for meaning. Nearby vectors are similar ideas.",
  },
  {
    id: "embedding-geometry",
    source: "embedding-geometry",
    text: "Distance in vector space is a stand-in for relatedness. Bad chunks mix ideas and make the geometry messy.",
  },
  {
    id: "rag-retrieve",
    source: "rag-retrieve",
    text: "RAG retrieves passages first, then generates an answer that may only use those passages.",
  },
  {
    id: "rag-cite",
    source: "rag-cite",
    text: "A grounded answer cites the files it used. If the passages lack the fact, a careful system says it does not know.",
  },
  {
    id: "graph-nodes",
    source: "graph-nodes",
    text: "LangGraph is a graph of steps: named nodes route, retrieve, draft, critique, and answer. You can see which node just ran.",
  },
  {
    id: "graph-visible",
    source: "graph-visible",
    text: "A hidden agent is hard to learn from. An explicit graph makes the control flow the lesson.",
  },
  {
    id: "chain-pipe",
    source: "chain-pipe",
    text: "LangChain is a pipe of runnables: retrieve, fill a prompt template, invoke a model, then parse. A chain is not a graph.",
  },
  {
    id: "chunk-size",
    source: "chunk-size",
    text: "Chunking splits a long document into embeddable pieces. Too large averages several ideas. Too small loses the sentence that made an idea true.",
  },
  {
    id: "chunk-overlap",
    source: "chunk-overlap",
    text: "A little overlap between chunks keeps a split sentence whole in at least one vector.",
  },
];
