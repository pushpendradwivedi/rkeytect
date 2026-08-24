import { ArchitectureIR } from "../architecture-ir";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validate(ir: ArchitectureIR): ValidationResult {
  const errors: string[] = [];
  const componentIds = new Set(ir.components.map((component) => component.id));
  const evidenceIds = new Set(ir.evidence.map((evidence) => evidence.id));

  for (const relationship of ir.relationships) {
    if (!componentIds.has(relationship.source)) errors.push(`Unknown source component: ${relationship.source}`);
    if (!componentIds.has(relationship.target)) errors.push(`Unknown target component: ${relationship.target}`);
    if (relationship.confidence < 0 || relationship.confidence > 1) {
      errors.push(`Relationship ${relationship.id} has invalid confidence.`);
    }
    for (const evidenceId of relationship.evidenceIds) {
      if (!evidenceIds.has(evidenceId)) errors.push(`Relationship ${relationship.id} references missing evidence ${evidenceId}.`);
    }
  }

  for (const component of ir.components) {
    for (const evidenceId of component.evidenceIds) {
      if (!evidenceIds.has(evidenceId)) errors.push(`Component ${component.id} references missing evidence ${evidenceId}.`);
    }
  }

  return { valid: errors.length === 0, errors };
}
