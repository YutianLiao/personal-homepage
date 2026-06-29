<script setup lang="ts">
import { computed } from "vue";
import { useData, withBase } from "vitepress";
import manifests from "../../learning-manifests.json";
import modulesRegistry from "../../learning-modules.json";

type ManifestEntry = { title: string; link: string; part: string };

const { page } = useData();

const moduleId = computed(() => {
  const rel = page.value.relativePath.replace(/\\/g, "/");
  const id = rel.split("/")[0];
  return (modulesRegistry.modules as { id: string }[]).some((m) => m.id === id) ? id : null;
});

const manifest = computed(() => {
  const id = moduleId.value;
  if (!id) return [];
  return (manifests as Record<string, ManifestEntry[]>)[id] ?? [];
});

const currentLink = computed(() => {
  const rel = page.value.relativePath.replace(/\\/g, "/").replace(/\.md$/, "");
  const id = moduleId.value;
  if (!id) return "";
  if (rel === `${id}/index`) {
    const mod = (modulesRegistry.modules as { id: string; route: string }[]).find((m) => m.id === id);
    return mod?.route ?? `/${id}/`;
  }
  return `/${rel}`;
});

const currentIndex = computed(() => manifest.value.findIndex((entry) => entry.link === currentLink.value));

const prev = computed(() => {
  const i = currentIndex.value;
  return i > 0 ? manifest.value[i - 1] : null;
});

const next = computed(() => {
  const i = currentIndex.value;
  return i >= 0 && i < manifest.value.length - 1 ? manifest.value[i + 1] : null;
});

function href(link: string) {
  return withBase(link);
}
</script>

<template>
  <nav v-if="prev || next" class="learning-module-pager" aria-label="章节导航">
    <a
      v-if="prev"
      class="learning-module-pager__link learning-module-pager__link--prev"
      :href="href(prev.link)"
    >
      <span class="learning-module-pager__label">← Prev</span>
      <span class="learning-module-pager__title">{{ prev.title }}</span>
    </a>
    <span v-else class="learning-module-pager__spacer" />
    <a
      v-if="next"
      class="learning-module-pager__link learning-module-pager__link--next"
      :href="href(next.link)"
    >
      <span class="learning-module-pager__label">Next →</span>
      <span class="learning-module-pager__title">{{ next.title }}</span>
    </a>
  </nav>
</template>
