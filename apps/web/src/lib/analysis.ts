import { analyzeDiagramWithGemini } from "./gemini-browser";
import { geminiKey } from "./provider-key";
import type { ArticlePayload } from "./article-client";

export interface AnalysisResult {
  article: ArticlePayload;
  diagram?: Awaited<ReturnType<typeof analyzeDiagramWithGemini>>;
}

export async function analyzeArticle(article: ArticlePayload): Promise<AnalysisResult> {
  const key = geminiKey.get();
  if (!key) throw new Error("Your Gemini key is no longer available in this browser session.");

  const candidate = article.images[0];
  if (!candidate) return { article };

  const diagram = await analyzeDiagramWithGemini(key, candidate.url);
  return { article, diagram };
}
