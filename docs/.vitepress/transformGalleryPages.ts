import type { PageData } from "vitepress";
import { isGalleryAsidePath } from "./gallery-sections";

function pagePathFromRelative(relativePath: string): string {
  let p = relativePath.replace(/\\/g, "/");
  if (p.endsWith("/index.md")) {
    p = p.slice(0, -"/index.md".length);
  } else if (p.endsWith(".md")) {
    p = p.slice(0, -".md".length);
  }
  return p.startsWith("/") ? p : `/${p}`;
}

export function applyGalleryAsidePageData(pageData: PageData) {
  const path = pagePathFromRelative(pageData.relativePath);
  const pageClass = String(pageData.frontmatter.pageClass ?? "");

  if (!isGalleryAsidePath(path, pageClass)) return;

  pageData.frontmatter.outline = false;

  const existing = pageClass.trim();
  pageData.frontmatter.pageClass = existing.includes("gallery-aside-page")
    ? existing
    : existing
      ? `${existing} gallery-aside-page`
      : "gallery-aside-page";
}
