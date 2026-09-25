# Chains of runnables

LangChain is a library for composing language-model work as a chain of named runnables. The usual pipe is retrieve, fill a prompt template, invoke a model, then parse the text into a structure.

The value of a chain is that each hop is a small object you can swap. A retriever can change without rewriting the prompt. A parser can fail closed if the model does not return JSON. You see the formatted prompt and the raw completion, not only the final answer.

A chain is not a graph. It is a straight pipe: output of one runnable is input to the next. When you need branches, retries, or a critique loop, that is LangGraph. When you need one composed path — template | model | parser — that is LangChain.
