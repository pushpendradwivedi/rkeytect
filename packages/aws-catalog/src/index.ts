export interface AwsServiceDefinition {
  id: string;
  name: string;
  category: "compute" | "storage" | "database" | "networking" | "integration" | "security" | "analytics" | "observability" | "ai-ml" | "other";
  aliases: string[];
}

export const AWS_SERVICES: AwsServiceDefinition[] = [
  { id: "cloudfront", name: "Amazon CloudFront", category: "networking", aliases: ["cloudfront", "amazon cloudfront"] },
  { id: "apigateway", name: "Amazon API Gateway", category: "networking", aliases: ["api gateway", "amazon api gateway"] },
  { id: "lambda", name: "AWS Lambda", category: "compute", aliases: ["lambda", "aws lambda"] },
  { id: "dynamodb", name: "Amazon DynamoDB", category: "database", aliases: ["dynamodb", "amazon dynamodb"] },
  { id: "s3", name: "Amazon S3", category: "storage", aliases: ["s3", "amazon s3", "simple storage service"] },
  { id: "sqs", name: "Amazon SQS", category: "integration", aliases: ["sqs", "amazon sqs", "simple queue service"] },
  { id: "sns", name: "Amazon SNS", category: "integration", aliases: ["sns", "amazon sns", "simple notification service"] },
  { id: "eventbridge", name: "Amazon EventBridge", category: "integration", aliases: ["eventbridge", "amazon eventbridge"] },
  { id: "cognito", name: "Amazon Cognito", category: "security", aliases: ["cognito", "amazon cognito"] },
  { id: "waf", name: "AWS WAF", category: "security", aliases: ["waf", "aws waf"] },
  { id: "rds", name: "Amazon RDS", category: "database", aliases: ["rds", "amazon rds"] },
  { id: "ecs", name: "Amazon ECS", category: "compute", aliases: ["ecs", "amazon ecs"] },
  { id: "eks", name: "Amazon EKS", category: "compute", aliases: ["eks", "amazon eks"] },
  { id: "kinesis", name: "Amazon Kinesis", category: "analytics", aliases: ["kinesis", "amazon kinesis"] },
  { id: "bedrock", name: "Amazon Bedrock", category: "ai-ml", aliases: ["bedrock", "amazon bedrock"] },
  { id: "cloudwatch", name: "Amazon CloudWatch", category: "observability", aliases: ["cloudwatch", "amazon cloudwatch"] },
];
