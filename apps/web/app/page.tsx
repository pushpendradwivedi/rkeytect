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
        <h1>Turn technical pages into architecture you can inspect.</h1>
        <p>Paste a public technical page. rkeytect finds architecture evidence, rejects unrelated pages, and separates source-supported observations from AI interpretation.</p>
        <AnalyzePanel />
      </section>

      <section className="section" id="how">
        <div className="grid">
          <div className="card feature"><h3>01 · Detect</h3><p>Decide whether the source is actually about software, cloud, infrastructure, deployment, or system architecture.</p></div>
          <div className="card feature"><h3>02 · Inspect</h3><p>Prefer a real architecture diagram. If none is trustworthy, reconstruct only from explicit source prose.</p></div>
          <div className="card feature"><h3>03 · Explain</h3><p>Show components and relationships with confidence and source-aware evidence instead of pretending inference is fact.</p></div>
          <div className="card feature"><h3>04 · Verify</h3><p>Every result is explicitly AI-generated and designed to be checked against the original source.</p></div>
        </div>
      </section>
    </main>
  );
}
