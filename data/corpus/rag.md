# Retrieval-Augmented Generation

RAG is a pattern: retrieve first, then generate. The model is not asked to remember your documents. It is given the relevant passages in the prompt and told to answer only from those passages.

A typical loop is: embed the question, fetch the nearest chunks from a vector store, pack them into a prompt with citations, generate an answer. If the chunks do not contain the fact, a careful system says it does not know.

RAG does not make a model truthful by itself. It only narrows what the model is looking at. Garbage retrieval still yields a fluent wrong answer. Showing the chunks next to the answer is how you check the work.
