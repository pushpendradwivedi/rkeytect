"use client";

import type { RenderModel } from "../../../../packages/architecture-renderer";
import { useState } from "react";

const stateLabel = {
  confirmed: "🟢 Confirmed",
  inferred: "🟡 Inferred",
  recommended: "🔵 Recommended",
  conflict: "🔴 Conflict",
} as const;

export function ArchitectureGraph({ model }: { model: RenderModel }) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedNode = model.nodes.find((node) => node.id === selected);

  return (
    <section className="mx-auto mt-6 w-full max-w-6xl rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{model.title}</h2>
          <p className="mt-1 text-xs opacity-60">AI-generated architecture · verify before use</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.values(stateLabel).map((label) => <span key={label} className="rounded-full border px-2 py-1">{label}</span>)}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border p-6">
        <div className="flex min-w-[760px] items-center justify-center gap-3">
          {model.nodes.map((node, index) => (
            <div key={node.id} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelected(node.id)}
                className="min-w-40 rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="text-xs opacity-60">{node.service ?? "Component"}</div>
                <div className="mt-1 font-semibold">{node.label}</div>
                <div className="mt-2 text-xs">{stateLabel[node.state]}</div>
              </button>
              {index < model.nodes.length - 1 && <span className="text-lg opacity-40">→</span>}
            </div>
          ))}
        </div>
      </div>

      {selectedNode && (
        <aside className="mt-5 rounded-xl border p-4">
          <button type="button" onClick={() => setSelected(null)} className="float-right text-xs opacity-60">Close</button>
          <div className="text-xs uppercase opacity-50">Evidence-backed component</div>
          <h3 className="mt-1 text-lg font-semibold">{selectedNode.label}</h3>
          <p className="mt-2 text-sm">{stateLabel[selectedNode.state]}</p>
          <div className="mt-3 text-xs opacity-60">Evidence: {selectedNode.evidenceIds.length ? selectedNode.evidenceIds.join(", ") : "none"}</div>
        </aside>
      )}

      <div className="mt-5 rounded-xl border p-4 text-sm">⚠️ {model.warning}</div>
    </section>
  );
}
