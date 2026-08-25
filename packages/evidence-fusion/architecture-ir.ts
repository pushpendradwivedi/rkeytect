import type { ArchitectureIR, Component, Evidence, Relationship, SourceRef } from "../architecture-ir";
import type { ArticlePayload } from "../../apps/web/src/lib/article-client";
import type { DiagramObservation } from "../diagram-understanding";
import { findServiceByAlias } from "../aws-catalog";

function id(prefix: string, value: string): string {
  return `${prefix}-${value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

export function buildArchitectureIR(article: ArticlePayload, diagram?: DiagramObservation): ArchitectureIR {
  const source: SourceRef = { url: article.source.url, title: article.source.title };
  const evidence: Evidence[] = [];
  const components: Component[] = [];
  const relationships: Relationship[] = [];
  const seen = new Map<string, string>();

  for (const serviceName of ["Kiro", "MCP Server", "Amazon Bedrock Knowledge Base", "Amazon OpenSearch Serverless", "Amazon Bedrock", "Amazon Titan Text Embeddings v2"]) {
    const service = findServiceByAlias(serviceName);
    const match = article.text.match(new RegExp(`[^.]{0,180}${serviceName.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}[^.]{0,180}\\.`, "i"));
    if (!match && !diagram?.regions.some((r) => r.label?.toLowerCase().includes(serviceName.toLowerCase()))) continue;
    const evidenceId = `text-${evidence.length + 1}`;
    evidence.push({ id: evidenceId, state: match ? "confirmed" : "inferred", confidence: match ? 0.92 : 0.72, source, excerpt: match?.[0] });
    const componentId = id("component", serviceName);
    components.push({ id: componentId, name: serviceName, service: service?.name, category: service?.category ?? "external", level: 1, evidenceIds: [evidenceId] });
    seen.set(serviceName.toLowerCase(), componentId);
  }

  if (diagram) {
    for (const region of diagram.regions) {
      if (!region.label) continue;
      const key = region.label.toLowerCase();
      if (seen.has(key)) continue;
      const evidenceId = `diagram-${evidence.length + 1}`;
      evidence.push({ id: evidenceId, state: "inferred", confidence: region.confidence, source: { ...source, location: diagram.imageUrl }, rationale: "Candidate component observed in the source architecture diagram." });
      const componentId = id("component", region.label);
      components.push({ id: componentId, name: region.label, level: 1, evidenceIds: [evidenceId] });
      seen.set(key, componentId);
    }

    for (const edge of diagram.edges) {
      const sourceRegion = diagram.regions.find((region) => region.id === edge.sourceRegionId);
      const targetRegion = diagram.regions.find((region) => region.id === edge.targetRegionId);
      if (!sourceRegion?.label || !targetRegion?.label) continue;
      const sourceId = seen.get(sourceRegion.label.toLowerCase());
      const targetId = seen.get(targetRegion.label.toLowerCase());
      if (!sourceId || !targetId) continue;
      const evidenceId = `edge-${evidence.length + 1}`;
      evidence.push({ id: evidenceId, state: "inferred", confidence: edge.confidence, source: { ...source, location: diagram.imageUrl }, rationale: "Candidate relationship observed in the source diagram; not independently confirmed by text." });
      relationships.push({ id: edge.id, source: sourceId, target: targetId, type: edge.label ?? "data flow", level: 1, evidenceIds: [evidenceId], confidence: edge.confidence });
    }
  }

  return { schemaVersion: "0.1", title: article.source.title || "AWS architecture", source, components, relationships, evidence };
}
