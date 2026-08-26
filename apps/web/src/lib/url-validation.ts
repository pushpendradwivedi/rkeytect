const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "0.0.0.0",
  "127.0.0.1",
  "::1",
  "metadata.google.internal",
  "metadata.google",
]);

export function validateArticleUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Enter a valid article URL.");
  }

  if (url.protocol !== "https:") throw new Error("Only HTTPS URLs are supported.");
  if (BLOCKED_HOSTNAMES.has(url.hostname.toLowerCase())) throw new Error("Private or local URLs are not supported.");
  if (url.username || url.password) throw new Error("URLs containing embedded credentials are not supported.");

  return url;
}

export const validateAwsBlogUrl = validateArticleUrl;
