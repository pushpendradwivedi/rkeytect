# Benchmark run

1. Fetch the supplied AWS Blog URL.
2. Extract article text and image metadata.
3. Build Level-1 components with source evidence.
4. Run relationship candidate extraction.
5. Validate the resulting Architecture IR.

Expected high-level components: Kiro, MCP Server, Amazon Bedrock Knowledge Base, Retrieve API, Amazon Bedrock, Amazon Titan Text Embeddings v2, and Amazon OpenSearch Serverless.

Expected explicit relationship types: connects, calls, embeds, searches.

The benchmark should fail rather than silently invent a relationship when evidence is absent.
