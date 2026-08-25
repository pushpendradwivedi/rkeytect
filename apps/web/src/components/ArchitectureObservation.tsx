import type { DiagramObservation } from "../../../../packages/diagram-understanding";

export function ArchitectureObservation({ observation }: { observation: DiagramObservation }) {
  return (
    <section className="mx-auto mt-6 w-full max-w-3xl rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Architecture observation</h2>
        <span className="rounded-full border px-3 py-1 text-xs">AI-generated · Verify</span>
      </div>
      <p className="mt-2 text-sm opacity-70">These are candidate observations from the source diagram. They are not authoritative architecture and have not yet been promoted to confirmed Architecture IR.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase opacity-60">Regions</div>
          <div className="mt-1 text-2xl font-semibold">{observation.regions.length}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase opacity-60">Candidate edges</div>
          <div className="mt-1 text-2xl font-semibold">{observation.edges.length}</div>
        </div>
      </div>
      <details className="mt-5">
        <summary className="cursor-pointer text-sm font-semibold">Show raw observations</summary>
        <pre className="mt-3 max-h-96 overflow-auto rounded-xl border p-3 text-xs">{JSON.stringify(observation, null, 2)}</pre>
      </details>
    </section>
  );
}
