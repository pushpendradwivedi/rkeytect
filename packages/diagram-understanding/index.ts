export interface DiagramRegion {
  id: string;
  label: string;
  confidence: number;
  kind?: string;
}

export interface DiagramEdge {
  id: string;
  sourceRegionId: string;
  targetRegionId: string;
  label: string;
  confidence: number;
}

/** Candidate observations produced from a diagram or article. These are not authoritative architecture. */
export interface DiagramObservation {
  imageUrl: string;
  regions: DiagramRegion[];
  edges: DiagramEdge[];
  warnings: string[];
  isArchitectureRelevant?: boolean;
  architectureConfidence?: number;
  assessmentReason?: string;
  sourceMode?: "diagram" | "prose" | "none";
  sourceEvidence?: string[];
}

export function isDiagramObservation(value: unknown): value is DiagramObservation {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.regions) && Array.isArray(candidate.edges) && Array.isArray(candidate.warnings);
}
