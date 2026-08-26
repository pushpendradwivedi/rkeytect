export type BoundaryKind = "internet" | "vpc" | "public-subnet" | "private-subnet" | "aws-account" | "service-group";

export interface ArchitectureBoundary {
  id: string;
  label: string;
  kind: BoundaryKind;
  childNodeIds: string[];
  parentBoundaryId?: string;
  evidenceIds: string[];
  state: "confirmed" | "inferred";
}

export function inferBoundaries(nodeIds: string[], labels: string[]): ArchitectureBoundary[] {
  const lower = labels.map((label) => label.toLowerCase());
  const boundaries: ArchitectureBoundary[] = [];

  if (lower.some((label) => label.includes("developer") || label.includes("internet"))) {
    boundaries.push({ id: "internet", label: "Internet / External", kind: "internet", childNodeIds: nodeIds.filter((_, i) => /developer|internet/i.test(labels[i] ?? "")), evidenceIds: [], state: "inferred" });
  }

  if (lower.some((label) => label.includes("vpc") || label.includes("private subnet") || label.includes("public subnet"))) {
    boundaries.push({ id: "vpc", label: "Amazon VPC", kind: "vpc", childNodeIds: nodeIds, evidenceIds: [], state: "inferred" });
  }

  return boundaries;
}
