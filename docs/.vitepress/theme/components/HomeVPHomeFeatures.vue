<script setup lang="ts">
import type { DefaultTheme } from "vitepress/theme";
import { computed, onMounted, onUnmounted } from "vue";
import { useData } from "vitepress";
import VPFeature from "vitepress/dist/client/theme-default/components/VPFeature.vue";
import HomeBiographyFeature from "./HomeBiographyFeature.vue";

interface FeatureItem {
  icon?: DefaultTheme.FeatureIcon;
  title: string;
  details?: string;
  link?: string;
  linkText?: string;
  rel?: string;
  target?: string;
}

const { frontmatter } = useData();

const bio = computed(() => {
  const list = frontmatter.value.features as FeatureItem[] | undefined;
  return list?.find((f) => f.title === "Biography") ?? null;
});

const others = computed(() => {
  const list = frontmatter.value.features as FeatureItem[] | undefined;
  return list?.filter((f) => f.title !== "Biography") ?? [];
});

const count = computed(() => others.value.length + (bio.value ? 1 : 0));

const grid = computed(() => {
  const n = count.value;
  if (!n) return;
  if (n === 2) return "grid-2";
  if (n === 3) return "grid-3";
  if (n % 3 === 0) return "grid-6";
  if (n > 3) return "grid-4";
  return "grid-2";
});

let resizeObserver: ResizeObserver | undefined;

function syncHomeRailAnchors() {
  const root = document.querySelector(".home-features-custom");
  if (!root) return;

  const biography = root.querySelector(".items > .item:first-child");
  if (!biography) return;

  const rootRect = root.getBoundingClientRect();
  const bioRect = biography.getBoundingClientRect();

  const geometryLine = bioRect.bottom - rootRect.top;

  root.style.setProperty("--home-geometry-line-y", `${geometryLine}px`);
}

onMounted(() => {
  syncHomeRailAnchors();
  window.addEventListener("resize", syncHomeRailAnchors, { passive: true });

  const root = document.querySelector(".home-features-custom .items");
  if (root) {
    resizeObserver = new ResizeObserver(() => syncHomeRailAnchors());
    resizeObserver.observe(root);
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", syncHomeRailAnchors);
  resizeObserver?.disconnect();
});
</script>

<template>
  <div v-if="count > 0" class="VPFeatures VPHomeFeatures">
    <div class="container">
      <div class="items">
        <div v-if="bio" class="item" :class="[grid]">
          <HomeBiographyFeature :details="bio.details ?? ''" />
        </div>
        <div
          v-for="feature in others"
          :key="feature.title"
          class="item"
          :class="[grid]"
        >
          <VPFeature
            :icon="feature.icon"
            :title="feature.title"
            :details="feature.details"
            :link="feature.link"
            :link-text="feature.linkText"
            :rel="feature.rel"
            :target="feature.target"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.VPFeatures {
  position: relative;
  padding: 0;
}

.container {
  margin: 0 auto;
  max-width: var(--site-page-max, 72rem);
  padding-left: var(--site-gutter, clamp(1.25rem, 4.5vw, 2.75rem));
  padding-right: var(--site-gutter, clamp(1.25rem, 4.5vw, 2.75rem));
  box-sizing: border-box;
}

.items {
  display: flex;
  flex-wrap: wrap;
  margin: -8px;
}

.item {
  padding: 8px;
  width: 100%;
}

/* 画布固定 1680：Features 栅格始终用桌面列宽，不按真实视口断点切换 */
.item.grid-2 {
  width: calc(100% / 2);
}

.item.grid-3,
.item.grid-6 {
  width: calc(100% / 3);
}

.item.grid-4 {
  width: calc(100% / 4);
}
</style>
