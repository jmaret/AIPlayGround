## privacy-disk
Prompts must never be written to disk. Questions live in memory and vanish when the process exits.

## privacy-localhost
Servers bind to localhost. Nothing you type is sent to a cloud model in the Vector DB lab.

## embedding-meaning
A vector embedding is a list of numbers that stands in for meaning. Nearby vectors are similar ideas.

## embedding-geometry
Distance in vector space is a stand-in for relatedness. Bad chunks mix ideas and make the geometry messy.

## rag-retrieve
RAG retrieves passages first, then generates an answer that may only use those passages.

## rag-cite
A grounded answer cites the files it used. If the passages lack the fact, a careful system says it does not know.

## graph-nodes
LangGraph is a graph of steps: named nodes route, retrieve, draft, critique, and answer. You can see which node just ran.

## graph-visible
A hidden agent is hard to learn from. An explicit graph makes the control flow the lesson.

## chain-pipe
LangChain is a pipe of runnables: retrieve, fill a prompt template, invoke a model, then parse. A chain is not a graph.

## chunk-size
Chunking splits a long document into embeddable pieces. Too large averages several ideas. Too small loses the sentence that made an idea true.

## chunk-overlap
A little overlap between chunks keeps a split sentence whole in at least one vector.
