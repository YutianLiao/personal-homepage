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
  instruction: string;
  isNewTopic: boolean;
}

export function generateEntrySnippet(params: {
  domainLabel: string;
  topicLabel: string;
  isNewTopic: boolean;
  entry: KnowledgeEntry;
}): GeneratedSnippet {
  const entryObj: Record<string, string> = { title: params.entry.title };
  if (params.entry.learnedAt) entryObj.learnedAt = params.entry.learnedAt;
  if (params.entry.note) entryObj.note = params.entry.note;

  if (params.isNewTopic) {
    const topic = {
      id: slugify(params.topicLabel),
      label: params.topicLabel,
      entries: [entryObj]
    };
    return {
      json: JSON.stringify(topic, null, 2),
      instruction: `在 knowledge-map.json 中找到 "${params.domainLabel}" 领域的 topics 数组，在末尾添加此 topic 对象（注意前一元素末尾加逗号）。`,
      isNewTopic: true
    };
  }

  return {
    json: JSON.stringify(entryObj, null, 2),
    instruction: `在 knowledge-map.json 中找到 "${params.domainLabel}" → "${params.topicLabel}" 的 entries 数组，在末尾添加此 entry 对象。`,
    isNewTopic: false
  };
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
