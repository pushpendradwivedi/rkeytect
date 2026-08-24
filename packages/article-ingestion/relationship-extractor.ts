import { ArticleDocument } from "./index";
import { ArchitectureIR, Evidence, Relationship } from "../architecture-ir";
import { awsServices } from "../aws-catalog";

interface CandidatePattern {
  type: string;
  regex: RegExp;
}

const patterns: CandidatePattern[] = [
  { type: "connects", regex: /([A-Za-z][A-Za-z0-9 ._-]{2,80})\s+(?:connects|connect)\s+(?:to|with)\s+([A-Za-z][A-Za-z0-9 ._-]{2,80})/gi },
  { type: "calls", regex: /([A-Za-z][A-Za-z0-9 ._-]{2,80})\s+(?:calls|call)\s+(?:the\s+)?([A-Za-z][A-Za-z0-9 ._-]{2,80})/gi },
  { type: "sends", regex: /([A-Za-z][A-Za-z0-9 ._-]{2,80})\s+(?:sends|send)\s+(?:the\s+)?(?:query|request|message|data)\s+to\s+([A-Za-z][A-Za-z0-9 ._-]{2,80})/gi },
  { type: "searches", regex: /([A-Za-z][A-Za-z0-9 ._-]{2,80})\s+searches\s+the\s+([A-Za-z][A-Za-z0-9 ._-]{2,80})/gi },
];

function resolveService(value: string) {
  const normalized = value.toLowerCase();
  return awsServices.find((service) =>
    service.aliases.some((alias) => normalized.includes(alias.toLowerCase())),
  );
}

export function extractRelationshipCandidates(article: ArticleDocument, ir: ArchitectureIR): ArchitectureIR {
  const relationships: Relationship[] = [];
  const evidence: Evidence[] = [...ir.evidence];
  let counter = 0;

  for (const pattern of patterns) {
    for (const match of article.text.matchAll(pattern.regex)) {
      const source = resolveService(match[1]);
      const target = resolveService(match[2]);
      if (!source || !target || source.id === target.id) continue;

      const evidenceId = `relationship-evidence-${counter}`;
      evidence.push({
        id: evidenceId,
        state: "confirmed",
        confidence: 0.9,
        source: { url: article.url, title: article.title, excerpt: match[0] },
        rationale: `Explicit relationship language matched: ${pattern.type}.`,
      });

      relationships.push({
        id: `relationship-${counter}`,
        source: source.id,
        target: target.id,
        type: pattern.type,
        level: 1,
        evidenceIds: [evidenceId],
        confidence: 0.9,
      });
      counter += 1;
    }
  }

  return { ...ir, relationships, evidence };
}
