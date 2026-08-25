import type { ArchitectureIR } from "../architecture-ir";

export interface DiagramNode {
  id: string;
  label: string;
  service?: string;
  state: "confirmed" | "inferred" | "recommended" | "conflict";
  evidenceIds: string[];
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  state: DiagramNode["state"];
  evidenceIds: string[];
}

export interface RenderModel {
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  warning: string;
}

export function toRenderModel(ir: ArchitectureIR): RenderModel {
  const evidenceState = new Map(ir.evidence.map((evidence) => [evidence.id, evidence.state]));
  const stateFor = (ids: string[]): DiagramNode["state"] => {
    const states = ids.map((id) => evidenceState.get(id)).filter(Boolean) as DiagramNode["state"][];
    if (states.includes("conflict")) return "conflict";
    if (states.includes("recommended")) return "recommended";
    if (states.includes("inferred")) return "inferred";
    return "confirmed";
  };

  return {
    title: ir.title,
    nodes: ir.components.map((component) => ({
      id: component.id,
      label: component.name,
      service: component.service,
      state: stateFor(component.evidenceIds),
      evidenceIds: component.evidenceIds,
    })),
    edges: ir.relationships.map((relationship) => ({
      id: relationship.id,
      source: relationship.source,
      target: relationship.target,
      label: relationship.type,
      state: stateFor(relationship.evidenceIds),
      evidenceIds: relationship.evidenceIds,
    })),
    warning: "AI-generated architecture. Verify against the original source and official AWS documentation before relying on it.",
  };
}
