<script setup lang="ts">
import type { MapNode } from "./graphModel";

defineProps<{
  nodes: MapNode[];
}>();

const emit = defineEmits<{
  remove: [id: string];
  clear: [];
}>();

function kindShort(kind: string): string {
  if (kind === "topic") return "内轨";
  if (kind === "entry") return "外轨";
  if (kind === "domain") return "核心";
  return "星辰";
}
</script>

<template>
  <div v-if="nodes.length" class="constellation-selection" role="status" aria-live="polite">
    <div class="constellation-selection__head">
      <span class="constellation-selection__label">已选 {{ nodes.length }} 颗星辰</span>
      <button type="button" class="constellation-selection__clear" @click="emit('clear')">
        清空
      </button>
    </div>
    <ul class="constellation-selection__list">
      <li v-for="node in nodes" :key="node.id" class="constellation-selection__chip">
        <span class="constellation-selection__chip-kind">{{ kindShort(node.kind) }}</span>
        <span class="constellation-selection__chip-label">{{ node.label }}</span>
        <button
          type="button"
          class="constellation-selection__chip-remove"
          :aria-label="`取消选择 ${node.label}`"
          @click="emit('remove', node.id)"
        >
          ×
        </button>
      </li>
    </ul>
  </div>
</template>
