import type { ArchitectureIR, Relationship } from "../architecture-ir";

export interface RelationshipSupport {
  relationshipId: string;
  textEvidence: boolean;
  diagramEvidence: boolean;
  state: "confirmed" | "inferred" | "recommended" | "conflict";
  rationale: string;
}

export function reconcileRelationships(ir: ArchitectureIR): RelationshipSupport[] {
  const evidence = new Map(ir.evidence.map((item) => [item.id, item]));
  return ir.relationships.map((relationship: Relationship) => {
    const linked = relationship.evidenceIds.map((id) => evidence.get(id)).filter(Boolean);
    const textEvidence = linked.some((item) => item?.source.url === ir.source.url && item?.source.location !== "diagram");
    const diagramEvidence = linked.some((item) => item?.source.location === "diagram" || item?.source.location?.startsWith("http"));
    if (textEvidence && diagramEvidence) {
      return { relationshipId: relationship.id, textEvidence, diagramEvidence, state: "confirmed", rationale: "The relationship is supported by both article evidence and diagram evidence." };
    }
    if (textEvidence) {
      return { relationshipId: relationship.id, textEvidence, diagramEvidence, state: "confirmed", rationale: "The relationship is explicitly supported by article evidence." };
    }
    if (diagramEvidence) {
      return { relationshipId: relationship.id, textEvidence, diagramEvidence, state: "inferred", rationale: "The relationship is observed in the diagram but lacks independent textual confirmation." };
    }
    return { relationshipId: relationship.id, textEvidence, diagramEvidence, state: "inferred", rationale: "The relationship has insufficient independent evidence and must not be treated as authoritative." };
  });
}

export function removeUnsupportedRelationships(ir: ArchitectureIR): ArchitectureIR {
  const support = reconcileRelationships(ir);
  const allowed = new Set(support.filter((item) => item.state !== "recommended" && item.state !== "conflict").map((item) => item.relationshipId));
  return { ...ir, relationships: ir.relationships.filter((relationship) => allowed.has(relationship.id)) };
}
