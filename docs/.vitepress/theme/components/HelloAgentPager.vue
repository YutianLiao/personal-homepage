<script setup lang="ts">
import { computed } from "vue";
import { useData, withBase } from "vitepress";
import manifest from "../../hello-agent-manifest.json";

type ManifestEntry = { title: string; link: string; part: string };

const { page } = useData();

const currentLink = computed(() => {
  const rel = page.value.relativePath.replace(/\\/g, "/").replace(/\.md$/, "");
  if (rel === "hello-agent/index") return "/hello-agent/";
  return `/${rel}`;
});

const currentIndex = computed(() =>
  (manifest as ManifestEntry[]).findIndex((entry) => entry.link === currentLink.value)
);

const prev = computed(() => {
  const i = currentIndex.value;
  return i > 0 ? (manifest as ManifestEntry[])[i - 1] : null;
});

const next = computed(() => {
  const i = currentIndex.value;
  const list = manifest as ManifestEntry[];
  return i >= 0 && i < list.length - 1 ? list[i + 1] : null;
});

function href(link: string) {
  return withBase(link);
}
</script>

<template>
  <nav v-if="prev || next" class="hello-agent-pager" aria-label="章节导航">
    <a v-if="prev" class="hello-agent-pager__link hello-agent-pager__link--prev" :href="href(prev.link)">
      <span class="hello-agent-pager__label">← Prev</span>
      <span class="hello-agent-pager__title">{{ prev.title }}</span>
    </a>
    <span v-else class="hello-agent-pager__spacer" />
    <a v-if="next" class="hello-agent-pager__link hello-agent-pager__link--next" :href="href(next.link)">
      <span class="hello-agent-pager__label">Next →</span>
      <span class="hello-agent-pager__title">{{ next.title }}</span>
    </a>
  </nav>
</template>
