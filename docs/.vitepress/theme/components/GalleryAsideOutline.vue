<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";
import { useGallerySection } from "../composables/useGallerySection";

const { normalizedPath, section, showGalleryAside } = useGallerySection();

function normalizeHref(href: string) {
  return href.replace(/\/$/, "") || "/";
}

function isCurrent(href: string) {
  return normalizeHref(normalizedPath.value) === normalizeHref(href);
}

const links = computed(() => {
  const s = section.value;
  if (!s) return [];
  return [
    { label: "Overview", href: s.link },
    ...s.items.map((item) => ({ label: item.title, href: item.link }))
  ];
});
</script>

<template>
  <nav
    v-if="showGalleryAside && section"
    class="gallery-aside-outline"
    aria-labelledby="gallery-aside-heading"
  >
    <div class="content">
      <div class="outline-marker" aria-hidden="true" />
      <h2 id="gallery-aside-heading" class="outline-title">On this page</h2>
      <ul class="outline-list" role="list">
        <li v-for="link in links" :key="link.href" class="outline-item">
          <a
            class="outline-link"
            :class="{ active: isCurrent(link.href) }"
            :href="withBase(link.href)"
            :aria-current="isCurrent(link.href) ? 'page' : undefined"
          >
            {{ link.label }}
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>
