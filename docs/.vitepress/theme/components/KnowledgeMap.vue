<script setup lang="ts">
import { computed } from "vue";
import mapData from "../../knowledge-map.json";
import AddEntryForm from "./knowledge-map/AddEntryForm.vue";
import { computeGraph, domainStats, hubRadius, VIEW_H, VIEW_W } from "./knowledge-map/layout";
import { useKnowledgeMap } from "./knowledge-map/useKnowledgeMap";
import type { GraphEdge, GraphNode, KnowledgeDomain, KnowledgeMapData } from "./knowledge-map/types";

const data = mapData as KnowledgeMapData;

const {
  selection,
  hoveredId,
  previewEntry,
  showAddForm,
  isMobile,
  focusedDomainId,
  selectNode,
  selectDomain,
  clearSelection,
  isDimmed,
  isHighlighted,
  setPreview
} = useKnowledgeMap();

const graph = computed(() => computeGraph(data, previewEntry.value));

const selectedNode = computed(() =>
  graph.value.nodes.find((n) => n.id === selection.value.nodeId) ?? null
);

const focusedDomain = computed(() =>
  data.domains.find((d) => d.id === focusedDomainId.value) ?? null
);

const domainColors: Record<string, string> = {
  ai: "var(--km-color-ai)",
  math: "var(--km-color-math)",
  economics: "var(--km-color-economics)"
};

function nodeColor(node: GraphNode): string {
  return domainColors[node.domainId] ?? "var(--site-text-muted)";
}

function edgeOpacity(edge: GraphEdge): number {
  if (!focusedDomainId.value) return 0.45;
  return edge.domainId === focusedDomainId.value ? 0.75 : 0.12;
}

function edgeStroke(edge: GraphEdge): string {
  if (selection.value.topicId && edge.topicId === selection.value.topicId) {
    return domainColors[edge.domainId] ?? "var(--site-accent)";
  }
  return "var(--site-border-strong)";
}

function onNodeClick(node: GraphNode) {
  selectNode(node);
}

