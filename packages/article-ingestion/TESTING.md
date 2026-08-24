# Article ingestion test case

## Fixture

`examples/aws-blogs/kiro-bedrock-mcp.json` models the AWS DevOps Blog post:

https://aws.amazon.com/blogs/devops/scaling-organizational-knowledge-in-kiro-with-amazon-bedrock-knowledge-bases-langchain-and-mcp/

The source article explicitly describes these flows:

```text
Developer -> Kiro
Kiro -> MCP server
MCP server -> Amazon Bedrock Knowledge Bases Retrieve API
Amazon Bedrock -> Amazon Titan Text Embeddings v2
Amazon Bedrock -> Amazon OpenSearch Serverless
```

The article also explains that the MCP server retrieves ranked chunks and returns them to Kiro, after which Kiro's own LLM generates the cited response.

## What this test is designed to catch

1. Kiro and MCP must not be discarded merely because they are not AWS services.
2. Amazon OpenSearch Serverless must be represented as an architecture component.
3. The Retrieve API must be distinguishable from the broader Knowledge Base service.
4. Relationships require explicit textual evidence.
5. The source architecture must remain separate from recommendations.

This is intentionally an architecture-understanding benchmark, not a screenshot-matching benchmark. The official article points to architecture diagrams hosted in the accompanying repository; rkeytect should treat those diagrams as source evidence and eventually parse them separately.
