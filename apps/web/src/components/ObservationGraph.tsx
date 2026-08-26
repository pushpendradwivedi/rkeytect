"use client";

import { useMemo, useState } from "react";
import type { DiagramObservation, DiagramRegion } from "../../../../packages/diagram-understanding";
import { ArchitectureViewControls, type ArchitectureView } from "./ArchitectureViewControls";
import { classifyRelationship, classifyComponent, type ComponentKind, type RelationshipKind } from "../../../../packages/architecture-ir/typed-observation";

const AWS_ICON_BASE = "https://cdn.jsdelivr.net/npm/aws-icons@latest/icons/architecture-service/";
const AWS_ICON_FILES: Array<[RegExp, string]> = [
  [/amazon s3/i, "AmazonS3.svg"],
  [/amazon bedrock/i, "AmazonBedrock.svg"],
  [/amazon opensearch/i, "AmazonOpenSearchService.svg"],
  [/amazon dynamodb/i, "AmazonDynamoDB.svg"],
  [/amazon ec2/i, "AmazonEC2.svg"],
  [/amazon rds/i, "AmazonRDS.svg"],
  [/amazon kinesis/i, "AmazonKinesisDataStreams.svg"],
  [/amazon sagemaker/i, "AmazonSageMaker.svg"],
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

function wrapLabel(label: string, max = 24) {
  if (label.length <= max) return [label];
  const words = label.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = `${line} ${word}`.trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function laneFor(region: DiagramRegion): "actors" | "applications" | "services" | "data" | "platform" {
  const label = region.label.toLowerCase();
  const kind = classifyComponent(region.label);
  if (kind === "client") return "actors";
  if (kind === "application") return "applications";
  if (/s3|dynamodb|rds|opensearch|vector store|database|datastore|bucket|queue/.test(label)) return "data";
  if (kind === "infrastructure_tool" || kind === "automation" || /iam|cloudwatch|vpc|endpoint|lambda/.test(label)) return "platform";
  return "services";
}

const LANE_META: Record<string, { title: string; subtitle: string; x: number }> = {
  actors: { title: "Actors & clients", subtitle: "Entry points", x: 40 },
  applications: { title: "Applications", subtitle: "Application / protocol layer", x: 330 },
  services: { title: "AWS services", subtitle: "Managed runtime services", x: 650 },
  data: { title: "Data & stores", subtitle: "Persistent state / retrieval", x: 980 },
  platform: { title: "Platform & controls", subtitle: "Infrastructure, security & automation", x: 980 },
};

function relationshipTone(kind: RelationshipKind) {
  switch (kind) {
    case "data": return { stroke: "#16a34a", marker: "#16a34a" };
    case "security": return { stroke: "#dc2626", marker: "#dc2626" };
    case "provisioning": return { stroke: "#7c3aed", marker: "#7c3aed" };
    case "control": return { stroke: "#ea580c", marker: "#ea580c" };
    default: return { stroke: "#344054", marker: "#344054" };
  }
}

export function ObservationGraph({ observation }: { observation: DiagramObservation }) {
  const [view, setView] = useState<ArchitectureView>("all");
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const regions = observation.regions.filter((region) => Boolean(region.label));
  const regionById = useMemo(() => new Map(regions.map((region) => [region.id, region])), [regions]);
  const edges = observation.edges.filter((edge) => view === "all" || classifyRelationship(edge.label ?? "") === view);

  const layout = useMemo(() => {
    const groups = new Map<string, DiagramRegion[]>();
    for (const region of regions) {
      const lane = laneFor(region);
      groups.set(lane, [...(groups.get(lane) ?? []), region]);
    }

    // Put the main request path higher, with data stores and platform controls below it.
    const order: Array<"actors" | "applications" | "services" | "data" | "platform"> = ["actors", "applications", "services", "data", "platform"];
    const result = new Map<string, { x: number; y: number; lane: string }>();
    const cardW = 250;
    const cardH = 126;
    const gapY = 24;

    for (const lane of order) {
      const items = groups.get(lane) ?? [];
      items.forEach((region, index) => {
        const baseY = lane === "data" || lane === "platform" ? 410 : 118;
        result.set(region.id, { x: LANE_META[lane].x, y: baseY + index * (cardH + gapY), lane });
      });
    }

    const maxBottom = Math.max(650, ...[...result.values()].map((p) => p.y + cardH + 80));
    return { result, cardW, cardH, width: 1280, height: maxBottom };
  }, [regions]);

  const selected = observation.edges.find((edge) => edge.id === selectedEdge);
  const sourceMode = observation.sourceMode ?? "prose";

  return (
    <section className="mx-auto mt-8 w-full max-w-[1500px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(16,24,40,.10)]">
      <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-600">Architecture canvas</span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">AI-generated · verify</span>
              <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-500">{sourceMode === "diagram" ? "Source diagram analyzed" : "Prose reconstruction"}</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">Reconstructed system</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">rkeytect converts source evidence into an inspectable architecture model. It is not authoritative AWS guidance.</p>
          </div>
          <ArchitectureViewControls value={view} onChange={setView} />
        </div>
      </div>

      <div className="overflow-auto bg-[#f8fafc] p-4 sm:p-6">
        <div className="relative mx-auto min-w-[1280px] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm" style={{ width: layout.width, minHeight: layout.height }}>
          <div className="absolute left-4 right-4 top-4 flex items-start justify-between rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[.16em] text-slate-400">Request / runtime path</div>
              <div className="mt-1 text-xs text-slate-500">Read left → right. Data and platform relationships sit below the primary request path.</div>
            </div>
            <div className="flex gap-4 text-[10px] font-semibold text-slate-500">
              <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-slate-700" />Runtime</span>
              <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-green-600" />Data</span>
              <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-red-600" />Security</span>
            </div>
          </div>

          <svg viewBox={`0 0 ${layout.width} ${layout.height}`} className="absolute inset-0 h-full w-full" role="img" aria-label="Reconstructed architecture diagram">
            <defs>
              {(["runtime", "data", "security", "provisioning", "control"] as const).map((kind) => {
                const tone = relationshipTone(kind);
                return <marker key={kind} id={`rkeytect-${kind}`} markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={tone.marker} /></marker>;
              })}
            </defs>

            {Object.entries(LANE_META).map(([lane, meta]) => {
              const items = regions.filter((region) => laneFor(region) === lane);
              if (!items.length) return null;
              const isLower = lane === "data" || lane === "platform";
              return <g key={lane}>
                <rect x={meta.x - 16} y={isLower ? 385 : 82} width="274" height={isLower ? Math.max(190, items.length * 150 + 28) : Math.max(230, items.length * 150 + 28)} rx="22" fill={isLower ? "#f8fafc" : "#ffffff"} stroke="#e4e7ec" strokeWidth="1.5" strokeDasharray={isLower ? "6 5" : undefined} />
                <text x={meta.x + 4} y={isLower ? 412 : 108} fontSize="13" fontWeight="800" fill="#101828">{meta.title}</text>
                <text x={meta.x + 4} y={isLower ? 430 : 126} fontSize="9.5" fill="#98a2b3">{meta.subtitle}</text>
              </g>;
            })}

            {edges.map((edge) => {
              const source = layout.result.get(edge.sourceRegionId);
              const target = layout.result.get(edge.targetRegionId);
              if (!source || !target) return null;
              const sx = source.x + layout.cardW;
              const sy = source.y + layout.cardH / 2;
              const tx = target.x;
              const ty = target.y + layout.cardH / 2;
              const tone = relationshipTone(classifyRelationship(edge.label ?? ""));
              const selectedNow = selectedEdge === edge.id;
              const isSameLane = source.lane === target.lane;
              const midX = isSameLane ? sx + 38 : (sx + tx) / 2;
              const d = isSameLane
                ? `M ${sx} ${sy} C ${sx + 45} ${sy} ${sx + 45} ${ty} ${tx} ${ty}`
                : `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ty} L ${tx} ${ty}`;
              const label = edge.label.length > 34 ? `${edge.label.slice(0, 34)}…` : edge.label;
              return <g key={edge.id} onClick={() => setSelectedEdge(edge.id)} className="cursor-pointer">
                <path d={d} fill="none" stroke={selectedNow ? "#111827" : tone.stroke} strokeWidth={selectedNow ? 3.2 : 1.8} strokeDasharray={classifyRelationship(edge.label ?? "") === "security" ? "5 4" : undefined} strokeLinecap="round" markerEnd={`url(#rkeytect-${classifyRelationship(edge.label ?? "")})`} />
                <text x={midX} y={Math.min(sy, ty) - 8} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#475467">{label}</text>
              </g>;
            })}

            {regions.map((region) => {
              const pos = layout.result.get(region.id)!;
              const kind = classifyComponent(region.label ?? "");
              const icon = iconFor(region.label ?? "");
              const lines = wrapLabel(region.label ?? "Unknown");
              return <g key={region.id}>
                <rect x={pos.x} y={pos.y} width={layout.cardW} height={layout.cardH} rx="18" fill="#fff" stroke="#d0d5dd" strokeWidth="1.5" />
                <rect x={pos.x} y={pos.y} width="5" height={layout.cardH} rx="3" fill={kind === "aws_service" ? "#ff9900" : kind === "client" ? "#7f56d9" : "#1570ef"} />
                {icon ? <image href={icon} x={pos.x + 18} y={pos.y + 25} width="48" height="48" preserveAspectRatio="xMidYMid meet" /> : <rect x={pos.x + 18} y={pos.y + 25} width="48" height="48" rx="13" fill="#f2f4f7" />}
                {!icon && <text x={pos.x + 42} y={pos.y + 55} textAnchor="middle" fontSize="18" fontWeight="800" fill="#667085">{(region.label ?? "?").slice(0, 1).toUpperCase()}</text>}
                <text x={pos.x + 82} y={pos.y + 28} fontSize="9" fontWeight="800" fill="#98a2b3">{kind.replace(/_/g, " ").toUpperCase()}</text>
                {lines.map((line, index) => <text key={`${region.id}-${index}`} x={pos.x + 82} y={pos.y + 54 + index * 18} fontSize="13" fontWeight="750" fill="#101828">{line}</text>)}
                <text x={pos.x + 82} y={pos.y + 103} fontSize="9.5" fill="#667085">AI observation · {Math.round(region.confidence * 100)}%</text>
              </g>;
            })}
          </svg>
        </div>
      </div>

      {selected && <aside className="border-t border-slate-200 bg-slate-50 px-6 py-5 sm:px-8"><div className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400">Selected relationship</div><div className="mt-1 text-sm font-bold text-slate-950">{regionById.get(selected.sourceRegionId)?.label} <span className="mx-1 text-slate-400">→</span> {regionById.get(selected.targetRegionId)?.label}</div><p className="mt-2 text-sm text-slate-600">{selected.label}</p><div className="mt-2 text-xs text-slate-500">{classifyRelationship(selected.label ?? "")} · {Math.round(selected.confidence * 100)}% observation confidence</div></aside>}

      <div className="flex flex-col gap-3 border-t border-amber-200 bg-amber-50 px-6 py-4 text-xs leading-5 text-amber-950 sm:flex-row sm:items-start sm:px-8"><span className="text-base">⚠</span><span><strong>AI-generated architecture.</strong> rkeytect is an interpretation of source evidence, not authoritative AWS guidance. Verify important components and flows against the original source and official documentation.</span></div>
    </section>
  );
}
