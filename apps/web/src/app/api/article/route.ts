import { NextRequest, NextResponse } from "next/server";

const AWS_HOSTS = new Set(["aws.amazon.com", "www.aws.amazon.com"]);

function validAwsBlogUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (!AWS_HOSTS.has(url.hostname.toLowerCase())) return null;
    if (!url.pathname.startsWith("/blogs/")) return null;
    return url;
  } catch {
    return null;
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function extractImages(html: string, pageUrl: string) {
  const images: Array<{ url: string; alt?: string }> = [];
  const regex = /<img\b[^>]*>/gi;
  for (const match of html.matchAll(regex)) {
    const tag = match[0];
    const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    if (!src) continue;
    try {
      images.push({
        url: new URL(src, pageUrl).toString(),
        alt: tag.match(/\balt=["']([^"']*)["']/i)?.[1],
      });
    } catch {
      // Ignore malformed image URLs.
    }
  }
  return images;
}

export async function POST(request: NextRequest) {
  // Security invariant: this route accepts only a public AWS URL.
  // It has no API-key parameter and must never be changed to accept one.
  let body: { url?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.url !== "string") {
    return NextResponse.json({ error: "A URL is required." }, { status: 400 });
  }

  const url = validAwsBlogUrl(body.url);
  if (!url) {
    return NextResponse.json({ error: "Only HTTPS AWS Blog URLs are supported." }, { status: 400 });
  }

  const response = await fetch(url, {
    headers: { "User-Agent": "rkeytect/0.1 (+https://github.com/pushpendradwivedi/rkeytect)" },
    redirect: "follow",
  });

  if (!response.ok) {
    return NextResponse.json({ error: `AWS Blog returned ${response.status}.` }, { status: 502 });
  }

  const html = await response.text();
  const title = decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "AWS Blog").trim();
  const description = decodeEntities(
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ?? "",
  ).trim();

  return NextResponse.json({
    source: { url: url.toString(), title, description },
    text: stripHtml(html).slice(0, 120_000),
    images: extractImages(html, url.toString()),
    aiCredentialReceived: false,
  });
}
