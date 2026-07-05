<script setup lang="ts">
import { computed, ref } from "vue";
import { DOMAIN_STAR_COLORS } from "./buildConstellationGraph";
import type { MapNode } from "./graphModel";
import type { KnowledgeDomain } from "./types";
import { isSoundEnabled, setSoundEnabled } from "./useGraphSound";

const props = defineProps<{
  domains: KnowledgeDomain[];
  nodes: MapNode[];
}>();

const emit = defineEmits<{
  add: [];
  focus: [nodeId: string];
  resetView: [];
}>();

const soundOn = ref(isSoundEnabled());
const query = ref("");
const searchOpen = ref(false);

const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return [];
  return props.nodes
    .filter((n) => n.label.toLowerCase().includes(q))
    .slice(0, 10);
});

function toggleSound() {
  soundOn.value = !soundOn.value;
  setSoundEnabled(soundOn.value);
}

function onSearchPick(node: MapNode) {
  query.value = node.label;
  searchOpen.value = false;
  emit("focus", node.id);
}

function onSearchKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" && results.value[0]) {
    onSearchPick(results.value[0]);
  }
  if (e.key === "Escape") {
    searchOpen.value = false;
  }
}

function kindLabel(kind: string): string {
  if (kind === "domain") return "引力核心";
  if (kind === "topic") return "内轨恒星";
  return "外轨星辰";
}
</script>

<template>
  <div class="constellation-hud">
    <div class="constellation-hud__left">
      <div class="constellation-hud__brand">
        <span class="constellation-hud__eyebrow">Interest Journey</span>
        <h1 class="constellation-hud__title">Knowledge Map</h1>
      </div>
      <ul class="constellation-hud__legend" aria-label="星丛图例">
        <li class="constellation-hud__legend-tier">
          <span class="constellation-hud__legend-dot constellation-hud__legend-dot--core" />
          引力核心 · 领域
        </li>
        <li class="constellation-hud__legend-tier">
          <span class="constellation-hud__legend-dot constellation-hud__legend-dot--inner" />
          内轨恒星 · 子主题
        </li>
        <li class="constellation-hud__legend-tier">
          <span class="constellation-hud__legend-dot constellation-hud__legend-dot--outer" />
          外轨星辰 · 知识点
        </li>
      </ul>
      <ul class="constellation-hud__domains" aria-label="星系配色">
        <li v-for="domain in domains" :key="domain.id" class="constellation-hud__domain-item">
          <span
            class="constellation-hud__domain-dot"
            :style="{ background: DOMAIN_STAR_COLORS[domain.id]?.main ?? '#94a3b8' }"
          />
          {{ domain.label }}
        </li>
      </ul>
    </div>

    <div class="constellation-hud__right">
      <div class="constellation-search">
        <input
          v-model="query"
          type="search"
          class="constellation-search__input"
          placeholder="搜索星辰…"
          aria-label="搜索知识图谱节点"
          @focus="searchOpen = true"
          @keydown="onSearchKeydown"
        />
        <ul
          v-if="searchOpen && query.trim() && results.length"
          class="constellation-search__results"
        >
          <li v-for="node in results" :key="node.id">
            <button
              type="button"
              class="constellation-search__item"
              @mousedown.prevent="onSearchPick(node)"
            >
              <span class="constellation-search__label">{{ node.label }}</span>
              <span class="constellation-search__kind">{{ kindLabel(node.kind) }}</span>
            </button>
          </li>
        </ul>
        <p
          v-else-if="searchOpen && query.trim() && !results.length"
          class="constellation-search__empty"
        >
          无匹配星辰
        </p>
      </div>

      <button
        type="button"
        class="km-btn constellation-hud__icon"
        title="重置视角"
        @click="emit('resetView')"
      >
        ⌂
      </button>
      <button
        type="button"
        class="km-btn constellation-hud__icon"
        :aria-pressed="soundOn"
        @click="toggleSound"
      >
        {{ soundOn ? "🔔" : "🔕" }}
      </button>
      <button type="button" class="km-btn km-btn--primary constellation-hud__add" @click="emit('add')">
        + 添加
      </button>
    </div>
  </div>
</template>
