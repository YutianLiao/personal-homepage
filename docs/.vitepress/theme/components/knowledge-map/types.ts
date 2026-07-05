/** 知识点信件：独立 Markdown 文件，便于长篇内容与链接维护 */
export interface KnowledgeEntry {
  /** 稳定 slug，对应 knowledge-letters/{domain}/{topic}/{id}.md */
  id: string;
  title: string;
  learnedAt?: string;
  /** 悬停节点时的短备注 */
  note?: string;
  /**
   * 可选：覆盖默认信件路径。
   * 默认 knowledge-letters/{domainId}/{topicId}/{id}.md
   */
  letterFile?: string;
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

export interface PreviewEntry {
  domainId: string;
  topicId: string;
  topicLabel: string;
  isNewTopic: boolean;
  entry: KnowledgeEntry;
}
