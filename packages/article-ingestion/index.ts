export interface ArticleImage {
  src: string;
  alt?: string;
  caption?: string;
  isLikelyArchitectureDiagram: boolean;
}

export interface ArticleDocument {
  url: string;
  title: string;
  text: string;
  images: ArticleImage[];
  headings: string[];
}

const AWS_HOSTS = ["aws.amazon.com", "awsstatic.com"];

export function validateAwsBlogUrl(input: string): URL {
  const url = new URL(input);
  if (url.protocol !== "https:") throw new Error("Only HTTPS URLs are supported.");
  if (!AWS_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) {
    throw new Error("rkeytect currently accepts AWS-hosted article URLs only.");
  }
  return url;
}

export function normalizeWhitespace(text: string): string {
  return text.replace(/\\s+/g, " ").trim();
}

export function extractArticle(html: string, url: string): ArticleDocument {
  const title = html.match(/<title[^>]*>([\\s\\S]*?)<\\/title>/i)?.[1] ?? "AWS Architecture Article";
  const headings = [...html.matchAll(/<h[1-3][^>]*>([\\s\\S]*?)<\\/h[1-3]>/gi)]
    .map((match) => stripTags(match[1]))
    .map(normalizeWhitespace)
    .filter(Boolean);

  const images: ArticleImage[] = [...html.matchAll(/<img\\b[^>]*>/gi)].map((match) => {
    const tag = match[0];
    const src = attr(tag, "src") ?? "";
    const alt = attr(tag, "alt") ?? undefined;
    const caption = attr(tag, "title") ?? undefined;
    const descriptor = `${src} ${alt ?? ""} ${caption ?? ""}`.toLowerCase();
    return {
      src,
      alt,
      caption,
      isLikelyArchitectureDiagram: /(architect|architecture|reference.?architecture|diagram|workflow|solution)/i.test(descriptor),
    };
  }).filter((image) => Boolean(image.src));

  const articleMatch = html.match(/<article\\b[^>]*>([\\s\\S]*?)<\\/article>/i);
  const source = articleMatch?.[1] ?? html;
  const text = normalizeWhitespace(stripTags(source));

  return { url, title: normalizeWhitespace(stripTags(title)), text, images, headings };
}

export async function fetchArticle(input: string, fetchImpl: typeof fetch = fetch): Promise<ArticleDocument> {
  const url = validateAwsBlogUrl(input);
  const response = await fetchImpl(url.toString(), {
    headers: { "user-agent": "rkeytect/0.1 (+https://github.com/pushpendradwivedi/rkeytect)" },
  });
  if (!response.ok) throw new Error(`Article fetch failed with HTTP ${response.status}.`);
  return extractArticle(await response.text(), url.toString());
}

function attr(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`${name}=[\\\"']([^\\\"']*)[\\\"']`, "i"));
  return match?.[1];
}

function stripTags(value: string): string {
  return value
    .replace(/<script[\\s\\S]*?<\\/script>/gi, " ")
    .replace(/<style[\\s\\S]*?<\\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '\"')
    .replace(/&#39;/gi, "'");
}
