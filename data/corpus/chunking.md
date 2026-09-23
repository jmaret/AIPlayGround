# Chunking

Chunking is how a long document becomes many embeddable pieces. If a chunk is too large, the vector averages several ideas and retrieval gets fuzzy. If a chunk is too small, it loses the sentence that made the idea true.

A simple starting point is a few hundred characters with a little overlap so a sentence split across a boundary still appears whole in one of the two chunks. Overlap is not free — it duplicates tokens — but it prevents the “cut in half” miss.

Metadata matters as much as size. Keeping the source filename on each chunk is what lets a RAG answer cite “privacy.md” instead of an anonymous paragraph.
