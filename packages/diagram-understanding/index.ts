export interface DiagramRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  confidence: number;
}

export interface DiagramEdge {
  id: string;
  sourceRegionId: string;
  targetRegionId: string;
  label?: string;
  confidence: number;
}

export interface DiagramObservation {
  imageUrl: string;
  regions: DiagramRegion[];
  edges: DiagramEdge[];
  warnings: string[];
}

export interface DiagramVisionProvider {
  id: string;
  analyze(imageUrl: string): Promise<DiagramObservation>;
}

export function validateObservation(observation: DiagramObservation): string[] {
  const errors: string[] = [];
  const regionIds = new Set(observation.regions.map((region) => region.id));

  for (const region of observation.regions) {
    if (region.confidence < 0 || region.confidence > 1) errors.push(`Invalid region confidence: ${region.id}`);
    if (region.width <= 0 || region.height <= 0) errors.push(`Invalid region bounds: ${region.id}`);
  }

  for (const edge of observation.edges) {
    if (!regionIds.has(edge.sourceRegionId)) errors.push(`Unknown edge source: ${edge.sourceRegionId}`);
    if (!regionIds.has(edge.targetRegionId)) errors.push(`Unknown edge target: ${edge.targetRegionId}`);
    if (edge.confidence < 0 || edge.confidence > 1) errors.push(`Invalid edge confidence: ${edge.id}`);
  }

  return errors;
}
