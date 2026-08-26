import type { DiagramObservation } from "../../../../packages/diagram-understanding";

export function ArchitectureObservation({ observation }: { observation: DiagramObservation }) {
  const sourceMode = observation.sourceMode ?? "prose";
  const relevant = observation.isArchitectureRelevant !== false;
  const confidence = observation.architectureConfidence;
  const evidenceSignals = observation.sourceEvidence?.length ?? 0;

  return (
    <section className="mx-auto mt-8 w-full max-w-[1500px] rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(16,24,40,.07)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.14em] ${relevant ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              {relevant ? "Architecture detected" : "Not an architecture source"}
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">AI-generated · verify</span>
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-950">Evidence snapshot</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            {observation.assessmentReason ?? (sourceMode === "diagram" ? "A source architecture diagram was analyzed." : "The architecture was reconstructed from source prose and available evidence.")}
          </p>
        </div>
        {typeof confidence === "number" && <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right"><div className="text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-400">Architecture confidence</div><div className="mt-1 text-2xl font-bold text-slate-950">{Math.round(confidence * 100)}%</div></div>}
      </div>

      {relevant ? <>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-400">Components</div><div className="mt-1 text-2xl font-bold text-slate-950">{observation.regions.length}</div></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-400">Relationships</div><div className="mt-1 text-2xl font-bold text-slate-950">{observation.edges.length}</div></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-400">Evidence signals</div><div className="mt-1 text-2xl font-bold text-slate-950">{evidenceSignals}</div></div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-600">Source mode: {sourceMode}</span>
          {observation.imageUrl && <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-600">Source image analyzed</span>}
          {observation.warnings.length > 0 && <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 font-semibold text-amber-800">{observation.warnings.length} warning{observation.warnings.length === 1 ? "" : "s"}</span>}
        </div>
      </> : <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-900"><strong>rkeytect stopped rather than inventing a diagram.</strong> This page did not provide enough evidence of an architecture, so no reconstructed system should be treated as valid.</div>}

      <details className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <summary className="cursor-pointer text-sm font-bold text-slate-700">Inspect raw observations</summary>
        <pre className="mt-3 max-h-96 overflow-auto rounded-xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600">{JSON.stringify(observation, null, 2)}</pre>
      </details>
    </section>
  );
}
