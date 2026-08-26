export interface AwsIconDefinition {
  key: string;
  serviceName: string;
  officialAssetRequired: boolean;
  assetPath?: string;
}

/**
 * Registry intentionally stores identifiers, not copied vendor artwork.
 * Official AWS architecture icon assets must be sourced/licensed according to
 * AWS terms before being bundled into the web application.
 */
export const AWS_ICON_REGISTRY: AwsIconDefinition[] = [
  { key: "api-gateway", serviceName: "Amazon API Gateway", officialAssetRequired: true },
  { key: "lambda", serviceName: "AWS Lambda", officialAssetRequired: true },
  { key: "s3", serviceName: "Amazon S3", officialAssetRequired: true },
  { key: "dynamodb", serviceName: "Amazon DynamoDB", officialAssetRequired: true },
  { key: "bedrock", serviceName: "Amazon Bedrock", officialAssetRequired: true },
  { key: "bedrock-knowledge-base", serviceName: "Amazon Bedrock Knowledge Base", officialAssetRequired: true },
  { key: "opensearch", serviceName: "Amazon OpenSearch Serverless", officialAssetRequired: true },
  { key: "cloudwatch", serviceName: "Amazon CloudWatch", officialAssetRequired: true },
  { key: "cognito", serviceName: "Amazon Cognito", officialAssetRequired: true },
];
