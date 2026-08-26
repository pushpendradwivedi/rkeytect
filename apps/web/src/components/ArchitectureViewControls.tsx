"use client";

import type { RelationshipKind } from "../../../../packages/architecture-ir/typed-observation";

export type ArchitectureView = "all" | RelationshipKind;

const labels: Record<ArchitectureView, string> = {
  all: "All",
  runtime: "Runtime",
  data: "Data",
  provisioning: "Provisioning",
  control: "Control",
  security: "Security",
  unknown: "Other",
};

export function ArchitectureViewControls({ value, onChange }: { value: ArchitectureView; onChange: (value: ArchitectureView) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Architecture relationship views">
      {(Object.keys(labels) as ArchitectureView[]).map((view) => (
        <button key={view} type="button" onClick={() => onChange(view)} aria-pressed={value === view} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${value === view ? "font-semibold" : "opacity-65"}`}>
          {labels[view]}
        </button>
      ))}
    </div>
  );
}
