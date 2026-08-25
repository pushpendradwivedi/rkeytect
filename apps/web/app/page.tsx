"use client";

import { useState } from "react";
import { ApiKeyPrivacyNotice } from "../src/components/ApiKeyPrivacyNotice";
import { geminiKey } from "../src/lib/provider-key";

export default function Home() {
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);

  function continueWithGemini() {
    geminiKey.set(key);
    setKey("");
    setSaved(true);
  }

  return (
    <main className="shell">
      <nav className="nav">
        <div className="brand">rkeytect</div>
        <div><a href="https://github.com/pushpendradwivedi/rkeytect">GitHub</a><a href="#how">How it works</a></div>
      </nav>

      <section className="hero">
        <div className="eyebrow">Open source · AI-assisted · Architecture-first</div>
        <h1>Turn AWS blogs into architecture you can inspect.</h1>
        <p>Paste an AWS Architecture Blog. rkeytect extracts evidence, builds an architecture model, and lets you review what is confirmed, inferred, and recommended.</p>

        <div className="card analyzer">
          <div className="row">
            <input aria-label="AWS Blog URL" type="url" placeholder="Paste an AWS Blog URL…" value={url} onChange={(e) => setUrl(e.target.value)} />
            <button className="primary" type="button">Analyze</button>
          </div>
          <div className="privacy"><strong>🔐 Bring your own Gemini key</strong><p>For AI analysis, your key stays in browser memory and is used for direct Gemini requests. rkeytect does not send, store, or log the key.</p></div>
          <div style={{ marginTop: 12 }} className="row">
            <input aria-label="Gemini API key" type="password" placeholder={saved ? "Gemini key loaded for this session" : "Gemini API key (optional until Analyze)"} value={key} onChange={(e) => { setKey(e.target.value); setSaved(false); }} />
            <button type="button" className="primary" onClick={continueWithGemini} disabled={!key.trim()}>Use key</button>
          </div>
        </div>

        <div className="disclaimer" style={{marginTop:20}}><strong>⚠ AI-generated architecture</strong><br/>rkeytect does not certify architecture. Generated diagrams, inferences and recommendations can be wrong or incomplete. Verify against the original AWS source and official AWS documentation before production use.</div>
      </section>

      <section className="section" id="how">
        <div className="grid">
          <div className="card feature"><h3>🟢 Confirmed</h3><p>Claims explicitly supported by the source article or diagram.</p></div>
          <div className="card feature"><h3>🟡 Inferred</h3><p>Architecture relationships interpreted from available evidence.</p></div>
          <div className="card feature"><h3>🔵 Recommended</h3><p>Solution Architect suggestions that are not claimed to be in the source.</p></div>
          <div className="card feature"><h3>🔴 Conflict</h3><p>Potential inconsistencies between text, diagrams, and other evidence.</p></div>
        </div>
      </section>
    </main>
  );
}
