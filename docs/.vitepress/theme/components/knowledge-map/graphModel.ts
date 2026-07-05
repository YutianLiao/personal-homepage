import type { KnowledgeMapData, PreviewEntry } from "./types";

export type MapNodeKind = "domain" | "topic" | "entry";

export interface MapNode {
  id: string;
  kind: MapNodeKind;
  label: string;
  parentId?: string;
  domainId: string;
  topicId?: string;
  entryId?: string;
  x?: number;
  y?: number;
  z?: number;
  fx?: number;
  fy?: number;
  fz?: number;
  /** 轨道中心节点 id（domain 为核心，无轨道） */
  orbitCenterId?: string;
  orbitRadius?: number;
  orbitAngle?: number;
  orbitSpeed?: number;
  entry?: import("./types").KnowledgeEntry;
  isPreview?: boolean;
  isBare?: boolean;
}

export interface GraphLink {
  id: string;
  source: string;
  target: string;
  domainId: string;
}

export interface ForceGraphData {
  nodes: MapNode[];
  links: GraphLink[];
}

export function mergePreview(
  data: KnowledgeMapData,
  preview?: PreviewEntry | null
): KnowledgeMapData {
  if (!preview) return data;

  const domains = data.domains.map((domain) => {
    if (domain.id !== preview.domainId) return domain;

    if (preview.isNewTopic) {
      return {
        ...domain,
        topics: [
          ...domain.topics,
          { id: preview.topicId, label: preview.topicLabel, entries: [preview.entry] }
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

export function pathLinksToRoot(nodeId: string, nodes: MapNode[]): GraphLink[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const links: GraphLink[] = [];
  let current = byId.get(nodeId);

  while (current?.parentId) {
    const parent = byId.get(current.parentId);
    if (!parent) break;
    links.push({
      id: `${current.id}->${parent.id}`,
      source: current.id,
      target: parent.id,
      domainId: current.domainId
    });
    current = parent;
  }

  return links;
}

export function mergeHighlightLinkIds(
  selectedIds: Iterable<string>,
  nodes: MapNode[]
): Set<string> {
  const seen = new Set<string>();
  for (const id of selectedIds) {
    for (const link of pathLinksToRoot(id, nodes)) {
      seen.add(link.id);
    }
  }
  return seen;
}
