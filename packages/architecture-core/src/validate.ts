import type { ArchitectureModel } from "@rkeytect/architecture-ir";

export interface ValidationIssue {
  code: string;
  severity: "error" | "warning";
  message: string;
  entityId?: string;
}

export function validateArchitecture(model: ArchitectureModel): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const componentIds = new Set(model.components.map((component) => component.id));

  for (const relationship of model.relationships) {
    if (!componentIds.has(relationship.sourceId)) {
      issues.push({
        code: "RELATIONSHIP_SOURCE_MISSING",
        severity: "error",
        message: `Relationship references missing source component: ${relationship.sourceId}`,
        entityId: relationship.id,
      });
    }

    if (!componentIds.has(relationship.targetId)) {
      issues.push({
        code: "RELATIONSHIP_TARGET_MISSING",
        severity: "error",
        message: `Relationship references missing target component: ${relationship.targetId}`,
        entityId: relationship.id,
      });
    }
  }

  for (const component of model.components) {
    for (const evidence of component.evidence) {
      if (evidence.confidence < 0 || evidence.confidence > 1) {
        issues.push({
          code: "INVALID_CONFIDENCE",
          severity: "error",
          message: `Confidence must be between 0 and 1 for ${component.id}`,
          entityId: component.id,
        });
      }

      if (evidence.state === "confirmed" && !evidence.source) {
        issues.push({
          code: "CONFIRMED_WITHOUT_SOURCE",
          severity: "warning",
          message: "A confirmed fact should normally have source evidence.",
          entityId: component.id,
        });
      }
    }
  }

  return issues;
}
