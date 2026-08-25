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

export function fuseEvidence(input: FusionInput): ArchitectureIR {
  const evidence: Evidence[] = [];
  const components = new Map<string, Component>();
  const relationships = new Map<string, Relationship>();

  for (const item of input.textEvidence) {
    const evidenceId = item.id;
    evidence.push({ id: evidenceId, state: "confirmed", confidence: 1, source: item.source, rationale: "Explicit source text." });

    for (const service of awsServices) {
      if (service.aliases.some((alias) => normalize(item.text).includes(normalize(alias)))) {
        const id = service.id;
        const existing = components.get(id);
        components.set(id, {
          id,
          name: service.name,
          service: service.name,
          category: service.category,
          level: 1,
          evidenceIds: [...new Set([...(existing?.evidenceIds ?? []), evidenceId])],
        });
      }
    }
  }

  if (input.diagram) {
    for (const region of input.diagram.regions) {
      if (!region.label) continue;
      const service = findService(region.label);
      const id = service?.id ?? `diagram-${region.id}`;
      const evidenceId = `diagram:${region.id}`;
      evidence.push({ id: evidenceId, state: "inferred", confidence: region.confidence, source: { url: input.diagram.imageUrl, location: `region:${region.id}` }, rationale: "Observed in source diagram; requires verification." });
      const existing = components.get(id);
      components.set(id, {
        id,
        name: service?.name ?? region.label,
        service: service?.name,
        category: service?.category ?? "unknown",
        level: 1,
        evidenceIds: [...new Set([...(existing?.evidenceIds ?? []), evidenceId])],
      });
    }

    for (const edge of input.diagram.edges) {
      const sourceRegion = input.diagram.regions.find((region) => region.id === edge.sourceRegionId);
      const targetRegion = input.diagram.regions.find((region) => region.id === edge.targetRegionId);
      if (!sourceRegion?.label || !targetRegion?.label) continue;
      const sourceService = findService(sourceRegion.label);
      const targetService = findService(targetRegion.label);
      const source = sourceService?.id ?? `diagram-${sourceRegion.id}`;
      const target = targetService?.id ?? `diagram-${targetRegion.id}`;
      const evidenceId = `diagram-edge:${edge.id}`;
      evidence.push({ id: evidenceId, state: "inferred", confidence: edge.confidence, source: { url: input.diagram.imageUrl, location: `edge:${edge.id}` }, rationale: "Candidate visual relationship; not confirmed solely by AI vision." });
      relationships.set(edge.id, { id: edge.id, source, target, type: edge.label ?? "connected_to", level: 2, evidenceIds: [evidenceId], confidence: edge.confidence });
    }
  }

  return { schemaVersion: "0.1", title: input.source.title ?? "rkeytect architecture", source: input.source, components: [...components.values()], relationships: [...relationships.values()], evidence };
}
