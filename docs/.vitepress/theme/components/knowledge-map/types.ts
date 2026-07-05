export interface KnowledgeEntry {
  title: string;
  learnedAt?: string;
  note?: string;
}

export interface KnowledgeTopic {
  id: string;
  label: string;
  entries: KnowledgeEntry[];
}

export interface KnowledgeDomain {
  id: string;
  label: string;
  topics: KnowledgeTopic[];
}

export interface KnowledgeMapData {
  domains: KnowledgeDomain[];
}

export type NodeKind = "domain" | "topic" | "entry";

export interface GraphNode {
  id: string;
  kind: NodeKind;
  label: string;
  domainId: string;
  topicId?: string;
  x: number;
  y: number;
  entry?: KnowledgeEntry;
  topic?: KnowledgeTopic;
  domain?: KnowledgeDomain;
  isPreview?: boolean;
}

export interface GraphEdge {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  domainId: string;
  topicId?: string;
}

export interface PreviewEntry {
  domainId: string;
  topicId: string;
  topicLabel: string;
  isNewTopic: boolean;
  entry: KnowledgeEntry;
}

export interface SelectionState {
  domainId: string | null;
  topicId: string | null;
  nodeId: string | null;
}
