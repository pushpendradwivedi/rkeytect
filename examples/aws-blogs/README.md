# AWS architecture benchmarks

The benchmark fixture `kiro-bedrock-mcp.json` is based on the AWS DevOps & Developer Productivity Blog article:

https://aws.amazon.com/blogs/devops/scaling-organizational-knowledge-in-kiro-with-amazon-bedrock-knowledge-bases-langchain-and-mcp/

It is intentionally used to test a mixed architecture containing AWS services, Kiro, an MCP server, an API boundary, an embedding model, a vector store, and explicit retrieval flow.

The expected model is kept as a human-readable benchmark until the repository has a formal test runner.
