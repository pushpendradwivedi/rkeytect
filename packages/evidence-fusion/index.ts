export type EvidenceKind = "text" | "diagram" | "code" | "external";

export interface EvidenceItem {
  id: string;
  kind: EvidenceKind;
  sourceUrl: string;
  locator?: string;
  content: string;
  confidence: number;
}

export interface CandidateRelationship {
  source: string;
  target: string;
  type: string;
  evidenceIds: string[];
  confidence: number;
}

export interface FusionResult {
  evidence: EvidenceItem[];
  relationships: CandidateRelationship[];
  warnings: string[];
}

/**
 * Merge text and diagram evidence without promoting either source to truth.
 * Conflicting candidates are retained so a later model/validator can review them.
 */
export function fuseEvidence(items: EvidenceItem[], relationships: CandidateRelationship[]): FusionResult {
  const warnings: string[] = [];
  const evidenceIds = new Set(items.map((item) => item.id));

  for (const relationship of relationships) {
    const missing = relationship.evidenceIds.filter((id) => !evidenceIds.has(id));
    if (missing.length) warnings.push(`Relationship ${relationship.source}->${relationship.target} has missing evidence: ${missing.join(", ")}`);
    if (relationship.confidence < 0 || relationship.confidence > 1) {
      warnings.push(`Relationship ${relationship.source}->${relationship.target} has invalid confidence.`);
    }
  }

  return { evidence: items, relationships, warnings };
}
