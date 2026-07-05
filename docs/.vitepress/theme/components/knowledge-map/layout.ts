import type {
  GraphEdge,
  GraphNode,
  KnowledgeDomain,
  KnowledgeMapData,
  PreviewEntry
} from "./types";

export const VIEW_W = 920;
export const VIEW_H = 520;

const HUB_POSITIONS: Record<string, { x: number; y: number }> = {
  ai: { x: 160, y: 280 },
  math: { x: 460, y: 280 },
  economics: { x: 760, y: 280 }
};

/** Arc direction per domain so branches don't overlap between hubs */
const DOMAIN_ARC: Record<string, { start: number; end: number }> = {
  ai: { start: -110, end: -40 },
  math: { start: -35, end: 35 },
  economics: { start: 40, end: 110 }
};

const TOPIC_RADIUS = 95;
const ENTRY_BASE_RADIUS = 155;
const ENTRY_STEP = 28;

function polar(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad)
  };
}

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
      return {
        ...topic,
        entries: [...topic.entries, preview.entry]
      };
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

export function computeGraph(
  data: KnowledgeMapData,
  preview?: PreviewEntry | null
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const merged = mergePreview(data, preview);
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const domain of merged.domains) {
    const hub = HUB_POSITIONS[domain.id] ?? { x: VIEW_W / 2, y: VIEW_H / 2 };
    const hubId = `domain:${domain.id}`;

    nodes.push({
      id: hubId,
      kind: "domain",
      label: domain.label,
      domainId: domain.id,
      x: hub.x,
      y: hub.y,
      domain
    });

    const topicCount = domain.topics.length;
    const arc = DOMAIN_ARC[domain.id] ?? { start: -60, end: 60 };

    domain.topics.forEach((topic, topicIndex) => {
      const angle =
        topicCount === 1
          ? (arc.start + arc.end) / 2
          : arc.start + (topicIndex / (topicCount - 1)) * (arc.end - arc.start);

      const topicPos = polar(hub.x, hub.y, TOPIC_RADIUS, angle);
      const topicId = `topic:${domain.id}:${topic.id}`;

      nodes.push({
        id: topicId,
        kind: "topic",
        label: topic.label,
        domainId: domain.id,
        topicId: topic.id,
        x: topicPos.x,
        y: topicPos.y,
        topic
      });

      edges.push({
        id: `edge:${hubId}:${topicId}`,
        x1: hub.x,
        y1: hub.y,
        x2: topicPos.x,
        y2: topicPos.y,
        domainId: domain.id,
        topicId: topic.id
      });

      topic.entries.forEach((entry, entryIndex) => {
        const entryRadius = ENTRY_BASE_RADIUS + entryIndex * ENTRY_STEP;
        const entryPos = polar(hub.x, hub.y, entryRadius, angle);
        const entryNodeId = `entry:${domain.id}:${topic.id}:${entryIndex}`;

        const isPreview =
          preview &&
          preview.domainId === domain.id &&
          preview.topicId === topic.id &&
          preview.entry.title === entry.title &&
          entryIndex === topic.entries.length - 1;

        nodes.push({
          id: entryNodeId,
          kind: "entry",
          label: entry.title,
          domainId: domain.id,
          topicId: topic.id,
          x: entryPos.x,
          y: entryPos.y,
          entry,
          isPreview: Boolean(isPreview)
        });

        edges.push({
          id: `edge:${topicId}:${entryNodeId}`,
          x1: topicPos.x,
          y1: topicPos.y,
          x2: entryPos.x,
          y2: entryPos.y,
          domainId: domain.id,
          topicId: topic.id
        });
      });
    });
  }

  return { nodes, edges };
}

export function domainStats(domain: KnowledgeDomain) {
  const topicCount = domain.topics.length;
  const entryCount = domain.topics.reduce((sum, t) => sum + t.entries.length, 0);
  return { topicCount, entryCount };
}

export function hubRadius(domain: KnowledgeDomain): number {
  const { topicCount, entryCount } = domainStats(domain);
  return 28 + Math.min(topicCount * 2 + entryCount, 12);
}
