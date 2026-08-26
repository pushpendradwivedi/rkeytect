import type { ArticlePayload } from "./article-client";
import type { TextEvidence } from "../../../../packages/evidence-fusion";

export function buildTextEvidence(article: ArticlePayload): TextEvidence[] {
  const chunks = article.text
    .split(/(?<=[.!?])\s+/)
    .map((text) => text.trim())
    .filter((text) => text.length > 30);

  return chunks.slice(0, 500).map((text, index) => ({
    id: `text:${index + 1}`,
    text,
    source: {
      url: article.source.url,
      title: article.source.title,
      location: `article-chunk:${index + 1}`,
      excerpt: text.slice(0, 500),
    },
  }));
}
