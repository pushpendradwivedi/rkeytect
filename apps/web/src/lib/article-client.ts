import { rankArchitectureImages } from "./article-image";

export interface ArticlePayload {
  source: { url: string; title: string; description: string };
  text: string;
  images: Array<{ url: string; alt?: string }>;
  aiCredentialReceived: false;
}

export async function ingestArticle(url: string): Promise<ArticlePayload> {
  const response = await fetch("/api/article", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error ?? `Article ingestion failed (${response.status}).`);
  }

  const payload = (await response.json()) as ArticlePayload;
  return {
    ...payload,
    images: rankArchitectureImages(payload.images.map((image) => ({ ...image, score: 0 }))),
  };
}
