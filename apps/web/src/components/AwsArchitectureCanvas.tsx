"use client";

import type { AwsStyleModel } from "../../../../packages/architecture-renderer/aws-style";
import { layoutAwsArchitecture } from "../../../../packages/architecture-renderer/layout";
import { useMemo, useState } from "react";

const stateText = {
  confirmed: "🟢 Confirmed from source",
  inferred: "🟡 AI-inferred",
  recommended: "🔵 AI recommendation",
  conflict: "🔴 Potential conflict",
} as const;

export function AwsArchitectureCanvas({ model }: { model: AwsStyleModel }) {
  const layout = useMemo(() => layoutAwsArchitecture(model), [model]);
  const [selected, setSelected] = useState<string | null>(null);
  const nodeById = new Map(model.nodes.map((node) => [node.id, node]));
  const selectedNode = selected ? nodeById.get(selected) : undefined;

  return (
    <section className="mx-auto mt-6 w-full max-w-7xl rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{model.title}</h2>
          <p className="mt-1 text-xs opacity-60">AWS-style rendering · AI-generated · verify before use</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {model.legend.map((item) => <span key={item.state} className="rounded-full border px-2 py-1">{item.label}</span>)}
        </div>
      </div>

      <div className="mt-5 overflow-auto rounded-xl border p-3">
        <svg viewBox={`0 0 ${layout.width} ${layout.height}`} className="min-h-[420px] min-w-[800px] w-full" role="img" aria-label="Generated AWS architecture diagram">
          <defs>
            <marker id="rkeytect-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
            </marker>
          </defs>
          {layout.edges.map((edge) => {
            const source = layout.nodes.find((node) => node.id === edge.source);
            const target = layout.nodes.find((node) => node.id === edge.target);
            if (!source || !target) return null;
            return <line key={edge.id} x1={source.x + source.width} y1={source.y + source.height / 2} x2={target.x} y2={target.y + target.height / 2} stroke="currentColor" strokeWidth="2" markerEnd="url(#rkeytect-arrow)" opacity="0.45" />;
          })}
          {layout.nodes.map((position) => {
            const node = nodeById.get(position.id);
            if (!node) return null;
            return (
              <g key={node.id} onClick={() => setSelected(node.id)} role="button" tabIndex={0} className="cursor-pointer" onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelected(node.id); }}>
                <rect x={position.x} y={position.y} width={position.width} height={position.height} rx="14" fill="white" stroke="currentColor" strokeWidth="2" />
                <text x={position.x + 16} y={position.y + 26} fontSize="11" opacity="0.55">{node.iconKey}</text>
                <text x={position.x + 16} y={position.y + 53} fontSize="15" fontWeight="600">{node.label}</text>
                <text x={position.x + 16} y={position.y + 78} fontSize="11">{stateText[node.state]}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {selectedNode && (
        <aside className="mt-5 rounded-xl border p-4">
          <button type="button" onClick={() => setSelected(null)} className="float-right text-xs opacity-60">Close</button>
          <div className="text-xs uppercase opacity-50">Evidence</div>
          <h3 className="mt-1 text-lg font-semibold">{selectedNode.label}</h3>
          <p className="mt-2 text-sm">{stateText[selectedNode.state]}</p>
          <p className="mt-2 text-xs opacity-60">Evidence IDs: {selectedNode.evidenceIds.join(", ") || "none"}</p>
        </aside>
      )}

      <div className="mt-5 rounded-xl border p-4 text-sm">⚠️ {model.warning}</div>
    </section>
  );
}
