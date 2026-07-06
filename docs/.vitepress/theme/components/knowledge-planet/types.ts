export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface KnowledgePoint {
  id: string;
  title: string;
  familiarity: number;
  color: string;
  position: Position3D;
  url?: string;
}

export interface KnowledgeSubtopic {
  id: string;
  title: string;
  points: KnowledgePoint[];
}

export interface KnowledgeTopic {
  id: string;
  title: string;
  subtopics: KnowledgeSubtopic[];
}

export interface KnowledgePlanetData {
  version: number;
  topics: KnowledgeTopic[];
}

export interface FlatKnowledgePoint extends KnowledgePoint {
  l1Id: string;
  l1Title: string;
  l2Id: string;
  l2Title: string;
}
