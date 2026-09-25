# Local models and privacy

A local model such as one served by Ollama runs on the same machine as the app. The prompt does not need to leave the computer. That is different from a hosted API, where the text travels to a vendor.

Privacy is still a design choice. A local app can log prompts, write uploads to disk, or send analytics. This playground does none of those. Servers bind to localhost. Sessions live in memory and die when the process exits. Logs record path and status, not the question.

Zero cost and privacy are related here: if there is no cloud bill, there is also no cloud copy of what you typed — as long as the app refuses to add one.
