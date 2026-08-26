"use client";

import { useMemo, useState } from "react";
import type { DiagramObservation } from "../../../../packages/diagram-understanding";
import { ArchitectureViewControls, type ArchitectureView } from "./ArchitectureViewControls";
import { classifyRelationship, classifyComponent } from "../../../../packages/architecture-ir/typed-observation";

const AWS_ICON_BASE = "https://cdn.jsdelivr.net/npm/aws-icons@latest/icons/architecture-service/";
const AWS_ICON_FILES: Array<[RegExp, string]> = [
  [/amazon s3/i, "AmazonS3.svg"],
  [/amazon bedrock/i, "AmazonBedrock.svg"],
  [/amazon opensearch/i, "AmazonOpenSearchService.svg"],
  [/amazon dynamodb/i, "AmazonDynamoDB.svg"],
  [/amazon ec2/i, "AmazonEC2.svg"],
  [/amazon rds/i, "AmazonRDS.svg"],
  [/amazon kinesis/i, "AmazonKinesisDataStreams.svg"],
  [/amazon sageMaker/i, "AmazonSageMaker.svg"],
  [/aws lambda/i, "AWSLambda.svg"],
  [/amazon api gateway/i, "AmazonAPIGateway.svg"],
  [/amazon cloudfront/i, "AmazonCloudFront.svg"],
  [/amazon cognito/i, "AmazonCognito.svg"],
  [/amazon sqs/i, "AmazonSimpleQueueService.svg"],
  [/amazon sns/i, "AmazonSimpleNotificationService.svg"],
  [/aws cloudformation/i, "AWSCloudFormation.svg"],
  [/aws codepipeline/i, "AWSCodePipeline.svg"],
];

function iconFor(label: string) {
  const match = AWS_ICON_FILES.find(([pattern]) => pattern.test(label));
  return match ? `${AWS_ICON_BASE}${match[1]}` : null;
}

