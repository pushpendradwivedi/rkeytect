export type FactState = "confirmed" | "inferred" | "recommended" | "conflict";

export type EvidenceKind = "text" | "image" | "code" | "table" | "metadata";

export interface SourceReference {
  sourceUrl: string;
  title?: string;
  locator?: string;
  excerpt?: string;
  kind: EvidenceKind;
}

export interface Evidence {
  id: string;
  state: FactState;
  confidence: number;
  source?: SourceReference;
  rationale?: string;
}

export interface ArchitectureComponent {
  id: string;
  name: string;
  service?: string;
  provider: "aws" | "generic";
  category?: string;
  level: 1 | 2 | 3;
  evidence: Evidence[];
  metadata?: Record<string, string | number | boolean | null>;
}

export interface ArchitectureRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  direction?: "forward" | "bidirectional" | "unspecified";
  level: 1 | 2 | 3;
  evidence: Evidence[];
}

export interface ArchitectureBoundary {
  id: string;
  name: string;
  type: "account" | "region" | "vpc" | "subnet" | "service" | "logical" | "unknown";
  level: 1 | 2 | 3;
  componentIds: string[];
  evidence: Evidence[];
}

export interface ArchitectureActor {
  id: string;
  name: string;
  type: "user" | "system" | "external-service" | "device" | "unknown";
  evidence: Evidence[];
}

export interface ArchitectureModel {
  schemaVersion: "0.1";
  source: SourceReference;
  components: ArchitectureComponent[];
  relationships: ArchitectureRelationship[];
  boundaries: ArchitectureBoundary[];
  actors: ArchitectureActor[];
  assumptions: string[];
  conflicts: Evidence[];
  generatedAt: string;
}
