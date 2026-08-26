"use client";

import type { AwsStyleModel } from "../../../../packages/architecture-renderer/aws-style";
import { useMemo, useState } from "react";

export type Visibility = "all" | "confirmed" | "inferred" | "recommended";

export function ArchitectureControls({ model, onChange }: { model: AwsStyleModel; onChange: (model: AwsStyleModel) => void }) {
  const [visibility, setVisibility] = useState<Visibility>("all");
  const [showBoundaries, setShowBoundaries] = useState(true);
  const filtered = useMemo(() => {
    if (visibility === "all") return model;
    const nodes = model.nodes.filter((node) => node.state === visibility);
    const ids = new Set(nodes.map((node) => node.id));
    return { ...model, nodes, edges: model.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target)) };
  }, [model, visibility]);

  return (
    <div className="mx-auto mt-4 flex w-full max-w-7xl flex-wrap items-center gap-2 rounded-xl border bg-white p-3 text-sm">
      <span className="mr-2 font-semibold">Show:</span>
      {(["all", "confirmed", "inferred", "recommended"] as Visibility[]).map((value) => (
        <button key={value} type="button" onClick={() => { setVisibility(value); onChange(filtered); }} className={`rounded-full border px-3 py-1 ${visibility === value ? "font-semibold" : "opacity-70"}`}>
          {value === "all" ? "Everything" : value[0].toUpperCase() + value.slice(1)}
        </button>
      ))}
      <label className="ml-auto flex items-center gap-2">
        <input type="checkbox" checked={showBoundaries} onChange={(event) => setShowBoundaries(event.target.checked)} />
        Show architecture boundaries
      </label>
    </div>
  );
}
