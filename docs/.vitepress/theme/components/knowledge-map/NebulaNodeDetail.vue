<script setup lang="ts">
import type { NebulaNode } from "./nebulaGraphData";

defineProps<{
  node: NebulaNode | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

function formatDate(iso?: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${y}/${m}/${d}`;
}

function kindLabel(kind: string): string {
  if (kind === "domain") return "领域";
  if (kind === "topic") return "子主题";
  return "知识点";
}
</script>

<template>
  <div v-if="node" class="nebula-detail" role="dialog" aria-label="节点详情">
    <button type="button" class="nebula-detail__close" aria-label="关闭" @click="emit('close')">×</button>
    <p class="nebula-detail__kind">{{ kindLabel(node.kind) }}</p>
    <h3 class="nebula-detail__title">{{ node.label }}</h3>
    <p v-if="node.entry?.learnedAt" class="nebula-detail__meta">
      学习日期：{{ formatDate(node.entry.learnedAt) }}
    </p>
    <p v-if="node.entry?.note" class="nebula-detail__note">{{ node.entry.note }}</p>
    <p v-if="node.isPreview" class="nebula-detail__preview">预览（未保存）</p>
    <p v-if="node.kind === 'domain'" class="nebula-detail__hint">点击背景或按 Esc 关闭</p>
  </div>
</template>
