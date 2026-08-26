"use client";

import { AnalyzePanel } from "../src/components/AnalyzePanel";

export default function Home() {
  return (
    <main className="shell">
      <nav className="nav">
        <div className="brand">rkeytect</div>
        <div><a href="https://github.com/pushpendradwivedi/rkeytect">GitHub</a><a href="#how">How it works</a></div>
      </nav>

      <section className="hero">
        <div className="eyebrow">Open source · AI-assisted · Architecture-first</div>
        <h1>Turn AWS blogs into architecture you can inspect.</h1>
        <p>Paste an AWS Blog. rkeytect extracts source evidence, inspects architecture diagrams, and separates what is confirmed from what AI inferred.</p>
        <AnalyzePanel />
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
