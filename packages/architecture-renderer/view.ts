import type { ArchitectureIR } from "../architecture-ir";
import type { RelationshipKind } from "../architecture-ir/typed-observation";
import { classifyRelationship } from "../architecture-ir/typed-observation";

export interface ArchitectureViewModel {
  view: "all" | RelationshipKind;
  componentIds: string[];
  relationshipIds: string[];
}

export function buildArchitectureView(ir: ArchitectureIR, view: ArchitectureViewModel["view"]): ArchitectureViewModel {
  const relationships = view === "all"
    ? ir.relationships
    : ir.relationships.filter((relationship) => classifyRelationship(relationship.type) === view);

  const componentIds = new Set<string>();
  for (const relationship of relationships) {
    componentIds.add(relationship.source);
    componentIds.add(relationship.target);
  }

  return {
    view,
    componentIds: [...componentIds],
    relationshipIds: relationships.map((relationship) => relationship.id),
  };
}
