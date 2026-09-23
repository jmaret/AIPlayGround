# Graphs of steps

A language model can do one completion at a time. Real tasks often need a sequence: decide what to do, fetch context, draft, check, then answer. LangGraph is a library for writing that sequence as a graph of named nodes and edges.

The value of a graph is that you can see it. Each node has a job. You can stream which node just ran. You can add a critique node that reads the draft and asks for a revision. You can route around retrieval when the question is only about the graph itself.

A hidden agent that “just uses tools” is harder to learn from. An explicit graph — route, retrieve, draft, critique, answer — makes the control flow the lesson.
