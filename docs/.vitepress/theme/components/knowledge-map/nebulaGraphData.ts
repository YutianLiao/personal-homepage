import type { KnowledgeMapData, KnowledgeEntry, PreviewEntry } from "./types";

export type NebulaNodeKind = "domain" | "topic" | "entry";

export interface NebulaNode {
  id: string;
  kind: NebulaNodeKind;
  label: string;
  domainId: string;
  topicId?: string;
  group: string;
  val: number;
  color: string;
  glow: string;
  fx?: number;
  fy?: number;
  fz?: number;
  entry?: KnowledgeEntry;
  isPreview?: boolean;
}

export interface NebulaLink {
  source: string;
  target: string;
  domainId: string;
}

export interface NebulaGraphData {
  nodes: NebulaNode[];
  links: NebulaLink[];
}

export const DOMAIN_PALETTE: Record<string, { color: string; glow: string }> = {
  ai: { color: "#e11d48", glow: "#fda4af" },
  math: { color: "#3b82f6", glow: "#93c5fd" },
  economics: { color: "#f59e0b", glow: "#fcd34d" }
};

/** Equilateral triangle anchors in 3D space */
const DOMAIN_ANCHORS: Record<string, { x: number; y: number; z: number }> = {
  ai: { x: 0, y: 60, z: 0 },
  math: { x: -90, y: -45, z: 30 },
  economics: { x: 90, y: -45, z: -30 }
};

function mergePreview(data: KnowledgeMapData, preview?: PreviewEntry | null): KnowledgeMapData {
  if (!preview) return data;

  const domains = data.domains.map((domain) => {
    if (domain.id !== preview.domainId) return domain;

    if (preview.isNewTopic) {
      return {
        ...domain,
        topics: [
          ...domain.topics,
          {
            id: preview.topicId,
            label: preview.topicLabel,
            entries: [preview.entry]
          }
        ]
      };
    }

    const topics = domain.topics.map((topic) => {
      if (topic.id !== preview.topicId) return topic;
      return { ...topic, entries: [...topic.entries, preview.entry] };
    });

    if (!topics.some((t) => t.id === preview.topicId)) {
      topics.push({
        id: preview.topicId,
        label: preview.topicLabel,
        entries: [preview.entry]
      });
    }

    return { ...domain, topics };
  });

  return { domains };
}

export function buildNebulaGraphData(
  data: KnowledgeMapData,
  preview?: PreviewEntry | null
): NebulaGraphData {
  const merged = mergePreview(data, preview);
  const nodes: NebulaNode[] = [];
  const links: NebulaLink[] = [];

  for (const domain of merged.domains) {
    const palette = DOMAIN_PALETTE[domain.id] ?? { color: "#a8a29e", glow: "#d6d3cd" };
    const anchor = DOMAIN_ANCHORS[domain.id] ?? { x: 0, y: 0, z: 0 };
    const domainNodeId = `domain:${domain.id}`;

    nodes.push({
      id: domainNodeId,
      kind: "domain",
      label: domain.label,
      domainId: domain.id,
      group: domain.id,
      val: 14,
      color: palette.color,
      glow: palette.glow,
      fx: anchor.x,
      fy: anchor.y,
      fz: anchor.z
    });

    domain.topics.forEach((topic, topicIndex) => {
      const topicNodeId = `topic:${domain.id}:${topic.id}`;
      const angle = (topicIndex / Math.max(domain.topics.length, 1)) * Math.PI * 2;

      nodes.push({
        id: topicNodeId,
        kind: "topic",
        label: topic.label,
        domainId: domain.id,
        topicId: topic.id,
        group: domain.id,
        val: 6,
        color: palette.glow,
        glow: palette.color,
        fx: anchor.x + Math.cos(angle) * 35,
        fy: anchor.y + Math.sin(angle) * 25,
        fz: anchor.z + Math.sin(angle) * 20
      });

      links.push({ source: domainNodeId, target: topicNodeId, domainId: domain.id });

      topic.entries.forEach((entry, entryIndex) => {
        const entryNodeId = `entry:${domain.id}:${topic.id}:${entryIndex}`;
        const isPreview =
          preview &&
          preview.domainId === domain.id &&
          preview.topicId === topic.id &&
          preview.entry.title === entry.title &&
          entryIndex === topic.entries.length - 1;

        const orbit = angle + (entryIndex + 1) * 0.45;
        const radius = 55 + entryIndex * 12;

        nodes.push({
          id: entryNodeId,
          kind: "entry",
          label: entry.title,
          domainId: domain.id,
          topicId: topic.id,
          group: domain.id,
          val: isPreview ? 3.5 : 2.5,
          color: isPreview ? "#ffffff" : palette.glow,
          glow: palette.color,
          fx: anchor.x + Math.cos(orbit) * radius,
          fy: anchor.y + Math.sin(orbit) * (radius * 0.7),
          fz: anchor.z + Math.cos(orbit + 0.5) * (radius * 0.4),
          entry,
          isPreview: Boolean(isPreview)
        });

        links.push({ source: topicNodeId, target: entryNodeId, domainId: domain.id });
      });
    });
  }

  return { nodes, links };
}
