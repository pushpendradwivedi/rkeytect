"use client";

import { useState } from "react";
import { geminiKey } from "../lib/provider-key";
import { validateAwsBlogUrl } from "../lib/url-validation";
import { ingestArticle } from "../lib/article-client";
import { analyzeArticle } from "../lib/analysis";
import { ApiKeyPrivacyNotice } from "./ApiKeyPrivacyNotice";

export function AnalyzePanel() {
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function continueAnalysis() {
    setError(null);
    setStatus(null);
    try {
      validateAwsBlogUrl(url);
      if (!apiKey.trim()) throw new Error("Enter your Gemini API key to continue.");
      geminiKey.set(apiKey);
      setApiKey("");
      setBusy(true);
      setStatus("Fetching AWS Blog content…");
      const article = await ingestArticle(url);
      setStatus(`Found ${article.images.length} image candidates. Asking Gemini to inspect the architecture diagram…`);
      const result = await analyzeArticle(article);
      if (result.diagram) {
        setStatus(`Architecture observation complete: ${result.diagram.regions.length} regions and ${result.diagram.edges.length} candidate edges. Review before treating anything as confirmed.`);
      } else {
        setStatus("No architecture image candidate was found. Article-only analysis is not implemented yet.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to analyze architecture.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-4">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <label className="text-sm font-semibold" htmlFor="aws-url">AWS Blog URL</label>
        <input id="aws-url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://aws.amazon.com/blogs/..." className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2" />
        <label className="mt-5 block text-sm font-semibold" htmlFor="gemini-key">Gemini API key</label>
        <input id="gemini-key" type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="Paste your Gemini key" autoComplete="off" className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2" />
        <div className="mt-4"><ApiKeyPrivacyNotice /></div>
        {status && <p className="mt-3 text-sm opacity-80" role="status">{status}</p>}
        {error && <p className="mt-3 text-sm font-medium" role="alert">{error}</p>}
        <button type="button" disabled={busy} onClick={continueAnalysis} className="mt-5 w-full rounded-xl border px-4 py-3 font-semibold disabled:opacity-50">
          {busy ? "Analyzing…" : "Analyze architecture"}
        </button>
      </div>
      <p className="text-center text-xs opacity-60">AI-generated output is not authoritative AWS guidance. Verify against the original source and official AWS documentation before production use.</p>
    </section>
  );
}
