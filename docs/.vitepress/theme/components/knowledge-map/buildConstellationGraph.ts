import type { ForceGraphData, GraphLink, MapNode } from "./graphModel";
import { mergePreview } from "./graphModel";
import type { KnowledgeMapData, PreviewEntry } from "./types";

export type { MapNode, ForceGraphData, GraphLink } from "./graphModel";
export { mergeHighlightLinkIds, pathLinksToRoot } from "./graphModel";

export const DOMAIN_STAR_COLORS: Record<string, { main: string; glow: string }> = {
  ai: { main: "#6ee7b7", glow: "#34d399" },
  math: { main: "#c4b5fd", glow: "#a78bfa" },
  economics: { main: "#7dd3fc", glow: "#38bdf8" }
};

const GALAXY_CENTER: Record<string, { x: number; y: number; z: number }> = {
  ai: { x: -160, y: 20, z: -50 },
  math: { x: 150, y: -10, z: 60 },
  economics: { x: 0, y: 90, z: -130 }
};

const ORBIT_RADIUS = { topic: 72, entry: 34, bare: 48 } as const;
const ORBIT_SPEED = { topic: 0.00035, entry: 0.00055, bare: 0.0002 } as const;

const NODE_VAL = { domain: 16, topic: 9, entry: 5 } as const;

export function orbitPosition(
  center: { x: number; y: number; z: number },
  radius: number,
  angle: number
): { x: number; y: number; z: number } {
  return {
    x: center.x + Math.cos(angle) * radius,
    z: center.z + Math.sin(angle) * radius,
    y: center.y + Math.sin(angle * 0.7) * radius * 0.15
  };
}

function spreadAngles(count: number, baseAngle: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [baseAngle];
  return Array.from({ length: count }, (_, i) => baseAngle + ((i / count) * Math.PI * 2));
}

export function buildConstellationGraph(
  data: KnowledgeMapData,
  preview?: PreviewEntry | null
): ForceGraphData {
  const merged = mergePreview(data, preview);
  const nodes: MapNode[] = [];
  const links: GraphLink[] = [];

  merged.domains.forEach((domain, domainIndex) => {
    const center = GALAXY_CENTER[domain.id] ?? { x: 0, y: 0, z: 0 };
    const domainNodeId = `domain:${domain.id}`;
    const baseAngle = (domainIndex / merged.domains.length) * Math.PI * 2;

    nodes.push({
      id: domainNodeId,
      kind: "domain",
      label: domain.label,
      domainId: domain.id,
      ...center,
      fx: center.x,
      fy: center.y,
      fz: center.z
    });

    if (domain.topics.length === 0) {
      const angle = baseAngle;
      const pos = orbitPosition(center, ORBIT_RADIUS.bare, angle);
      const bareId = `bare:${domain.id}`;
      nodes.push({
        id: bareId,
        kind: "topic",
        label: `${domain.label} · 待点亮`,
        parentId: domainNodeId,
        domainId: domain.id,
        ...pos,
        orbitCenterId: domainNodeId,
        orbitRadius: ORBIT_RADIUS.bare,
        orbitAngle: angle,
        orbitSpeed: ORBIT_SPEED.bare,
        isBare: true
      });
      links.push({
        id: `${bareId}->${domainNodeId}`,
        source: bareId,
        target: domainNodeId,
        domainId: domain.id
      });
      return;
    }

    const topicAngles = spreadAngles(domain.topics.length, baseAngle);

    domain.topics.forEach((topic, topicIndex) => {
      const topicAngle = topicAngles[topicIndex] ?? baseAngle;
      const topicPos = orbitPosition(center, ORBIT_RADIUS.topic, topicAngle);
      const topicNodeId = `topic:${domain.id}:${topic.id}`;

      nodes.push({
        id: topicNodeId,
        kind: "topic",
        label: topic.label,
        parentId: domainNodeId,
        domainId: domain.id,
        topicId: topic.id,
        ...topicPos,
        orbitCenterId: domainNodeId,
        orbitRadius: ORBIT_RADIUS.topic,
        orbitAngle: topicAngle,
        orbitSpeed: ORBIT_SPEED.topic
      });
      links.push({
        id: `${topicNodeId}->${domainNodeId}`,
        source: topicNodeId,
        target: domainNodeId,
        domainId: domain.id
      });

      const entryAngles = spreadAngles(topic.entries.length, topicAngle + 0.4);

      topic.entries.forEach((entry, entryIndex) => {
        const entryAngle = entryAngles[entryIndex] ?? topicAngle;
        const entryPos = orbitPosition(topicPos, ORBIT_RADIUS.entry, entryAngle);

        const isPreview =
          preview &&
          preview.domainId === domain.id &&
          preview.topicId === topic.id &&
          preview.entry.id === entry.id;

        const entryNodeId = `entry:${domain.id}:${topic.id}:${entry.id}`;
        nodes.push({
          id: entryNodeId,
          kind: "entry",
          label: entry.title,
          parentId: topicNodeId,
          domainId: domain.id,
          topicId: topic.id,
          entryId: entry.id,
          entry,
          isPreview: Boolean(isPreview),
          ...entryPos,
          orbitCenterId: topicNodeId,
          orbitRadius: ORBIT_RADIUS.entry,
          orbitAngle: entryAngle,
          orbitSpeed: ORBIT_SPEED.entry + entryIndex * 0.00004
        });
        links.push({
          id: `${entryNodeId}->${topicNodeId}`,
          source: entryNodeId,
          target: topicNodeId,
          domainId: domain.id
        });
      });
    });
  });

  return { nodes, links };
}

/** 根据轨道参数更新节点位置（entry 绕 topic 局部中心） */
export function applyOrbitPositions(nodes: MapNode[], byId: Map<string, MapNode>): void {
  for (const node of nodes) {
    if (node.kind === "domain") continue;
    if (!node.orbitCenterId || node.orbitRadius == null || node.orbitAngle == null) continue;

    const centerNode = byId.get(node.orbitCenterId);
    if (!centerNode || centerNode.x == null) continue;

    const cx = centerNode.x;
    const cy = centerNode.y ?? 0;
    const cz = centerNode.z ?? 0;

    const pos = orbitPosition({ x: cx, y: cy, z: cz }, node.orbitRadius, node.orbitAngle);
    node.x = pos.x;
    node.y = pos.y;
    node.z = pos.z;
    node.fx = pos.x;
    node.fy = pos.y;
    node.fz = pos.z;
  }
}

export function nodeVal(kind: MapNode["kind"]): number {
  return NODE_VAL[kind];
}

export function starColor(domainId: string): string {
  return DOMAIN_STAR_COLORS[domainId]?.main ?? "#94a3b8";
}

export function starGlow(domainId: string): string {
  return DOMAIN_STAR_COLORS[domainId]?.glow ?? "#64748b";
}
