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

const moduleMeta = computed(() => {
  const id = moduleId.value;
  if (!id) return null;
  return (modulesRegistry.modules as { id: string; title: string; route: string }[]).find(
    (m) => m.id === id
  );
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
  if (rel === `${id}/index`) return moduleMeta.value?.route ?? `/${id}/`;
  return `/${rel}`;
});

const isOverview = computed(() => currentLink.value === moduleMeta.value?.route);

const partGroups = computed(() => {
  const groups = new Map<string, ManifestEntry[]>();
  for (const entry of manifest.value) {
    const list = groups.get(entry.part) ?? [];
    list.push(entry);
    groups.set(entry.part, list);
  }
  return [...groups.entries()];
});

function href(link: string) {
  return withBase(link);
}

function isActive(link: string) {
  return link === currentLink.value;
}
</script>

<template>
  <nav
    v-if="moduleMeta && manifest.length"
    class="learning-module-chapter-nav"
    :aria-label="`${moduleMeta.title} 章节导航`"
  >
    <div class="learning-module-chapter-nav__track">
      <a
        class="learning-module-chapter-nav__link"
        :class="{ 'learning-module-chapter-nav__link--active': isOverview }"
        :href="href(moduleMeta.route)"
        :aria-current="isOverview ? 'page' : undefined"
      >
        Overview
      </a>

      <template v-for="([part, entries], groupIndex) in partGroups" :key="part">
        <span class="learning-module-chapter-nav__sep" aria-hidden="true">/</span>
        <span v-if="partGroups.length > 1" class="learning-module-chapter-nav__part">{{ part }}</span>
        <template v-for="(entry, entryIndex) in entries" :key="entry.link">
          <span
            v-if="entryIndex > 0"
            class="learning-module-chapter-nav__dot"
            aria-hidden="true"
          >·</span>
          <a
            class="learning-module-chapter-nav__link"
            :class="{ 'learning-module-chapter-nav__link--active': isActive(entry.link) }"
            :href="href(entry.link)"
            :aria-current="isActive(entry.link) ? 'page' : undefined"
          >
            {{ entry.title }}
          </a>
        </template>
        <span
          v-if="groupIndex < partGroups.length - 1"
          class="learning-module-chapter-nav__sep learning-module-chapter-nav__sep--group"
          aria-hidden="true"
        />
      </template>
    </div>
  </nav>
</template>
