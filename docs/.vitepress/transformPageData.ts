import type { PageData, Theme } from "vitepress";
import { transformLearningModulePageData } from "./transformLearningModule";
import { applyGalleryAsidePageData } from "./transformGalleryPages";

export async function transformPageData(
  pageData: PageData,
  ctx: { siteConfig: Theme.SiteConfig }
) {
  await transformLearningModulePageData(pageData, ctx);
  applyGalleryAsidePageData(pageData);
}
