import fs from "node:fs";
import path from "node:path";
import type { PageData, Theme } from "vitepress";
import { estimateReadingMinutes, formatReadingTime } from "./theme/utils/readingTime";

function readMarkdownBody(relativePath: string, srcDir: string): string {
  const filePath = path.join(srcDir, relativePath);
  const raw = fs.readFileSync(filePath, "utf8");
  const stripped = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  return stripped;
}

export async function transformHelloAgentPageData(
  pageData: PageData,
  ctx: { siteConfig: Theme.SiteConfig }
) {
  const rel = pageData.relativePath.replace(/\\/g, "/");
  if (!rel.startsWith("hello-agent/") || rel === "hello-agent/index.md" || !rel.endsWith(".md")) {
    return;
  }

  if (!pageData.frontmatter.layout) {
    pageData.frontmatter.layout = "hello-agent-doc";
  }
  pageData.frontmatter.prev = false;
  pageData.frontmatter.next = false;

  const pageClass = pageData.frontmatter.pageClass;
  pageData.frontmatter.pageClass = pageClass
    ? `${pageClass} hello-agent-page`
    : "hello-agent-page";

  const lang = (pageData.frontmatter.lang as string | undefined) ?? ctx.siteConfig.lang ?? "zh-CN";
  const srcDir = ctx.siteConfig.srcDir ?? path.join(process.cwd(), "docs");
  const body = readMarkdownBody(rel, srcDir);
  const minutes = estimateReadingMinutes(body);
  pageData.readingTimeMinutes = minutes;
  pageData.readingTime = formatReadingTime(minutes, lang);
}
