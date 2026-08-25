import type { RenderModel } from "./index";

export interface AwsStyleNode {
  id: string;
  label: string;
  service?: string;
  iconKey: string;
  state: "confirmed" | "inferred" | "recommended" | "conflict";
  evidenceIds: string[];
}

export interface AwsStyleEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  state: AwsStyleNode["state"];
  evidenceIds: string[];
}

export interface AwsStyleModel extends Omit<RenderModel, "nodes" | "edges"> {
  nodes: AwsStyleNode[];
  edges: AwsStyleEdge[];
  legend: Array<{ state: AwsStyleNode["state"]; label: string }>;
}

const iconMap: Record<string, string> = {
  "Amazon API Gateway": "api-gateway",
  "AWS Lambda": "lambda",
  "Amazon S3": "s3",
  "Amazon DynamoDB": "dynamodb",
  "Amazon Bedrock": "bedrock",
  "Amazon Bedrock Knowledge Base": "bedrock-knowledge-base",
  "Amazon OpenSearch Serverless": "opensearch",
  "Amazon CloudWatch": "cloudwatch",
  "Amazon Cognito": "cognito",
};

export function toAwsStyleModel(model: RenderModel): AwsStyleModel {
  return {
    ...model,
    nodes: model.nodes.map((node) => ({
      ...node,
      iconKey: iconMap[node.service ?? node.label] ?? "generic",
    })),
    edges: model.edges,
    legend: [
      { state: "confirmed", label: "Confirmed from source" },
      { state: "inferred", label: "AI-inferred" },
      { state: "recommended", label: "AI recommendation" },
      { state: "conflict", label: "Potential conflict" },
    ],
  };
}
