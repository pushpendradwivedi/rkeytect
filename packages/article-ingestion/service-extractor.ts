import { ArticleDocument } from "./index";
import { awsServices, AwsServiceDefinition } from "../aws-catalog";
import { ArchitectureIR, Evidence, Component } from "../architecture-ir";

export interface ExtractionResult {
  services: AwsServiceDefinition[];
  architecture: ArchitectureIR;
}

export function extractAwsServices(article: ArticleDocument): AwsServiceDefinition[] {
  const haystack = `${article.title} ${article.text}`.toLowerCase();
  return awsServices.filter((service) =>
    service.aliases.some((alias) => haystack.includes(alias.toLowerCase())),
  );
}

export function buildLevelOneIR(article: ArticleDocument): ExtractionResult {
  const services = extractAwsServices(article);
  const evidence: Evidence[] = services.map((service) => ({
    id: `evidence-${service.id}`,
    state: "confirmed",
    confidence: 1,
    source: { url: article.url, title: article.title },
    rationale: `Matched an AWS service name or alias in the article text.`,
  }));

  const components: Component[] = services.map((service) => ({
    id: service.id,
    name: service.name,
    service: service.name,
    category: service.category,
    level: 1,
    evidenceIds: [`evidence-${service.id}`],
  }));

  return {
    services,
    architecture: {
      schemaVersion: "0.1",
      title: article.title,
      source: { url: article.url, title: article.title },
      components,
      relationships: [],
      evidence,
    },
  };
}
