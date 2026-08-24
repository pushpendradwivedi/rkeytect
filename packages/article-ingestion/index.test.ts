import { extractArticle } from "./index";
import { extractArchitectureComponents } from "./component-extractor";
import { extractRelationshipCandidates } from "./relationship-extractor";

const url = "https://aws.amazon.com/blogs/devops/scaling-organizational-knowledge-in-kiro-with-amazon-bedrock-knowledge-bases-langchain-and-mcp/";

const fixture = `
<h1>Scaling organizational knowledge in Kiro with Amazon Bedrock Knowledge Bases, LangChain, and MCP</h1>
<p>In this integration, the MCP server connects Kiro to your Knowledge Base.</p>
<p>The MCP server calls the Amazon Bedrock Knowledge Bases Retrieve API.</p>
<p>Amazon Bedrock embeds your query using Amazon Titan Text Embeddings v2 and searches the Amazon OpenSearch Serverless vector store.</p>
<p>Kiro generates the response after receiving ranked chunks from the MCP server.</p>
`;

export function runKiroBenchmark() {
  const article = extractArticle(fixture, url);
  const ir = extractArchitectureComponents(article);
  const withRelationships = extractRelationshipCandidates(article, ir);

  const names = withRelationships.components.map((component) => component.name);
  const required = [
    "Amazon Bedrock",
    "Amazon Titan Text Embeddings v2",
    "Amazon OpenSearch Serverless",
    "Kiro",
    "MCP Server",
    "Amazon Bedrock Knowledge Base",
    "Amazon Bedrock Knowledge Bases Retrieve API",
  ];

  for (const component of required) {
    if (!names.includes(component)) throw new Error(`Missing component: ${component}`);
  }

  const edges = withRelationships.relationships.map((r) => `${r.source}->${r.target}:${r.type}`);
  const expectedTypes = ["connects", "calls", "embeds", "searches"];
  for (const type of expectedTypes) {
    if (!edges.some((edge) => edge.endsWith(`:${type}`))) throw new Error(`Missing relationship type: ${type}`);
  }

  return withRelationships;
}

// Allows this file to be used by a future test runner without changing the benchmark logic.
if (typeof process !== "undefined" && process.env.RKEYTECT_RUN_BENCHMARK === "1") {
  const result = runKiroBenchmark();
  console.log(JSON.stringify({ components: result.components.length, relationships: result.relationships.length }, null, 2));
}
