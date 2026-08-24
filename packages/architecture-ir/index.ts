export type EvidenceState = "confirmed" | "inferred" | "recommended" | "conflict";
export type ArchitectureLevel = 1 | 2 | 3;

export interface SourceRef {
  url: string;
  title?: string;
  location?: string;
  excerpt?: string;
}

export interface Evidence {
  id: string;
  state: EvidenceState;
  confidence: number;
  source: SourceRef;
  rationale?: string;
}

export interface Component {
  id: string;
  name: string;
  service?: string;
  category?: string;
  level: ArchitectureLevel;
  evidenceIds: string[];
}

export interface Relationship {
  id: string;
  source: string;
  target: string;
  type: string;
  level: ArchitectureLevel;
  evidenceIds: string[];
  confidence: number;
}

export interface ArchitectureIR {
  schemaVersion: "0.1";
  title: string;
  source: SourceRef;
  components: Component[];
  relationships: Relationship[];
  evidence: Evidence[];
}

export function validateArchitecture(ir: ArchitectureIR): string[] {
  const errors: string[] = [];
  const ids = new Set(ir.components.map((c) => c.id));
  const evidenceIds = new Set(ir.evidence.map((e) => e.id));

  for (const relationship of ir.relationships) {
    if (!ids.has(relationship.source)) errors.push(`Unknown relationship source: ${relationship.source}`);
    if (!ids.has(relationship.target)) errors.push(`Unknown relationship target: ${relationship.target}`);
    for (const evidenceId of relationship.evidenceIds) {
      if (!evidenceIds.has(evidenceId)) errors.push(`Unknown relationship evidence: ${evidenceId}`);
    }
    if (relationship.confidence < 0 || relationship.confidence > 1) {
      errors.push(`Invalid confidence for relationship: ${relationship.id}`);
    }
  }

  for (const component of ir.components) {
    for (const evidenceId of component.evidenceIds) {
      if (!evidenceIds.has(evidenceId)) errors.push(`Unknown component evidence: ${evidenceId}`);
    }
  }

  return errors;
}
