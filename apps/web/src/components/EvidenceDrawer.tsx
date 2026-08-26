"use client";

import { useState } from "react";

export interface EvidenceItem {
  id: string;
  state: string;
  confidence: number;
  source: { url: string; title?: string; location?: string; excerpt?: string };
  rationale?: string;
}

export function EvidenceDrawer({ items }: { items: EvidenceItem[] }) {
  const [open, setOpen] = useState(true);
  return (
    <aside className="mx-auto mt-4 w-full max-w-7xl rounded-xl border bg-white p-4">
      <button type="button" onClick={() => setOpen((value) => !value)} className="font-semibold">{open ? "Hide" : "Show"} evidence</button>
      {open && <div className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border p-3">
            <div className="flex items-center justify-between gap-2"><span className="font-medium">{item.id}</span><span className="text-xs">{item.state} · {Math.round(item.confidence * 100)}%</span></div>
            {item.source.excerpt && <blockquote className="mt-2 border-l-2 pl-3 text-sm opacity-80">{item.source.excerpt}</blockquote>}
            <div className="mt-2 text-xs opacity-60">{item.source.location ?? item.source.url}</div>
            {item.rationale && <p className="mt-2 text-xs">{item.rationale}</p>}
          </article>
        ))}
      </div>}
    </aside>
  );
}
