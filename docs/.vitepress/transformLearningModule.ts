import fs from "node:fs";
import path from "node:path";
import type { PageData, Theme } from "vitepress";
import modulesRegistry from "./learning-modules.json";
import { estimateReadingMinutes, formatReadingTime } from "./theme/utils/readingTime";

const MODULE_IDS = new Set(
  (modulesRegistry.modules as { id: string }[]).map((module) => module.id)
);

function readMarkdownBody(relativePath: string, srcDir: string): string {
  const filePath = path.join(srcDir, relativePath);
  const raw = fs.readFileSync(filePath, "utf8");
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

function moduleIdFromPath(rel: string): string | null {
  const id = rel.split("/")[0];
  return MODULE_IDS.has(id) ? id : null;
}

export async function transformLearningModulePageData(
  pageData: PageData,
  ctx: { siteConfig: Theme.SiteConfig }
) {
  const rel = pageData.relativePath.replace(/\\/g, "/");
  const moduleId = moduleIdFromPath(rel);
  if (!moduleId || !rel.endsWith(".md")) {
    return;
  }

  pageData.frontmatter.sidebar = false;

  if (rel === `${moduleId}/index.md`) {
    if (!pageData.frontmatter.layout) {
      pageData.frontmatter.layout = "learning-module-doc";
    }
    const pageClass = pageData.frontmatter.pageClass;
    pageData.frontmatter.pageClass = pageClass
      ? `${pageClass} learning-module-page`
      : "learning-module-page";
    return;
  }

  if (!pageData.frontmatter.layout) {
    pageData.frontmatter.layout = "learning-module-doc";
  }
  pageData.frontmatter.prev = false;
  pageData.frontmatter.next = false;

  const pageClass = pageData.frontmatter.pageClass;
  pageData.frontmatter.pageClass = pageClass
    ? `${pageClass} learning-module-page`
    : "learning-module-page";

  const lang = (pageData.frontmatter.lang as string | undefined) ?? ctx.siteConfig.lang ?? "zh-CN";
  const srcDir = ctx.siteConfig.srcDir ?? path.join(process.cwd(), "docs");
  const body = readMarkdownBody(rel, srcDir);
  const minutes = estimateReadingMinutes(body);
  pageData.readingTimeMinutes = minutes;
  pageData.readingTime = formatReadingTime(minutes, lang);
}
