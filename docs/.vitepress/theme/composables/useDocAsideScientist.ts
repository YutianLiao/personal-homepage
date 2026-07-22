import { computed, ref, watch } from "vue";
import { onContentUpdated, useData, useRoute } from "vitepress";
import { getHeaders } from "vitepress/dist/client/theme-default/composables/outline.js";
import registry from "../../doc-aside-scientists.json";
import { isGalleryAsidePath } from "../../gallery-sections";

export type DocAsideScientist = {
  id: string;
  name: string;
  image: string;
};

type ScientistEntry = { name: string; image: string };
type SectionEntry = { prefix: string; scientist: string };

const scientists = registry.scientists as Record<string, ScientistEntry>;
const sections = ([...registry.sections] as SectionEntry[]).sort(
  (a, b) => b.prefix.length - a.prefix.length
);

function normalizeDocPath(routePath: string, baseRaw: string): string {
  const base = baseRaw.replace(/\/$/, "");
  let p = routePath.replace(/\/$/, "") || "/";
  if (base && (p === base || p.startsWith(`${base}/`))) {
    p = p.slice(base.length) || "/";
  }
  if (p.endsWith("/index.html")) {
    p = p.replace(/\/index\.html$/, "") || "/";
  }
  return p.startsWith("/") ? p : `/${p}`;
}

function resolveSectionScientistId(path: string): string | null {
  for (const { prefix, scientist } of sections) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return scientist;
    }
  }
  return null;
}

function countOutlineHeaders(outline: unknown): number {
  if (typeof document === "undefined") return 0;
  try {
    return getHeaders(outline).length;
  } catch {
    return 0;
  }
}

export function useDocAsideScientist() {
  const route = useRoute();
  const { frontmatter, site, theme } = useData();
  const headerCount = ref(0);

  const refreshHeaders = () => {
    const outline = frontmatter.value.outline ?? theme.value.outline;
    headerCount.value = countOutlineHeaders(outline);
  };

  onContentUpdated(refreshHeaders);

  watch(() => route.path, refreshHeaders);

  const scientist = computed((): DocAsideScientist | null => {
    const layout = frontmatter.value.layout;
    if (layout === "home" || layout === "page") return null;
    const pageClass = String(frontmatter.value.pageClass ?? "");
    if (pageClass.includes("demo-page") || pageClass.includes("knowledge-planet-page")) {
      return null;
    }

    const path = normalizeDocPath(route.path, site.value.base);
    const isGalleryAside =
      pageClass.includes("gallery-aside-page") || isGalleryAsidePath(path, pageClass);

    if (frontmatter.value.outline === false && !isGalleryAside) return null;
    if (headerCount.value <= 0 && !isGalleryAside) return null;

    const id = resolveSectionScientistId(path);
    if (!id) return null;

    const entry = scientists[id];
    if (!entry) return null;

    return { id, name: entry.name, image: entry.image };
  });

  return { scientist };
}
