import type { AwsStyleModel } from "./aws-style";

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PositionedEdge {
  id: string;
  source: string;
  target: string;
}

export interface LayoutModel {
  width: number;
  height: number;
  nodes: PositionedNode[];
  edges: PositionedEdge[];
}

export function layoutAwsArchitecture(model: AwsStyleModel): LayoutModel {
  const columns = Math.max(1, Math.ceil(Math.sqrt(model.nodes.length)));
  const nodeWidth = 220;
  const nodeHeight = 104;
  const gapX = 72;
  const gapY = 72;

  const nodes = model.nodes.map((node, index) => ({
    id: node.id,
    x: (index % columns) * (nodeWidth + gapX) + 32,
    y: Math.floor(index / columns) * (nodeHeight + gapY) + 32,
    width: nodeWidth,
    height: nodeHeight,
  }));

  return {
    width: Math.max(800, columns * (nodeWidth + gapX) + 32),
    height: Math.max(260, Math.ceil(model.nodes.length / columns) * (nodeHeight + gapY) + 32),
    nodes,
    edges: model.edges.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target })),
  };
}
