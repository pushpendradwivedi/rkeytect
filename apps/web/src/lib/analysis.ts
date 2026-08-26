import { analyzeArticleWithGemini, analyzeDiagramWithGemini, selectArchitectureImageWithGemini } from "./gemini-browser";
import { geminiKey } from "./provider-key";
import type { ArticlePayload } from "./article-client";

export interface AnalysisResult {
  article: ArticlePayload;
  diagram?: Awaited<ReturnType<typeof analyzeDiagramWithGemini>>;
  mode: "diagram" | "article" | "none";
}

export async function analyzeArticle(article: ArticlePayload): Promise<AnalysisResult> {
  const key = geminiKey.get();
  if (!key) throw new Error("Your Gemini key is no longer available in this browser session.");

  const candidates = article.images.filter((image) => (image.score ?? 0) >= 0).slice(0, 5);
  if (candidates.length) {
    const selection = await selectArchitectureImageWithGemini(key, candidates);
    if (selection.architectureDiagram && selection.selectedIndex >= 0 && selection.selectedIndex < candidates.length) {
      const candidate = candidates[selection.selectedIndex];
      const diagram = await analyzeDiagramWithGemini(key, candidate.url);
      diagram.warnings = [
        `Selected from ${candidates.length} page image candidates by an AI diagram gate (${Math.round(selection.confidence * 100)}% confidence).`,
        ...diagram.warnings,
      ];
      if (diagram.isArchitectureRelevant) return { article, diagram, mode: "diagram" };
    }
  }

  const diagram = await analyzeArticleWithGemini(key, article.text, article.source.title);
  if (diagram.isArchitectureRelevant) {
    diagram.warnings = [
      "No trustworthy architecture diagram was selected from the page images. This reconstruction uses explicit source prose and must be verified against the original source.",
      ...diagram.warnings,
    ];
    return { article, diagram, mode: "article" };
  }

  diagram.warnings = [
    "This page does not appear to contain a meaningful software, cloud, infrastructure, deployment, or system architecture. rkeytect did not invent an architecture diagram.",
    ...diagram.warnings,
  ];
  return { article, diagram, mode: "none" };
}
