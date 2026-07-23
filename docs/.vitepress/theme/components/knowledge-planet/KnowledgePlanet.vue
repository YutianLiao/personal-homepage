<script setup lang="ts">
import { computed, ref } from "vue";
import { useKnowledgeData } from "./useKnowledgeData";
import KnowledgeNebulaBg from "./KnowledgeNebulaBg.vue";
import KnowledgeLegend from "./KnowledgeLegend.vue";
import KnowledgeSearch from "./KnowledgeSearch.vue";
import KnowledgeSphere from "./KnowledgeSphere.vue";
import KnowledgeTopList from "./KnowledgeTopList.vue";
import KnowledgeLeftFill from "./KnowledgeLeftFill.vue";
import KnowledgePointDetail from "./KnowledgePointDetail.vue";
import type { FlatKnowledgePoint } from "./types";

const { loading, error, points } = useKnowledgeData();
const query = ref("");
const selectedPoint = ref<FlatKnowledgePoint | null>(null);

const hasQuery = computed(() => query.value.trim().length > 0);

const highlightIds = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return new Set<string>();
  const ids = points.value
    .filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.l2Title.toLowerCase().includes(q)
    )
    .map((p) => p.id);
  return new Set(ids);
});

const pointCount = computed(() => points.value.length);
const selectedId = computed(() => selectedPoint.value?.id ?? null);

function onSelect(point: FlatKnowledgePoint | null) {
  selectedPoint.value = point;
}
</script>

<template>
  <div class="km-page">
    <KnowledgeNebulaBg />

    <p v-if="loading" class="km-page__status">加载知识星球…</p>
    <p v-else-if="error" class="km-page__error">{{ error }}</p>

    <template v-else>
      <aside class="km-page__left">
        <KnowledgeLegend :point-count="pointCount" />
        <KnowledgeSearch v-model="query" />
        <KnowledgeLeftFill :points="points" />
      </aside>

      <main class="km-page__center">
        <div class="km-page__center-stage">
          <KnowledgeSphere
            :points="points"
            :highlight-ids="highlightIds"
            :has-query="hasQuery"
            :selected-id="selectedId"
            @select="onSelect"
          />
          <KnowledgePointDetail
            v-if="selectedPoint"
            :point="selectedPoint"
            @close="selectedPoint = null"
          />
        </div>
      </main>

      <aside class="km-page__right">
        <KnowledgeTopList :points="points" />
      </aside>
    </template>
  </div>
</template>

<style scoped>
.km-page {
  /* Astro UXDS / mission-dashboard inspired tokens */
  --km-surface: rgba(12, 20, 38, 0.62);
  --km-surface-2: rgba(16, 26, 48, 0.78);
  --km-border: rgba(120, 150, 200, 0.18);
  --km-glass-blur: blur(12px);

  --site-text: #d8e4f2;
  --site-text-secondary: rgba(190, 210, 235, 0.85);
  --site-text-muted: rgba(130, 155, 190, 0.75);
  --site-accent: #7ec8ff;
  --site-accent-warm: #ffaa6e;
  --site-accent-cool: #b894ff;
  --site-accent-soft: rgba(126, 200, 255, 0.12);
  --site-accent-warm-soft: rgba(255, 170, 110, 0.1);
  --site-accent-cool-soft: rgba(184, 148, 255, 0.1);
  --site-secondary: #9ab4e0;
  --site-secondary-soft: rgba(120, 160, 220, 0.1);
  --site-border: rgba(100, 130, 180, 0.16);
  --site-border-strong: rgba(140, 170, 220, 0.28);
  --site-surface: var(--km-surface);

  position: fixed;
  inset: var(--vp-nav-height, 64px) 0 0 0;
  z-index: 1;
  display: grid;
  /* Desktop floor: keep three columns; scroll horizontally below --site-min-width. */
  grid-template-columns: 236px minmax(320px, 1fr) minmax(220px, 18vw);
  min-width: var(--site-min-width, 1024px);
  overflow-x: auto;
  overflow-y: hidden;
  background: #03060e;
}

.km-page__left,
.km-page__center,
.km-page__right {
  position: relative;
  z-index: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.km-page__left {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
  border-right: 1px solid rgba(255, 160, 100, 0.12);
  background: linear-gradient(90deg, rgba(24, 14, 28, 0.55) 0%, transparent 100%);
}

.km-page__center {
  display: flex;
  min-width: 0;
  position: relative;
  overflow: visible;
}

.km-page__center-stage {
  position: absolute;
  inset: 0 -5% 0 -3%;
  z-index: 1;
  min-height: 0;
}

.km-page__center-stage :deep(.knowledge-sphere) {
  width: 100%;
  height: 100%;
}

.km-page__center :deep(.knowledge-sphere) {
  position: relative;
  z-index: 1;
}

.km-page__right {
  display: flex;
  padding: var(--space-3) var(--space-4) var(--space-3) var(--space-3);
  border-left: 1px solid rgba(160, 130, 255, 0.14);
  background: linear-gradient(270deg, rgba(10, 14, 36, 0.55) 0%, transparent 100%);
}

.km-page__status,
.km-page__error {
  grid-column: 1 / -1;
  place-self: center;
  font-family: var(--site-sans);
  font-size: var(--fs-sm);
  color: var(--site-text-muted);
  z-index: 2;
}

.km-page__error {
  color: #ff8a9e;
}
</style>
