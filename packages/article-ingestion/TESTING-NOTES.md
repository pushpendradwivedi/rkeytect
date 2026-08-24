## Kiro / Bedrock / MCP benchmark

The test URL supplied during development is an AWS DevOps Blog post from August 10, 2026. It describes Kiro connecting through an MCP server to Amazon Bedrock Knowledge Bases, with the Retrieve API, Amazon Titan Text Embeddings v2, and Amazon OpenSearch Serverless in the retrieval path.

This benchmark is useful because it contains both AWS and non-AWS architecture components and explicit numbered data-flow steps. See `examples/aws-blogs/kiro-bedrock-mcp.json` and `kiro-bedrock-mcp.expected.json`.
