"use client";

import { useMemo, useState } from "react";
import type { DiagramObservation } from "../../../../packages/diagram-understanding";
import { ArchitectureViewControls, type ArchitectureView } from "./ArchitectureViewControls";
import { classifyRelationship, classifyComponent } from "../../../../packages/architecture-ir/typed-observation";

export function ObservationGraph({ observation }: { observation: DiagramObservation }) {
  const [view, setView] = useState<ArchitectureView>("all");
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const regions = observation.regions.filter((region) => Boolean(region.label));
  const regionById = useMemo(() => new Map(regions.map((region) => [region.id, region])), [regions]);
  const edges = observation.edges.filter((edge) => view === "all" || classifyRelationship(edge.label ?? "") === view);
  const cols = Math.max(1, Math.ceil(Math.sqrt(regions.length)));
  const width = Math.max(900, cols * 240 + 80);
  const height = Math.max(420, Math.ceil(regions.length / cols) * 145 + 80);
  const selected = observation.edges.find((edge) => edge.id === selectedEdge);

  return (
    <section className="mx-auto mt-6 w-full max-w-7xl rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Architecture reconstruction</h2>
          <p className="mt-1 text-xs opacity-60">Built from source evidence · AI-generated · verify before use</p>
        </div>
        <ArchitectureViewControls value={view} onChange={setView} />
      </div>
      <div className="mt-4 overflow-auto rounded-xl border p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[900px] w-full" role="img" aria-label="Reconstructed AWS architecture">
          <defs><marker id="rkeytect-observation-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="currentColor" /></marker></defs>
          {edges.map((edge) => {
            const sourceIndex = regions.findIndex((region) => region.id === edge.sourceRegionId);
            const targetIndex = regions.findIndex((region) => region.id === edge.targetRegionId);
            if (sourceIndex < 0 || targetIndex < 0) return null;
            const sx = (sourceIndex % cols) * 240 + 210;
            const sy = Math.floor(sourceIndex / cols) * 145 + 65;
            const tx = (targetIndex % cols) * 240 + 20;
            const ty = Math.floor(targetIndex / cols) * 145 + 65;
            return <g key={edge.id} onClick={() => setSelectedEdge(edge.id)} className="cursor-pointer"><line x1={sx} y1={sy} x2={tx} y2={ty} stroke="currentColor" strokeWidth={selectedEdge === edge.id ? 3 : 2} opacity="0.5" markerEnd="url(#rkeytect-observation-arrow)" /></g>;
          })}
          {regions.map((region, index) => {
            const x = (index % cols) * 240 + 20;
            const y = Math.floor(index / cols) * 145 + 20;
            const kind = classifyComponent(region.label ?? "");
            return <g key={region.id}><rect x={x} y={y} width="190" height="90" rx="14" fill="white" stroke="currentColor" strokeWidth="2" /><text x={x + 14} y={y + 22} fontSize="10" opacity="0.55">{kind}</text><text x={x + 14} y={y + 48} fontSize="14" fontWeight="600">{(region.label ?? "Unknown").slice(0, 27)}</text><text x={x + 14} y={y + 72} fontSize="10">🟡 AI-inferred · {Math.round(region.confidence * 100)}%</text></g>;
          })}
        </svg>
      </div>
      {selected && <aside className="mt-4 rounded-xl border p-4"><div className="text-xs uppercase opacity-50">Relationship evidence</div><div className="mt-1 font-semibold">{regionById.get(selected.sourceRegionId)?.label} → {regionById.get(selected.targetRegionId)?.label}</div><p className="mt-2 text-sm">{selected.label}</p><div className="mt-2 text-xs opacity-60">{classifyRelationship(selected.label ?? "")} · {Math.round(selected.confidence * 100)}% confidence</div></aside>}
      <div className="mt-4 rounded-xl border p-4 text-sm">⚠️ No component or relationship should be treated as authoritative solely because an AI model produced it. Verify each important claim against the original AWS source.</div>
    </section>
  );
}
