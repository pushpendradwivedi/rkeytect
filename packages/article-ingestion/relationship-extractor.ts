import { ArticleDocument } from "./index";
import { ArchitectureIR, Evidence, Relationship } from "../architecture-ir";

interface CandidatePattern {
  type: string;
  regex: RegExp;
}

const patterns: CandidatePattern[] = [
  { type: "connects", regex: /([A-Za-z][A-Za-z0-9 ._-]{2,80})\s+(?:connects|connect)\s+(?:to|with)\s+([A-Za-z][A-Za-z0-9 ._-]{2,80})/gi },
  { type: "connects-via", regex: /([A-Za-z][A-Za-z0-9 ._-]{2,80})\s+(?:connects|connect)\s+([A-Za-z][A-Za-z0-9 ._-]{2,80})\s+to\s+(?:your\s+)?([A-Za-z][A-Za-z0-9 ._-]{2,80})/gi },
  { type: "calls", regex: /([A-Za-z][A-Za-z0-9 ._-]{2,80})\s+(?:calls|call)\s+(?:the\s+)?([A-Za-z][A-Za-z0-9 ._-]{2,80})/gi },
  { type: "sends", regex: /([A-Za-z][A-Za-z0-9 ._-]{2,80})\s+(?:sends|send)\s+(?:the\s+)?(?:query|request|message|data)\s+to\s+([A-Za-z][A-Za-z0-9 ._-]{2,80})/gi },
  { type: "searches", regex: /([A-Za-z][A-Za-z0-9 ._-]{2,80})\s+searches\s+(?:the\s+)?([A-Za-z][A-Za-z0-9 ._-]{2,80})/gi },
  { type: "embeds", regex: /([A-Za-z][A-Za-z0-9 ._-]{2,80})\s+embeds\s+(?:your\s+)?query\s+using\s+([A-Za-z][A-Za-z0-9 ._-]{2,80})/gi },
];

function resolveComponent(value: string, ir: ArchitectureIR) {
  const normalized = value.toLowerCase();
  return ir.components.find((component) => {
    const candidates = [component.name, component.service, component.id].filter(Boolean) as string[];
    return candidates.some((candidate) => normalized.includes(candidate.toLowerCase()));
  });
}

function addRelationship(
  relationships: Relationship[], evidence: Evidence[], seen: Set<string>, article: ArticleDocument,
  source: string, target: string, type: string, counter: number, excerpt: string,
): number {
  const key = `${source}|${target}|${type}`;
  if (seen.has(key)) return counter;
  seen.add(key);
  const evidenceId = `relationship-evidence-${counter}`;
  evidence.push({ id: evidenceId, state: "confirmed", confidence: 0.9,
    source: { url: article.url, title: article.title, excerpt },
    rationale: `Explicit relationship language matched: ${type}.` });
  relationships.push({ id: `relationship-${counter}`, source, target, type, level: 1,
    evidenceIds: [evidenceId], confidence: 0.9 });
  return counter + 1;
}

export function extractRelationshipCandidates(article: ArticleDocument, ir: ArchitectureIR): ArchitectureIR {
  const relationships: Relationship[] = [];
  const evidence: Evidence[] = [...ir.evidence];
  const seen = new Set<string>();
  let counter = 0;

  for (const pattern of patterns) {
    for (const match of article.text.matchAll(pattern.regex)) {
      if (pattern.type === "connects-via") {
        const source = resolveComponent(match[1], ir);
        const via = resolveComponent(match[2], ir);
        const target = resolveComponent(match[3], ir);
        if (source && via) counter = addRelationship(relationships, evidence, seen, article, source.id, via.id, "connects", counter, match[0]);
        if (via && target) counter = addRelationship(relationships, evidence, seen, article, via.id, target.id, "connects", counter, match[0]);
        continue;
      }
      const source = resolveComponent(match[1], ir);
      const target = resolveComponent(match[2], ir);
      if (!source || !target || source.id === target.id) continue;
      counter = addRelationship(relationships, evidence, seen, article, source.id, target.id, pattern.type, counter, match[0]);
    }
  }
  return { ...ir, relationships, evidence };
}
