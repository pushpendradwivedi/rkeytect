export interface AwsServiceDefinition {
  id: string;
  name: string;
  category: string;
  aliases: string[];
}

export const awsServices: AwsServiceDefinition[] = [
  { id: "apigateway", name: "Amazon API Gateway", category: "networking", aliases: ["API Gateway", "APIGW"] },
  { id: "cloudfront", name: "Amazon CloudFront", category: "networking", aliases: ["CloudFront"] },
  { id: "dynamodb", name: "Amazon DynamoDB", category: "database", aliases: ["DynamoDB"] },
  { id: "ec2", name: "Amazon EC2", category: "compute", aliases: ["EC2", "Amazon Elastic Compute Cloud"] },
  { id: "eks", name: "Amazon EKS", category: "containers", aliases: ["EKS", "Elastic Kubernetes Service"] },
  { id: "eventbridge", name: "Amazon EventBridge", category: "integration", aliases: ["EventBridge"] },
  { id: "lambda", name: "AWS Lambda", category: "compute", aliases: ["Lambda", "AWS Lambda"] },
  { id: "rds", name: "Amazon RDS", category: "database", aliases: ["RDS", "Amazon Relational Database Service"] },
  { id: "s3", name: "Amazon S3", category: "storage", aliases: ["S3", "Amazon Simple Storage Service"] },
  { id: "sqs", name: "Amazon SQS", category: "integration", aliases: ["SQS", "Amazon Simple Queue Service"] },
  { id: "sns", name: "Amazon SNS", category: "integration", aliases: ["SNS", "Amazon Simple Notification Service"] },
  { id: "stepfunctions", name: "AWS Step Functions", category: "workflow", aliases: ["Step Functions"] },
  { id: "bedrock", name: "Amazon Bedrock", category: "ai", aliases: ["Bedrock", "Amazon Bedrock"] },
  { id: "cognito", name: "Amazon Cognito", category: "security", aliases: ["Cognito"] },
  { id: "waf", name: "AWS WAF", category: "security", aliases: ["WAF", "AWS WAF"] },
  { id: "cloudwatch", name: "Amazon CloudWatch", category: "observability", aliases: ["CloudWatch"] },
];

export function findServiceByAlias(text: string): AwsServiceDefinition | undefined {
  const normalized = text.toLowerCase();
  return awsServices.find((service) => service.aliases.some((alias) => normalized.includes(alias.toLowerCase())));
}
