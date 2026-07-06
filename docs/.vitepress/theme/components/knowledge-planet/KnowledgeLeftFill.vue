<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import katex from "katex";
import "katex/dist/katex.min.css";
import type { FlatKnowledgePoint } from "./types";

const props = defineProps<{ points: FlatKnowledgePoint[] }>();

const formulas = [
  {
    tex: String.raw`e^{\color{#7ec8ff}{\pi}\sqrt{\color{#ffaa6e}{163}}} = \color{#b894ff}{640320}^{\color{#8ec4ff}{3}} + \color{#ffaa6e}{744}`,
    label: "Ramanujan"
  },
  {
    tex: String.raw`\frac{\color{#ffaa6e}{1}}{\color{#7ec8ff}{\pi}} = \frac{2\sqrt{2}}{9801} \sum_{n=0}^{\color{#b894ff}{\infty}} \frac{(\color{#7ec8ff}{4n})!\,(1103 + 26390n)}{(n!)^4 \, 396^{4n}}`,
    label: "Ramanujan"
  },
  {
    tex: String.raw`\sum_{n=\color{#ffaa6e}{1}}^{\color{#b894ff}{\infty}} \color{#7ec8ff}{\sigma(n)}\, e^{-2\color{#7ec8ff}{\pi} n} = \frac{\color{#7ec8ff}{\pi}}{\color{#ffaa6e}{24}}`,
    label: "Ramanujan"
  }
];

const rendered = ref<string[]>([]);

onMounted(() => {
  rendered.value = formulas.map((f) =>
    katex.renderToString(f.tex, {
      throwOnError: false,
      displayMode: true,
      output: "html"
    })
  );
});

const topGroups = computed(() => {
  const total = props.points.length;
  if (total === 0) return [];

  const map = new Map<string, { title: string; count: number; sum: number }>();
  for (const p of props.points) {
    const g = map.get(p.l2Id) ?? { title: p.l2Title, count: 0, sum: 0 };
    g.count += 1;
    g.sum += p.familiarity;
    map.set(p.l2Id, g);
  }

  return [...map.entries()]
    .map(([id, g]) => ({
      id,
      title: g.title,
      share: Math.round((g.count / total) * 100),
      avg: Math.round(g.sum / g.count)
    }))
    .sort((a, b) => b.share - a.share || b.avg - a.avg)
    .slice(0, 3);
});
</script>

<template>
  <div class="km-left-fill">
    <section class="km-topics site-panel" aria-label="主题分布 TOP3">
      <p class="km-topics__label">主题分布 TOP3</p>
      <ul class="km-topics__list">
        <li v-for="(g, i) in topGroups" :key="g.id" class="km-topics__item">
          <div class="km-topics__row">
            <span class="km-topics__name">{{ g.title }}</span>
            <span class="km-topics__meta">{{ g.share }}%</span>
          </div>
          <span class="km-topics__bar-track" aria-hidden="true">
            <span
              class="km-topics__bar"
              :class="`km-topics__bar--tone-${i}`"
              :style="{ width: `${g.avg}%` }"
            />
          </span>
        </li>
      </ul>
    </section>

    <section class="km-formulas" aria-label="拉马努金公式">
      <p class="km-formulas__label">公式拾遗</p>
      <ul class="km-formulas__list">
        <li v-for="(html, i) in rendered" :key="i" class="km-formulas__item">
          <div class="km-formulas__math" v-html="html" />
          <span class="km-formulas__tag">{{ formulas[i].label }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.km-left-fill {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  overflow: hidden;
}

.km-topics {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: var(--space-2) var(--space-3);
  background: var(--km-surface);
  border-color: var(--km-border);
  backdrop-filter: var(--km-glass-blur);
  -webkit-backdrop-filter: var(--km-glass-blur);
}

.km-topics__label,
.km-formulas__label {
  margin: 0 0 0.4rem;
  font-family: var(--site-sans);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--site-text-muted);
}

.km-topics__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  justify-content: space-evenly;
}

.km-topics__item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.km-topics__row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.35rem;
}

.km-topics__name {
  font-family: var(--site-sans);
  font-size: var(--fs-xs);
  color: var(--site-text);
}

.km-topics__meta {
  font-size: 0.65rem;
  color: var(--site-text-muted);
  white-space: nowrap;
}

.km-topics__bar-track {
  display: block;
  height: 2px;
  border-radius: 1px;
  background: rgba(80, 110, 150, 0.22);
  overflow: hidden;
}

.km-topics__bar {
  display: block;
  height: 100%;
  border-radius: inherit;
  opacity: 0.8;
  max-width: 100%;
}

.km-topics__bar--tone-0 {
  background: linear-gradient(90deg, #ff9a62 0%, #6ec4ff 100%);
}

.km-topics__bar--tone-1 {
  background: linear-gradient(90deg, #9b8aff 0%, #5ee0c0 100%);
}

.km-topics__bar--tone-2 {
  background: linear-gradient(90deg, #ffb45a 0%, #c49bff 100%);
}

.km-formulas {
  flex-shrink: 0;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--site-panel-radius, 6px);
  background: rgba(12, 22, 42, 0.45);
  border: 1px solid var(--km-border);
}

.km-formulas__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.km-formulas__item {
  padding: 0.35rem 0.25rem;
  border-bottom: 1px solid rgba(110, 160, 230, 0.1);
}

.km-formulas__item:last-child {
  border-bottom: none;
}

.km-formulas__math {
  font-size: 0.72rem;
  color: rgba(210, 228, 255, 0.95);
  overflow-x: auto;
}

.km-formulas__math :deep(.katex) {
  font-size: 0.95em;
}

.km-formulas__math :deep(.katex .mord),
.km-formulas__math :deep(.katex .mbin),
.km-formulas__math :deep(.katex .mop) {
  text-shadow: 0 0 12px rgba(126, 200, 255, 0.15);
}

.km-formulas__math :deep(.katex-display) {
  margin: 0;
  text-align: left;
}

.km-formulas__tag {
  display: block;
  margin-top: 0.15rem;
  font-family: var(--site-sans);
  font-size: 0.6rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--site-text-muted);
  opacity: 0.8;
}
</style>
