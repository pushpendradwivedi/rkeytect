export type ObservationKind = "component" | "relationship";
export type ComponentKind = "aws_service" | "client" | "external_system" | "application" | "infrastructure_tool" | "automation" | "unknown";
export type RelationshipKind = "runtime" | "data" | "provisioning" | "control" | "security" | "unknown";
export type ObservationState = "confirmed" | "inferred" | "recommended" | "conflict";

export interface TypedComponentObservation {
  id: string;
  label: string;
  kind: ComponentKind;
  service?: string;
  state: ObservationState;
  confidence: number;
  evidenceIds: string[];
}

export interface TypedRelationshipObservation {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  kind: RelationshipKind;
  state: ObservationState;
  confidence: number;
  evidenceIds: string[];
}

export function classifyComponent(label: string): ComponentKind {
  const value = label.toLowerCase();
  if (/aws cdk|terraform|cloudformation/.test(value)) return "infrastructure_tool";
  if (/ci\/cd|pipeline|github actions|codebuild|jenkins/.test(value)) return "automation";
  if (/kiro|developer|ide|cli|browser|user/.test(value)) return "client";
  if (/amazon |aws |bedrock|lambda|s3|opensearch|dynamodb|cognito|cloudwatch/.test(value)) return "aws_service";
  if (/mcp server|langchain server|application|api server/.test(value)) return "application";
  return "unknown";
}

export function classifyRelationship(label: string): RelationshipKind {
  const value = label.toLowerCase();
  if (/deploy|provision|create|stack|cdk|terraform/.test(value)) return "provisioning";
  if (/auth|authorize|credential|permission|iam|encrypt|security/.test(value)) return "security";
  if (/configure|trigger|invoke|control|manage/.test(value)) return "control";
  if (/send|call|query|request|response|execute|retrieve|invoke/.test(value)) return "runtime";
  if (/ingest|store|document|embedding|vector|chunk|data|upload|download/.test(value)) return "data";
  return "unknown";
}
