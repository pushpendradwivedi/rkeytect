import type { DiagramObservation } from "../diagram-understanding";
import { classifyComponent, classifyRelationship } from "../architecture-ir/typed-observation";

const MIN_COMPONENT_CONFIDENCE = 0.72;
const MIN_RELATIONSHIP_CONFIDENCE = 0.72;

export function filterDiagramObservation(observation: DiagramObservation): DiagramObservation {
  const regions = observation.regions.filter((region) => {
    if (!region.label || region.confidence < MIN_COMPONENT_CONFIDENCE) return false;
    // Reject generic visual noise from article pages.
    if (/^(shape|region|image|logo|icon|figure|graphic|unknown)$/i.test(region.label.trim())) return false;
    return true;
  });

  const ids = new Set(regions.map((region) => region.id));
  const edges = observation.edges.filter((edge) => {
    if (edge.confidence < MIN_RELATIONSHIP_CONFIDENCE) return false;
    if (!ids.has(edge.sourceRegionId) || !ids.has(edge.targetRegionId)) return false;
    return Boolean(edge.label?.trim());
  });

  return {
    ...observation,
    regions,
    edges,
    warnings: [
      ...observation.warnings,
      ...regions.filter((region) => classifyComponent(region.label ?? "") === "unknown").map((region) => `Unclassified component candidate: ${region.label}`),
      ...edges.filter((edge) => classifyRelationship(edge.label ?? "") === "unknown").map((edge) => `Unclassified relationship candidate: ${edge.label}`),
    ],
  };
}
