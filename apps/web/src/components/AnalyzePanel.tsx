"use client";

import { useState } from "react";
import { geminiKey } from "../lib/provider-key";
import { validateArticleUrl } from "../lib/url-validation";
import { ingestArticle } from "../lib/article-client";
import { analyzeArticle } from "../lib/analysis";
import { ApiKeyPrivacyNotice } from "./ApiKeyPrivacyNotice";
import { ArchitectureObservation } from "./ArchitectureObservation";
import { ObservationGraph } from "./ObservationGraph";

export function AnalyzePanel() {
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [observation, setObservation] = useState<Awaited<ReturnType<typeof analyzeArticle>>["diagram"]>();

  async function continueAnalysis() {
    setError(null); setStatus(null); setObservation(undefined);
    try {
      validateArticleUrl(url);
      if (!apiKey.trim()) throw new Error("Enter your Gemini API key to continue.");
      geminiKey.set(apiKey); setApiKey(""); setBusy(true); setStatus("Reading the page and finding possible architecture evidence…");
      const article = await ingestArticle(url);
      setStatus(`Found ${article.images.length} image candidates. Checking whether any are real architecture diagrams…`);
      const result = await analyzeArticle(article);
      setObservation(result.diagram);
      if (result.mode === "diagram") setStatus(`Architecture diagram selected: ${result.diagram?.regions.length ?? 0} components and ${result.diagram?.edges.length ?? 0} candidate relationships.`);
      else if (result.mode === "article") setStatus(`Architecture-related page detected. Reconstructed from explicit source prose because no trustworthy diagram was selected.`);
      else setStatus("This page does not appear to be about a software, cloud, infrastructure, deployment, or system architecture. No diagram was invented.");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to analyze the page."); }
    finally { setBusy(false); }
  }

  const isArchitecture = Boolean(observation?.isArchitectureRelevant);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-5">
      <div className="analyzer card">
        <div className="analyzer-header">
          <div><span className="step-label">01</span><div><h2>Source</h2><p>Paste any public technical article, blog, or architecture page.</p></div></div>
          <span className="free-badge">Free · bring your own key</span>
        </div>
        <label className="field-label" htmlFor="source-url">Web page URL</label>
        <input id="source-url" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com/architecture/article" />
        <label className="field-label" htmlFor="gemini-key">Gemini API key</label>
        <input id="gemini-key" type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="Paste your Gemini key" autoComplete="off" />
        <div className="mt-4"><ApiKeyPrivacyNotice /></div>
        <button type="button" disabled={busy} onClick={continueAnalysis} className="primary analyze-button">{busy ? "Inspecting source…" : "Inspect architecture"}<span>→</span></button>
        {status && <p className="analysis-status" role="status">{status}</p>}
        {error && <p className="analysis-error" role="alert">{error}</p>}
      </div>

      {observation && <div className={`assessment ${isArchitecture ? "assessment-positive" : "assessment-negative"}`}>
        <div className="assessment-icon">{isArchitecture ? "✓" : "—"}</div>
        <div><div className="assessment-kicker">{isArchitecture ? "Architecture detected" : "Not an architecture source"}</div>
          <h2>{isArchitecture ? `${Math.round((observation.architectureConfidence ?? 0) * 100)}% architecture relevance` : "rkeytect stopped rather than inventing a diagram"}</h2>
          <p>{observation.assessmentReason || "The model could not establish enough evidence to classify this page."}</p>
          {observation.sourceMode === "prose" && <span className="assessment-note">No trustworthy diagram selected · prose reconstruction only</span>}
        </div>
      </div>}

      {observation && isArchitecture && <><ObservationGraph observation={observation} /><ArchitectureObservation observation={observation} /></>}
      <p className="text-center text-xs opacity-60">AI-generated output is not authoritative guidance. Verify important claims against the original source and official documentation before use.</p>
    </section>
  );
}
