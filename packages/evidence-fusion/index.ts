import type { ArchitectureIR, Component, Evidence, Relationship, SourceRef } from "../architecture-ir";
import type { DiagramObservation } from "../diagram-understanding";
import { awsServices } from "../aws-catalog";

export interface TextEvidence {
  id: string;
  text: string;
  source: SourceRef;
}

export interface FusionInput {
  source: SourceRef;
  textEvidence: TextEvidence[];
  diagram?: DiagramObservation;
}

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function findService(label: string) {
  const n = normalize(label);
  return awsServices.find((service) => service.aliases.some((alias) => n.includes(normalize(alias))));
}

const ARCHITECTURE_CUES = [
  "architecture", "architectural", "diagram", "workflow", "data flow", "request flow",
  "integrat", "connect", "invoke", "call", "query", "retrieve", "store", "write", "read",
  "ingest", "sync", "deploy", "endpoint", "vector store", "knowledge base", "pipeline",
  "bucket", "server", "client", "service", "api", "lambda", "vpc", "iam", "cloudwatch",
];

function isArchitectureSentence(text: string): boolean {
  const n = normalize(text);
  return ARCHITECTURE_CUES.some((cue) => n.includes(normalize(cue)));
}

function addComponent(
  components: Map<string, Component>,
  id: string,
  name: string,
  service: string | undefined,
  category: string,
  level: 1 | 2 | 3,
  evidenceId: string,
) {
  const existing = components.get(id);
  components.set(id, {
    id,
    name,
    service,
    category,
    level,
    evidenceIds: [...new Set([...(existing?.evidenceIds ?? []), evidenceId])],
  });
}

export function fuseEvidence(input: FusionInput): ArchitectureIR {
  const evidence: Evidence[] = [];
  const components = new Map<string, Component>();
  const relationships = new Map<string, Relationship>();

  // Source relevance is a hard gate. If vision/article analysis says the page is
  // not architectural, do not manufacture an architecture from incidental mentions.
  if (input.diagram?.isArchitectureRelevant === false) {
    return {
      schemaVersion: "0.1",
      title: input.source.title ?? "rkeytect architecture",
      source: input.source,
      components: [],
      relationships: [],
      evidence: [],
    };
  }

  // Text is supporting evidence, not an entity extractor. A service mention alone
  // is deliberately insufficient to become an architecture component.
  // When a source diagram exists, the diagram is the primary component authority.
  if (!input.diagram || input.diagram.sourceMode !== "diagram") {
    for (const item of input.textEvidence) {
      if (!isArchitectureSentence(item.text)) continue;
      const matchingServices = awsServices.filter((service) =>
        service.aliases.some((alias) => normalize(item.text).includes(normalize(alias))),
      );
      if (matchingServices.length === 0) continue;

      const evidenceId = item.id;
      evidence.push({
        id: evidenceId,
        state: "confirmed",
        confidence: 1,
        source: item.source,
        rationale: "Explicit source text contains an architecture relationship or system-design cue.",
      });

      for (const service of matchingServices) {
        addComponent(components, service.id, service.name, service.name, service.category, 1, evidenceId);
      }
    }
  }

  if (input.diagram?.isArchitectureRelevant !== false) {
    for (const region of input.diagram?.regions ?? []) {
      if (!region.label) continue;
      const service = findService(region.label);
      const id = service?.id ?? `diagram-${region.id}`;
      const evidenceId = `diagram:${region.id}`;
      evidence.push({
        id: evidenceId,
        state: "confirmed",
        confidence: region.confidence,
        source: { url: input.diagram.imageUrl || input.source.url, location: `diagram:region:${region.id}` },
        rationale: "Component is visibly represented in the source architecture diagram.",
      });
      addComponent(
        components,
        id,
        service?.name ?? region.label,
        service?.name,
        service?.category ?? region.kind ?? "component",
        1,
        evidenceId,
      );
    }

    for (const edge of input.diagram?.edges ?? []) {
      const sourceRegion = input.diagram?.regions.find((region) => region.id === edge.sourceRegionId);
      const targetRegion = input.diagram?.regions.find((region) => region.id === edge.targetRegionId);
      if (!sourceRegion?.label || !targetRegion?.label) continue;

      const sourceService = findService(sourceRegion.label);
      const targetService = findService(targetRegion.label);
      const source = sourceService?.id ?? `diagram-${sourceRegion.id}`;
      const target = targetService?.id ?? `diagram-${targetRegion.id}`;
      if (!components.has(source) || !components.has(target)) continue;

      const evidenceId = `diagram-edge:${edge.id}`;
      evidence.push({
        id: evidenceId,
        state: "confirmed",
        confidence: edge.confidence,
        source: { url: input.diagram.imageUrl || input.source.url, location: `diagram:edge:${edge.id}` },
        rationale: "Relationship is visibly represented by a connector in the source architecture diagram.",
      });
      relationships.set(edge.id, {
        id: edge.id,
        source,
        target,
        type: edge.label?.trim() || "connected_to",
        level: 2,
        evidenceIds: [evidenceId],
        confidence: edge.confidence,
      });
    }
  }

  return {
    schemaVersion: "0.1",
    title: input.source.title ?? "rkeytect architecture",
    source: input.source,
    components: [...components.values()],
    relationships: [...relationships.values()],
    evidence,
  };
}
