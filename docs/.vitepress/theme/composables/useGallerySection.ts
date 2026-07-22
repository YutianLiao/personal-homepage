import { computed } from "vue";
import { useRoute, useData } from "vitepress";
import {
  gallerySections,
  type GallerySection,
  getGallerySection,
  getGallerySectionForPath,
  isGalleryAsidePath
} from "../../gallery-sections";

function normalizePath(path: string, base: string): string {
  const b = base.replace(/\/$/, "");
  let p = path.replace(/\/$/, "") || "/";
  if (b && (p === b || p.startsWith(`${b}/`))) {
    p = p.slice(b.length) || "/";
  }
  if (p.endsWith("/index.html")) {
    p = p.replace(/\/index\.html$/, "") || "/";
  }
  return p.startsWith("/") ? p : `/${p}`;
}

export function useGallerySection() {
  const route = useRoute();
  const { site, frontmatter } = useData();

  const normalizedPath = computed(() =>
    normalizePath(route.path, site.value.base)
  );

  const section = computed(() => getGallerySectionForPath(normalizedPath.value));

  const showGalleryAside = computed(() =>
    isGalleryAsidePath(normalizedPath.value, frontmatter.value.pageClass as string | undefined)
  );

  return { normalizedPath, section, showGalleryAside, getGallerySection };
}

export { getGallerySection, gallerySections, getGallerySectionForPath, isGalleryAsidePath };
