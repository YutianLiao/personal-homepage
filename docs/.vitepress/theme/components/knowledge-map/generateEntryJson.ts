import type { KnowledgeEntry } from "./types";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface GeneratedSnippet {
  json: string;
  letterTemplate: string;
  letterPath: string;
  instruction: string;
  isNewTopic: boolean;
}

function buildEntryObject(entry: KnowledgeEntry): Record<string, unknown> {
  const entryObj: Record<string, unknown> = {
    id: entry.id,
    title: entry.title
  };
  if (entry.learnedAt) entryObj.learnedAt = entry.learnedAt;
  if (entry.note) entryObj.note = entry.note;
  if (entry.letterFile) entryObj.letterFile = entry.letterFile;
  return entryObj;
}

export function letterTemplate(title: string): string {
  return `亲爱的未来的我：

关于 **${title}**，我整理了这些链接：

## 阅读

- [标题](https://example.com) — 简短说明

愿复习时依然清晰。

—— 知识图谱
`;
}

export function generateEntrySnippet(params: {
  domainId: string;
  topicId: string;
  domainLabel: string;
  topicLabel: string;
  isNewTopic: boolean;
  entry: KnowledgeEntry;
}): GeneratedSnippet {
  const entryObj = buildEntryObject(params.entry);
  const letterPath = `docs/.vitepress/knowledge-letters/${params.domainId}/${params.topicId}/${params.entry.id}.md`;

  if (params.isNewTopic) {
    const topic = {
      id: params.topicId,
      label: params.topicLabel,
      entries: [entryObj]
    };
    return {
      json: JSON.stringify(topic, null, 2),
      letterTemplate: letterTemplate(params.entry.title),
      letterPath,
      instruction: `1. 在 knowledge-map.json 的 "${params.domainLabel}" → topics 末尾添加此 topic。\n2. 新建信件文件 ${letterPath}，粘贴下方 Markdown。`,
      isNewTopic: true
    };
  }

  return {
    json: JSON.stringify(entryObj, null, 2),
    letterTemplate: letterTemplate(params.entry.title),
    letterPath,
    instruction: `1. 在 knowledge-map.json 的 "${params.domainLabel}" → "${params.topicLabel}" → entries 末尾添加此 entry。\n2. 新建信件文件 ${letterPath}，粘贴下方 Markdown。`,
    isNewTopic: false
  };
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
