export interface ArticleImageCandidate {
  url: string;
  alt?: string;
  score: number;
}

export function rankArchitectureImages(images: ArticleImageCandidate[]): ArticleImageCandidate[] {
  const keywords = ["architecture", "diagram", "architecture-diagram", "solution", "workflow", "flow"];
  return [...images].sort((a, b) => score(b) - score(a));

  function score(image: ArticleImageCandidate): number {
    const text = `${image.url} ${image.alt ?? ""}`.toLowerCase();
    return image.score + keywords.reduce((total, keyword) => total + (text.includes(keyword) ? 10 : 0), 0);
  }
}
