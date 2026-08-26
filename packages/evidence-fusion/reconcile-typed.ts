import type { ArchitectureIR } from "../architecture-ir";
import { classifyRelationship } from "../architecture-ir/typed-observation";

export interface RelationshipClassification {
  relationshipId: string;
  kind: ReturnType<typeof classifyRelationship>;
  state: "confirmed" | "inferred" | "recommended" | "conflict";
  evidenceIds: string[];
}

export function classifyRelationships(ir: ArchitectureIR): RelationshipClassification[] {
  return ir.relationships.map((relationship) => {
    const kind = classifyRelationship(relationship.type);
    const evidence = relationship.evidenceIds
      .map((id) => ir.evidence.find((item) => item.id === id))
      .filter(Boolean);

    const hasText = evidence.some((item) => item?.source.url === ir.source.url && item?.rationale?.toLowerCase().includes("article"));
    const hasDiagram = evidence.some((item) => item?.source.location?.startsWith("http"));

    return {
      relationshipId: relationship.id,
      kind,
      state: hasText ? "confirmed" : hasDiagram ? "inferred" : "inferred",
      evidenceIds: relationship.evidenceIds,
    };
  });
}
