import { ArticleDocument } from "./index";
import { ArchitectureIR, Component, Evidence } from "../architecture-ir";
import { awsServices } from "../aws-catalog";

interface KnownComponent {
  id: string;
  name: string;
  aliases: string[];
  category: string;
}

const knownNonAwsComponents: KnownComponent[] = [
  { id: "developer", name: "Developer", aliases: ["developer", "developers"], category: "actor" },
  { id: "kiro", name: "Kiro", aliases: ["Kiro IDE", "Kiro CLI", "Kiro"], category: "client" },
  { id: "mcp-server", name: "MCP Server", aliases: ["MCP server", "MCP server running"], category: "integration" },
  { id: "retrieve-api", name: "Amazon Bedrock Knowledge Bases Retrieve API", aliases: ["Retrieve API", "RetrieveAndGenerate", "Retrieve API call"], category: "api" },
  { id: "titan-text-embeddings", name: "Amazon Titan Text Embeddings v2", aliases: ["Amazon Titan Text Embeddings v2", "Titan Text Embeddings v2"], category: "ai" },
  { id: "opensearch-serverless", name: "Amazon OpenSearch Serverless", aliases: ["Amazon OpenSearch Serverless", "OpenSearch Serverless", "vector store"], category: "database" },
  { id: "knowledge-base", name: "Amazon Bedrock Knowledge Base", aliases: ["Amazon Bedrock Knowledge Bases", "Knowledge Base", "Knowledge Bases"], category: "ai" },
];

export function extractArchitectureComponents(article: ArticleDocument): ArchitectureIR {
  const components: Component[] = [];
  const evidence: Evidence[] = [];
  const haystack = `${article.title}\n${article.text}`;

  for (const service of awsServices) {
    const alias = service.aliases.find((candidate) => haystack.toLowerCase().includes(candidate.toLowerCase()));
    if (!alias) continue;
    const evidenceId = `component-evidence-${service.id}`;
    evidence.push({
      id: evidenceId,
      state: "confirmed",
      confidence: 1,
      source: { url: article.url, title: article.title, excerpt: findSentence(haystack, alias) },
      rationale: `Explicit AWS service reference: ${alias}.`,
    });
    components.push({
      id: service.id,
      name: service.name,
      service: service.name,
      category: service.category,
      level: 1,
      evidenceIds: [evidenceId],
    });
  }

  for (const component of knownNonAwsComponents) {
    const alias = component.aliases.find((candidate) => haystack.toLowerCase().includes(candidate.toLowerCase()));
    if (!alias) continue;
    if (components.some((existing) => existing.id === component.id)) continue;
    const evidenceId = `component-evidence-${component.id}`;
    evidence.push({
      id: evidenceId,
      state: "confirmed",
      confidence: 1,
      source: { url: article.url, title: article.title, excerpt: findSentence(haystack, alias) },
      rationale: `Explicit architecture component reference: ${alias}.`,
    });
    components.push({ ...component, level: 1, evidenceIds: [evidenceId] });
  }

  return {
    schemaVersion: "0.1",
    title: article.title,
    source: { url: article.url, title: article.title },
    components,
    relationships: [],
    evidence,
  };
}

function findSentence(text: string, needle: string): string | undefined {
  const index = text.toLowerCase().indexOf(needle.toLowerCase());
  if (index < 0) return undefined;
  const start = Math.max(0, text.lastIndexOf(".", index) + 1);
  const end = text.indexOf(".", index);
  return text.slice(start, end < 0 ? Math.min(text.length, index + 240) : end + 1).trim();
}