function wrapLabel(label: string, max = 25) {
  if (label.length <= max) return [label];
  const words = label.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else line = `${line} ${word}`.trim();
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

export function ObservationGraph({ observation }: { observation: DiagramObservation }) {
  const [view, setView] = useState<ArchitectureView>("all");
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const regions = observation.regions.filter((region) => Boolean(region.label));
  const regionById = useMemo(() => new Map(regions.map((region) => [region.id, region])), [regions]);
  const edges = observation.edges.filter((edge) => view === "all" || classifyRelationship(edge.label ?? "") === view);
  const positions = useMemo(() => {
    const incoming = new Map(regions.map((r) => [r.id, 0]));
    edges.forEach((edge) => incoming.set(edge.targetRegionId, (incoming.get(edge.targetRegionId) ?? 0) + 1));
    const level = new Map<string, number>();
    const queue = regions.filter((r) => (incoming.get(r.id) ?? 0) === 0).map((r) => r.id);
    queue.forEach((id) => level.set(id, 0));
    for (let pass = 0; pass < regions.length + 2; pass++) {
      for (const edge of edges) {
        const source = level.get(edge.sourceRegionId);
        if (source !== undefined) level.set(edge.targetRegionId, Math.max(level.get(edge.targetRegionId) ?? 0, source + 1));
      }
    }
    const grouped = new Map<number, string[]>();
    regions.forEach((r) => {
      const l = level.get(r.id) ?? 0;
      grouped.set(l, [...(grouped.get(l) ?? []), r.id]);
    });
    const result = new Map<string, { x: number; y: number }>();
    const cardW = 270, cardH = 116, gapX = 78, gapY = 34;
    [...grouped.entries()].sort((a, b) => a[0] - b[0]).forEach(([l, ids]) => ids.forEach((id, i) => result.set(id, { x: 36 + l * (cardW + gapX), y: 42 + i * (cardH + gapY) })));
    return { result, cardW, cardH, width: Math.max(980, ((Math.max(0, ...[...grouped.keys()])) + 1) * (cardW + gapX) + 36), height: Math.max(430, Math.max(1, ...[...grouped.values()].map((g) => g.length)) * (cardH + gapY) + 60) };
  }, [regions, edges]);
  const selected = observation.edges.find((edge) => edge.id === selectedEdge);

  return (
    <section className="mx-auto mt-6 w-full max-w-7xl rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(16,24,40,.08)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[.14em] text-slate-400">Architecture view</div>
          <h2 className="mt-1 text-xl font-bold tracking-tight">Reconstructed system</h2>
          <p className="mt-1 text-xs text-slate-500">Source evidence → AI interpretation · not authoritative AWS guidance</p>
        </div>
        <ArchitectureViewControls value={view} onChange={setView} />
      </div>
      <div className="mt-5 overflow-auto rounded-2xl border border-slate-200 bg-[#fbfcfe] p-2">
        <svg viewBox={`0 0 ${positions.width} ${positions.height}`} className="min-w-[980px] w-full" role="img" aria-label="Reconstructed architecture diagram">
          <defs>
            <marker id="rkeytect-observation-arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#64748b" /></marker>
            <filter id="rkeytect-card-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.10" /></filter>
          </defs>
          {edges.map((edge) => {
            const source = positions.result.get(edge.sourceRegionId);
            const target = positions.result.get(edge.targetRegionId);
            if (!source || !target) return null;
            const sx = source.x + positions.cardW, sy = source.y + positions.cardH / 2;
            const tx = target.x, ty = target.y + positions.cardH / 2;
            const mid = (sx + tx) / 2;
            const selected = selectedEdge === edge.id;
            return <g key={edge.id} onClick={() => setSelectedEdge(edge.id)} className="cursor-pointer"><path d={`M ${sx} ${sy} L ${mid} ${sy} L ${mid} ${ty} L ${tx} ${ty}`} fill="none" stroke={selected ? "#111827" : "#94a3b8"} strokeWidth={selected ? 2.8 : 1.8} strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#rkeytect-observation-arrow)" /><text x={mid} y={(sy + ty) / 2 - 5} textAnchor="middle" fontSize="9" fill="#64748b">{edge.label.length > 32 ? `${edge.label.slice(0, 32)}…` : edge.label}</text></g>;
          })}
          {regions.map((region) => {
            const pos = positions.result.get(region.id)!;
            const kind = classifyComponent(region.label ?? "");
            const icon = iconFor(region.label ?? "");
            const lines = wrapLabel(region.label ?? "Unknown");
            return <g key={region.id} filter="url(#rkeytect-card-shadow)">
              <rect x={pos.x} y={pos.y} width={positions.cardW} height={positions.cardH} rx="16" fill="#ffffff" stroke="#d9e0ea" strokeWidth="1.5" />
              <rect x={pos.x} y={pos.y} width="5" height={positions.cardH} rx="3" fill="#ff9900" />
              {icon ? <image href={icon} x={pos.x + 17} y={pos.y + 21} width="44" height="44" preserveAspectRatio="xMidYMid meet" /> : <rect x={pos.x + 17} y={pos.y + 21} width="44" height="44" rx="12" fill="#eef2f7" />}
              {!icon && <text x={pos.x + 39} y={pos.y + 49} textAnchor="middle" fontSize="17" fontWeight="800" fill="#475467">{(region.label ?? "?").slice(0, 1).toUpperCase()}</text>}
              <text x={pos.x + 74} y={pos.y + 25} fontSize="9" fontWeight="700" fill="#98a2b3" textTransform="uppercase">{kind}</text>
              {lines.map((line, index) => <text key={line} x={pos.x + 74} y={pos.y + 49 + index * 17} fontSize="13" fontWeight="750" fill="#101828">{line}</text>)}
              <text x={pos.x + 74} y={pos.y + 93} fontSize="9.5" fill="#667085">AI observation · {Math.round(region.confidence * 100)}%</text>
            </g>;
          })}
        </svg>
      </div>
      {selected && <aside className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-400">Relationship evidence</div><div className="mt-1 font-semibold text-slate-900">{regionById.get(selected.sourceRegionId)?.label} → {regionById.get(selected.targetRegionId)?.label}</div><p className="mt-2 text-sm text-slate-600">{selected.label}</p><div className="mt-2 text-xs text-slate-400">{classifyRelationship(selected.label ?? "")} · {Math.round(selected.confidence * 100)}% observation confidence</div></aside>}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><span className="text-base">⚠</span><span>AI observations are evidence candidates, not facts. Verify important components and flows against the source page and official documentation.</span></div>
    </section>
  );
}
