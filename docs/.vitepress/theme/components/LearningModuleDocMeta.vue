<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";
import manifests from "../../learning-manifests.json";
import modulesRegistry from "../../learning-modules.json";

type ManifestEntry = { title: string; link: string; part: string };

const { page } = useData();

const moduleId = computed(() => {
  const rel = page.value.relativePath.replace(/\\/g, "/");
  const id = rel.split("/")[0];
  return (modulesRegistry.modules as { id: string }[]).some((m) => m.id === id) ? id : null;
});

const moduleTitle = computed(() => {
  const id = moduleId.value;
  if (!id) return "";
  return (
    (modulesRegistry.modules as { id: string; title: string }[]).find((m) => m.id === id)?.title ??
    ""
  );
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

const partLabel = computed(() => {
  const id = moduleId.value;
  if (!id) return "";
  const manifest = (manifests as Record<string, ManifestEntry[]>)[id] ?? [];
  return manifest.find((entry) => entry.link === currentLink.value)?.part ?? "";
});

const readingTime = computed(
  () => (page.value as { readingTime?: string }).readingTime ?? ""
);

const isOverview = computed(() => {
  const rel = page.value.relativePath.replace(/\\/g, "/");
  const id = moduleId.value;
  return id ? rel === `${id}/index.md` : false;
});
</script>

<template>
  <p v-if="moduleTitle" class="learning-module-doc-meta">
    <span class="learning-module-doc-meta__module">{{ moduleTitle }}</span>
    <template v-if="!isOverview && partLabel">
      <span class="learning-module-doc-meta__sep" aria-hidden="true">·</span>
      <span class="learning-module-doc-meta__part">{{ partLabel }}</span>
    </template>
    <template v-if="readingTime">
      <span class="learning-module-doc-meta__sep" aria-hidden="true">·</span>
      <span class="learning-module-doc-meta__time">建议阅读 {{ readingTime }}</span>
    </template>
  </p>
</template>
