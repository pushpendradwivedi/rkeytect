import { analyzeArticleWithGemini, analyzeDiagramWithGemini } from "./gemini-browser";
import { geminiKey } from "./provider-key";
import type { ArticlePayload } from "./article-client";

export interface AnalysisResult {
  article: ArticlePayload;
  diagram?: Awaited<ReturnType<typeof analyzeDiagramWithGemini>>;
  mode: "diagram" | "article";
}

export async function analyzeArticle(article: ArticlePayload): Promise<AnalysisResult> {
  const key = geminiKey.get();
  if (!key) throw new Error("Your Gemini key is no longer available in this browser session.");

  const candidate = article.images.find((image) => (image.score ?? 0) >= 20);
  if (candidate) {
    const diagram = await analyzeDiagramWithGemini(key, candidate.url);
    return { article, diagram, mode: "diagram" };
  }

  const diagram = await analyzeArticleWithGemini(key, article.text, article.source.title);
  diagram.warnings = [
    "No high-confidence architecture diagram was found in the article page. This reconstruction is based on article prose and must be verified against the author's architecture diagram/repository.",
    ...diagram.warnings,
  ];
  return { article, diagram, mode: "article" };
}
