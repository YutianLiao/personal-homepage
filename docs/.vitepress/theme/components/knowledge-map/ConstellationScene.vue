<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { buildConstellationGraph } from "./buildConstellationGraph";
import type { MapNode } from "./graphModel";
import type { ConstellationController } from "./useConstellationScene";
import type { KnowledgeMapData, PreviewEntry } from "./types";
import { playAppleOpen } from "./useGraphSound";

const props = defineProps<{
  data: KnowledgeMapData;
  preview?: PreviewEntry | null;
  focusNodeId?: string | null;
}>();

const emit = defineEmits<{
  select: [nodes: MapNode[]];
  openEntry: [node: MapNode];
}>();

const containerRef = ref<HTMLElement | null>(null);
const isLoading = ref(true);
const loadError = ref("");

const graphData = computed(() => buildConstellationGraph(props.data, props.preview));

let controller: ConstellationController | null = null;

async function mountGraph(el: HTMLElement) {
  isLoading.value = true;
  loadError.value = "";
  try {
    controller?.destroy();
    controller = null;
    const { initConstellationScene } = await import("./useConstellationScene");
    controller = await initConstellationScene(el, graphData.value, {
      onSelectionChange: (nodes) => emit("select", nodes),
      onOpenEntry: (node) => {
        playAppleOpen();
        emit("openEntry", node);
      }
    });
    requestAnimationFrame(() => controller?.resize());
  } catch (e) {
    console.error("[Constellation]", e);
    loadError.value = e instanceof Error ? e.message : String(e);
  } finally {
    isLoading.value = false;
  }
}

watch(graphData, (data) => {
  controller?.refresh(data);
});

watch(
  () => props.focusNodeId,
  (id) => {
    if (id) controller?.focusNode(id);
  }
);

function onResize() {
  controller?.resize();
}

onMounted(async () => {
  await nextTick();
  requestAnimationFrame(() => {
    const el = containerRef.value;
    if (el) void mountGraph(el);
  });
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
  controller?.destroy();
  controller = null;
});

defineExpose({
  clearSelection: () => controller?.clearSelection(),
  deselectNode: (id: string) => controller?.deselectNode(id),
  focusNode: (id: string) => controller?.focusNode(id)
});
</script>

<template>
  <div class="constellation">
    <div ref="containerRef" class="constellation__canvas" />
    <div v-if="isLoading && !loadError" class="constellation__loading">加载星丛图谱…</div>
    <div v-if="loadError" class="constellation__error">
      <p>星丛图谱加载失败</p>
      <p class="constellation__error-detail">{{ loadError }}</p>
    </div>
  </div>
</template>
