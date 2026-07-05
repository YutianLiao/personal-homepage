/** 信件注册表：构建时收集 knowledge-letters 下所有 .md 文件 */
const letterModules = import.meta.glob<string>("../../../knowledge-letters/**/*.md", {
  query: "?raw",
  import: "default"
});

const letterPathByKey = new Map<string, string>();

for (const path of Object.keys(letterModules)) {
  const normalized = path
    .replace(/^\.\.\/\.\.\/\.\.\/knowledge-letters\//, "")
    .replace(/\.md$/, "");
  letterPathByKey.set(normalized, path);
}

export function defaultLetterKey(domainId: string, topicId: string, entryId: string): string {
  return `${domainId}/${topicId}/${entryId}`;
}

export function resolveLetterKey(
  domainId: string,
  topicId: string,
  entry: { id: string; letterFile?: string }
): string {
  if (entry.letterFile) {
    return entry.letterFile.replace(/^\//, "").replace(/\.md$/, "");
  }
  return defaultLetterKey(domainId, topicId, entry.id);
}

export async function loadLetterMarkdown(key: string): Promise<string | null> {
  const modulePath = letterPathByKey.get(key);
  if (!modulePath) return null;
  const loader = letterModules[modulePath];
  if (!loader) return null;
  return loader();
}

export function hasLetter(key: string): boolean {
  return letterPathByKey.has(key);
}

export function listLetterKeys(): string[] {
  return [...letterPathByKey.keys()];
}
