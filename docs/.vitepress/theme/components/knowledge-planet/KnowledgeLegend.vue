<script setup lang="ts">
defineProps<{ pointCount: number }>();
</script>

<template>
  <div class="km-legend site-panel">
    <span class="km-legend__eyebrow">Knowledge Planet</span>

    <div class="km-legend__scale" aria-label="熟悉度从 0 到 100 的视觉映射">
      <p class="km-legend__count">{{ pointCount }}在轨知识点</p>
      <div class="km-legend__scale-track">
        <span class="km-legend__node km-legend__node--dim" />
        <span class="km-legend__beam" />
        <span class="km-legend__node km-legend__node--bright" />
      </div>
      <div class="km-legend__scale-labels">
        <span>0</span>
        <span>100</span>
      </div>
    </div>

    <div class="km-legend__chips">
      <span class="km-legend__chip">拖拽旋转</span>
      <span class="km-legend__chip">点击知识点</span>
    </div>
  </div>
</template>

<style scoped>
.km-legend {
  flex-shrink: 0;
  padding: var(--space-3);
  background: var(--km-surface);
  border-color: var(--km-border);
  backdrop-filter: var(--km-glass-blur);
  -webkit-backdrop-filter: var(--km-glass-blur);
}

.km-legend__eyebrow {
  display: block;
  font-family: var(--site-sans);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--site-accent-warm);
  margin-bottom: var(--space-2);
}

.km-legend__scale {
  margin-bottom: var(--space-2);
}

.km-legend__count {
  margin: 0 0 0.35rem;
  text-align: center;
  font-family: var(--site-sans);
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: rgba(160, 185, 220, 0.62);
}

.km-legend__scale-track {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.4rem;
  border-radius: 5px;
  background: linear-gradient(
    90deg,
    rgba(15, 30, 55, 0.6) 0%,
    rgba(255, 160, 90, 0.08) 35%,
    rgba(140, 100, 255, 0.1) 65%,
    rgba(80, 60, 150, 0.12) 100%
  );
  border: 1px solid var(--km-border);
}

.km-legend__node {
  display: block;
  border-radius: 50%;
  flex-shrink: 0;
  background: radial-gradient(circle at 35% 35%, #e8f4ff 0%, #5eb0ff 50%, #2a5080 100%);
}

.km-legend__node--dim {
  width: 7px;
  height: 7px;
  opacity: 0.45;
}

.km-legend__node--bright {
  width: 14px;
  height: 14px;
  box-shadow: 0 0 10px rgba(110, 196, 255, 0.5);
}

.km-legend__beam {
  flex: 1;
  height: 2px;
  border-radius: 1px;
  background: linear-gradient(90deg, rgba(255, 170, 100, 0.35) 0%, rgba(110, 196, 255, 0.65) 55%, rgba(180, 130, 255, 0.55) 100%);
}

.km-legend__scale-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
  font-family: var(--site-sans);
  font-size: 0.65rem;
  color: var(--site-text-muted);
}

.km-legend__chips {
  display: flex;
  gap: 0.3rem;
  width: 100%;
}

.km-legend__chip {
  flex: 1;
  min-width: 0;
  text-align: center;
  padding: 0.2rem 0.35rem;
  font-family: var(--site-sans);
  font-size: 0.65rem;
  color: var(--site-text-muted);
  border: 1px solid var(--km-border);
  border-radius: 999px;
  background: var(--km-surface-2);
}
</style>
