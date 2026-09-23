# Embeddings

An embedding is a list of numbers that stands in for meaning. Two sentences about the same idea sit closer together than two sentences about different ideas, even if they share few words.

Local models such as nomic-embed-text turn a chunk of text into one of these lists. Distance in that space is a stand-in for “how related.” That is why a question about privacy can find a paragraph about not logging prompts, even if the wording differs.

Embeddings are not magic and they are not understanding. They are a useful geometric trick. Bad chunks (too long, too mixed) make the geometry messy. Good chunks keep one idea per vector.
