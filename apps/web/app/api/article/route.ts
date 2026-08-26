import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata.google",
]);

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31) || (a === 100 && b >= 64 && b <= 127) || (a === 198 && (b === 18 || b === 19));
}

function validPublicArticleUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (url.protocol !== "https:") return null;
    if (!hostname || BLOCKED_HOSTNAMES.has(hostname) || isPrivateIpv4(hostname) || hostname === "::1") return null;
    if (url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

function decodeEntities(value: string): string {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function cleanHtmlFragment(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(nav|footer|header|aside)[^>]*>[\s\S]*?<\/\1>/gi, " ");
}

function stripHtml(html: string): string {
  return decodeEntities(cleanHtmlFragment(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function extractImages(html: string, pageUrl: string) {
  const images: Array<{ url: string; alt?: string; score: number }> = [];
  const blocked = /global-nav|re:invent-register|logo|avatar|author|social|icon|pixel|tracking|sprite/i;
  const positive = /architecture|architecture[-_ ]?diagram|solution architecture|reference architecture|workflow|data flow|sequence|topology|deployment|infrastructure|system design|how it works|end[-_ ]to[-_ ]end/i;

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const src = tag.match(/\b(?:src|data-src)=["']([^"']+)["']/i)?.[1];
    if (!src) continue;
    try {
      const url = new URL(src, pageUrl).toString();
      const alt = tag.match(/\balt=["']([^"']*)["']/i)?.[1] ?? "";
      const context = `${url} ${alt}`;
      if (blocked.test(context)) continue;
      let score = positive.test(context) ? 30 : 0;
      if (/figure\s*[1-9]|architecture|reference architecture/i.test(alt)) score += 30;
      images.push({ url, alt, score });
    } catch {}
  }
  return images.sort((a, b) => b.score - a.score).slice(0, 12);
}

export async function POST(request: NextRequest) {
  // Security invariant: this route never accepts an AI API key. It only fetches public HTTPS pages.
  let body: { url?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
  if (typeof body.url !== "string") return NextResponse.json({ error: "A URL is required." }, { status: 400 });

  const url = validPublicArticleUrl(body.url);
  if (!url) return NextResponse.json({ error: "Only public HTTPS article URLs are supported." }, { status: 400 });

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; rkeytect/0.2; +https://github.com/pushpendradwivedi/rkeytect)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    return NextResponse.json({ error: "Unable to fetch that public page. It may block automated access or require authentication." }, { status: 502 });
  }

  if (!response.ok) return NextResponse.json({ error: `Source returned ${response.status}.` }, { status: 502 });
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
    return NextResponse.json({ error: "That URL is not an HTML article/page. rkeytect currently analyzes public web pages." }, { status: 415 });
  }

  const html = await response.text();
  const title = decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? url.hostname).trim();
  const description = decodeEntities(html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']*)["']/i)?.[1] ?? "").trim();

  return NextResponse.json({
    source: { url: url.toString(), title, description },
    text: stripHtml(html).slice(0, 120_000),
    images: extractImages(html, url.toString()),
    aiCredentialReceived: false,
  });
}
