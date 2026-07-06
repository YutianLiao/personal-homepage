<script setup lang="ts">
import { computed, ref } from "vue";
import type { FlatKnowledgePoint } from "./types";
import { TOP_K_ITEM_HEIGHT, useTopK } from "./useTopK";

const props = defineProps<{
  points: FlatKnowledgePoint[];
}>();

const listRef = ref<HTMLElement | null>(null);

const sorted = computed(() =>
  [...props.points].sort((a, b) => b.familiarity - a.familiarity)
);

const { k, topItems } = useTopK(listRef, sorted);
</script>

<template>
  <div class="km-top-list site-panel">
    <header class="km-top-list__head">
      <span class="km-top-list__eyebrow">Brightest Stars</span>
      <h3 class="km-top-list__title">熟悉度 Top {{ k }}</h3>
    </header>
    <div ref="listRef" class="km-top-list__body">
      <ul v-if="topItems.length" class="km-top-list__items">
        <li
          v-for="(item, index) in topItems"
          :key="item.id"
          class="km-top-list__item"
          :style="{ minHeight: `${TOP_K_ITEM_HEIGHT}px` }"
        >
          <span class="km-top-list__rank">{{ index + 1 }}</span>
          <div class="km-top-list__meta">
            <span class="km-top-list__name">{{ item.title }}</span>
            <span class="km-top-list__sub">{{ item.l2Title }}</span>
            <span class="km-top-list__bar-track" aria-hidden="true">
              <span
                class="km-top-list__bar"
                :style="{ width: `${item.familiarity}%` }"
              />
            </span>
          </div>
          <span class="km-top-list__score">{{ item.familiarity }}</span>
        </li>
      </ul>
      <p v-else class="km-top-list__empty">暂无知识点</p>
    </div>
  </div>
</template>

<style scoped>
.km-top-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  max-height: 100%;
  padding: 0;
  overflow: hidden;
  background: var(--km-surface);
  border-color: var(--km-border);
  backdrop-filter: var(--km-glass-blur);
  -webkit-backdrop-filter: var(--km-glass-blur);
}

.km-top-list__head {
  padding: var(--space-3) var(--space-3) var(--space-2);
  border-bottom: 1px solid var(--km-border);
  flex-shrink: 0;
}

.km-top-list__eyebrow {
  display: block;
  font-family: var(--site-sans);
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--site-accent-cool);
  margin-bottom: 0.2rem;
}

.km-top-list__title {
  margin: 0;
  font-family: var(--site-serif);
  font-size: var(--fs-md);
  font-weight: 600;
  color: var(--site-text);
}

.km-top-list__body {
  flex: 1;
  min-height: 0;
  max-height: 100%;
  padding: 4% 0;
  overflow: hidden;
}

.km-top-list__items {
  margin: 0;
  padding: 0 var(--space-3);
  list-style: none;
}

.km-top-list__item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.4rem 0.15rem;
  border-bottom: 1px solid var(--km-border);
}

.km-top-list__rank {
  font-family: var(--site-sans);
  font-size: var(--fs-xs);
  font-weight: 700;
  color: var(--site-text-muted);
  width: 1.1rem;
  text-align: center;
  flex-shrink: 0;
}

.km-top-list__meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.km-top-list__name {
  font-family: var(--site-sans);
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--site-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.km-top-list__sub {
  font-size: var(--fs-xs);
  color: var(--site-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.km-top-list__bar-track {
  display: block;
  height: 2px;
  border-radius: 1px;
  background: rgba(80, 110, 150, 0.22);
  overflow: hidden;
}

.km-top-list__bar {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ff9a62 0%, #7ec8ff 50%, #b894ff 100%);
  opacity: 0.75;
  max-width: 100%;
  transition: width 0.3s ease;
}

.km-top-list__score {
  font-family: var(--site-sans);
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--site-accent-warm);
  flex-shrink: 0;
  min-width: 1.75rem;
  text-align: right;
}

.km-top-list__empty {
  margin: 0;
  padding: var(--space-4);
  font-size: var(--fs-sm);
  color: var(--site-text-muted);
  text-align: center;
}
</style>
