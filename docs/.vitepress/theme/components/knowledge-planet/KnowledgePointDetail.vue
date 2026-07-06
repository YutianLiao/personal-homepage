<script setup lang="ts">
import type { FlatKnowledgePoint } from "./types";

defineProps<{
  point: FlatKnowledgePoint;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <div class="km-detail" role="dialog" aria-labelledby="km-detail-title">
    <button type="button" class="km-detail__close" aria-label="关闭" @click="emit('close')">
      ×
    </button>
    <p class="km-detail__crumb">{{ point.l1Title }} · {{ point.l2Title }}</p>
    <h3 id="km-detail-title" class="km-detail__title">{{ point.title }}</h3>
    <div class="km-detail__familiarity">
      <div class="km-detail__familiarity-row">
        <span class="km-detail__familiarity-label">熟悉度</span>
        <span class="km-detail__familiarity-value">{{ point.familiarity }}%</span>
      </div>
      <span class="km-detail__bar-track" aria-hidden="true">
        <span class="km-detail__bar" :style="{ width: `${point.familiarity}%` }" />
      </span>
    </div>
    <p v-if="point.url" class="km-detail__link">
      <a :href="point.url" target="_blank" rel="noopener noreferrer">查看笔记 →</a>
    </p>
  </div>
</template>

<style scoped>
.km-detail {
  position: absolute;
  left: 50%;
  bottom: 8%;
  z-index: 4;
  width: min(360px, 88%);
  padding: var(--space-3);
  transform: translateX(-50%);
  border-radius: var(--site-panel-radius, 8px);
  background: rgba(8, 14, 28, 0.78);
  border: 1px solid rgba(180, 210, 255, 0.22);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  animation: km-detail-in 0.22s ease-out;
}

.km-detail__close {
  position: absolute;
  top: 0.5rem;
  right: 0.55rem;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: rgba(180, 200, 230, 0.7);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
}

.km-detail__close:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}

.km-detail__crumb {
  margin: 0 0 0.25rem;
  font-family: var(--site-sans);
  font-size: 0.65rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--site-text-muted);
}

.km-detail__title {
  margin: 0 0 0.75rem;
  padding-right: 1.5rem;
  font-family: var(--site-serif);
  font-size: var(--fs-md);
  font-weight: 600;
  line-height: 1.3;
  color: #fff;
}

.km-detail__familiarity-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.3rem;
}

.km-detail__familiarity-label {
  font-family: var(--site-sans);
  font-size: var(--fs-xs);
  color: var(--site-text-muted);
}

.km-detail__familiarity-value {
  font-family: var(--site-sans);
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--site-accent);
}

.km-detail__bar-track {
  display: block;
  height: 3px;
  border-radius: 2px;
  background: rgba(80, 110, 150, 0.25);
  overflow: hidden;
}

.km-detail__bar {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #5eb0ff 0%, #9b8aff 100%);
}

.km-detail__link {
  margin: 0.65rem 0 0;
  font-family: var(--site-sans);
  font-size: var(--fs-xs);
}

.km-detail__link a {
  color: var(--site-accent);
  text-decoration: none;
}

.km-detail__link a:hover {
  text-decoration: underline;
}

@keyframes km-detail-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