function onNodeKeydown(e: KeyboardEvent, node: GraphNode) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    selectNode(node);
  }
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${y}/${m}/${d}`;
}

function domainEmptyLabel(domain: KnowledgeDomain): string {
  const { topicCount } = domainStats(domain);
  return topicCount === 0 ? "待添加" : "";
}
</script>

<template>
  <div class="knowledge-map">
    <header class="knowledge-map__header">
      <div>
        <p class="site-section-eyebrow">Interest Journey</p>
        <h1 class="knowledge-map__title">Knowledge Map</h1>
        <p class="knowledge-map__subtitle">按领域组织的知识图谱，记录学习脉络</p>
      </div>
      <button
        type="button"
        class="km-btn km-btn--primary knowledge-map__add-btn"
        @click="showAddForm = !showAddForm"
      >
        + 添加知识点
      </button>
    </header>

    <AddEntryForm
      :data="data"
      :open="showAddForm"
      @close="showAddForm = false"
      @preview="setPreview"
    />

    <!-- Desktop: SVG constellation -->
    <div v-if="!isMobile" class="knowledge-map__canvas-wrap site-panel">
      <svg
        class="knowledge-map__svg"
        :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`"
        role="img"
        aria-label="知识地图"
      >
        <defs>
          <pattern id="km-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="var(--site-border)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#km-grid)" opacity="0.5" />

        <g class="knowledge-map__edges">
          <line
            v-for="edge in graph.edges"
            :key="edge.id"
            :x1="edge.x1"
            :y1="edge.y1"
            :x2="edge.x2"
            :y2="edge.y2"
            class="knowledge-map__edge"
            :stroke="edgeStroke(edge)"
            :stroke-opacity="edgeOpacity(edge)"
          />
        </g>

        <g class="knowledge-map__nodes">
          <template v-for="node in graph.nodes" :key="node.id">
            <!-- Domain hub -->
            <g
              v-if="node.kind === 'domain'"
              class="knowledge-map__node knowledge-map__node--domain"
              :class="{
                'is-dimmed': isDimmed(node),
                'is-active': isHighlighted(node),
                'is-focused': focusedDomainId === node.domainId
              }"
              :transform="`translate(${node.x}, ${node.y})`"
              tabindex="0"
              role="button"
              :aria-label="`${node.label} 领域`"
              @click="onNodeClick(node)"
              @keydown="onNodeKeydown($event, node)"
              @mouseenter="hoveredId = node.id"
              @mouseleave="hoveredId = null"
            >
              <circle
                :r="hubRadius(node.domain!)"
                class="knowledge-map__hub-ring"
                :fill="nodeColor(node)"
                fill-opacity="0.12"
                :stroke="nodeColor(node)"
              />
              <circle r="6" :fill="nodeColor(node)" />
              <text class="knowledge-map__hub-label" y="-38">{{ node.label }}</text>
              <text
                v-if="domainEmptyLabel(node.domain!)"
                class="knowledge-map__hub-empty"
                y="48"
              >
                {{ domainEmptyLabel(node.domain!) }}
              </text>
              <text v-else class="knowledge-map__hub-meta" y="48">
                {{ domainStats(node.domain!).topicCount }} topics ·
                {{ domainStats(node.domain!).entryCount }} entries
              </text>
            </g>

            <!-- Topic node -->
            <g
              v-else-if="node.kind === 'topic'"
              class="knowledge-map__node knowledge-map__node--topic"
              :class="{
                'is-dimmed': isDimmed(node),
                'is-active': isHighlighted(node)
              }"
              :transform="`translate(${node.x}, ${node.y})`"
              tabindex="0"
              role="button"
              :aria-label="`${node.label} 子主题`"
              @click="onNodeClick(node)"
              @keydown="onNodeKeydown($event, node)"
              @mouseenter="hoveredId = node.id"
              @mouseleave="hoveredId = null"
            >
              <circle r="14" class="knowledge-map__topic-bg" :stroke="nodeColor(node)" />
              <text class="knowledge-map__topic-label" :fill="nodeColor(node)">{{ node.label }}</text>
            </g>

            <!-- Entry leaf -->
            <g
              v-else
              class="knowledge-map__node knowledge-map__node--entry"
              :class="{
                'is-dimmed': isDimmed(node),
                'is-active': isHighlighted(node),
                'is-preview': node.isPreview
              }"
              :transform="`translate(${node.x}, ${node.y})`"
              tabindex="0"
              role="button"
              :aria-label="node.label"
              @click="onNodeClick(node)"
              @keydown="onNodeKeydown($event, node)"
              @mouseenter="hoveredId = node.id"
              @mouseleave="hoveredId = null"
            >
              <circle r="5" :fill="nodeColor(node)" />
              <text class="knowledge-map__entry-label">{{ node.label }}</text>
              <title>{{ node.label }}{{ node.entry?.learnedAt ? ` · ${formatDate(node.entry.learnedAt)}` : "" }}</title>
            </g>
          </template>
        </g>
      </svg>

      <aside v-if="focusedDomain || selectedNode" class="knowledge-map__detail site-panel">
        <div class="knowledge-map__detail-head">
          <h3 class="knowledge-map__detail-title">
            <template v-if="selectedNode?.kind === 'entry'">{{ selectedNode.label }}</template>
            <template v-else-if="selectedNode?.kind === 'topic'">{{ selectedNode.label }}</template>
            <template v-else-if="focusedDomain">{{ focusedDomain.label }}</template>
          </h3>
          <button type="button" class="km-add-form__close" aria-label="关闭详情" @click="clearSelection">×</button>
        </div>

        <div v-if="selectedNode?.kind === 'entry' && selectedNode.entry" class="knowledge-map__detail-body">
          <p v-if="selectedNode.entry.learnedAt" class="knowledge-map__detail-meta">
            学习日期：{{ formatDate(selectedNode.entry.learnedAt) }}
          </p>
          <p v-if="selectedNode.entry.note" class="knowledge-map__detail-note">{{ selectedNode.entry.note }}</p>
          <p v-if="selectedNode.isPreview" class="knowledge-map__preview-badge">预览（未保存）</p>
        </div>

        <div v-else-if="focusedDomain" class="knowledge-map__detail-body">
          <ul class="knowledge-map__topic-list">
            <li v-for="topic in focusedDomain.topics" :key="topic.id" class="knowledge-map__topic-item">
              <button
                type="button"
                class="knowledge-map__topic-btn"
                :class="{ 'is-active': selection.topicId === topic.id }"
                @click="selectNode({ id: `topic:${focusedDomain.id}:${topic.id}`, kind: 'topic', label: topic.label, domainId: focusedDomain.id, topicId: topic.id, x: 0, y: 0, topic })"
              >
                {{ topic.label }}
                <span class="knowledge-map__topic-count">{{ topic.entries.length }}</span>
              </button>
              <ul v-if="selection.topicId === topic.id" class="knowledge-map__entry-list">
                <li v-for="(entry, i) in topic.entries" :key="i">{{ entry.title }}</li>
              </ul>
            </li>
            <li v-if="!focusedDomain.topics.length" class="knowledge-map__empty">暂无子主题</li>
          </ul>
        </div>
      </aside>
    </div>

    <!-- Mobile: stacked cards -->
    <div v-else class="knowledge-map__mobile">
      <article
        v-for="domain in data.domains"
        :key="domain.id"
        class="knowledge-map__mobile-card site-panel"
        :style="{ '--km-domain-color': domainColors[domain.id] }"
      >
        <button
          type="button"
          class="knowledge-map__mobile-domain"
          @click="selectDomain(domain.id)"
        >
          <span class="knowledge-map__mobile-dot" />
          {{ domain.label }}
          <span class="knowledge-map__topic-count">{{ domainStats(domain).entryCount }}</span>
        </button>

        <div v-if="focusedDomainId === domain.id" class="knowledge-map__mobile-body">
          <details v-for="topic in domain.topics" :key="topic.id" class="knowledge-map__mobile-topic" open>
            <summary>{{ topic.label }}</summary>
            <ul>
              <li v-for="(entry, i) in topic.entries" :key="i">
                {{ entry.title }}
                <span v-if="entry.learnedAt" class="knowledge-map__entry-date">{{ formatDate(entry.learnedAt) }}</span>
              </li>
            </ul>
          </details>
          <p v-if="!domain.topics.length" class="knowledge-map__empty">待添加</p>
        </div>
      </article>
    </div>
  </div>
</template>
