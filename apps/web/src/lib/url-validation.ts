const ALLOWED_HOSTS = new Set(["aws.amazon.com", "www.aws.amazon.com"]);

export function validateAwsBlogUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Enter a valid URL.");
  }

  if (url.protocol !== "https:") throw new Error("Only HTTPS URLs are supported.");
  if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) throw new Error("rkeytect currently supports AWS Blog URLs only.");
  if (!url.pathname.startsWith("/blogs/")) throw new Error("Enter an AWS Blog article URL.");

  return url;
}
