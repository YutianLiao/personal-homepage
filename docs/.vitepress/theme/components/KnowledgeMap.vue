<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import mapData from "../../knowledge-map.json";
import AddEntryForm from "./knowledge-map/AddEntryForm.vue";
import NebulaHud from "./knowledge-map/NebulaHud.vue";
import NebulaNodeDetail from "./knowledge-map/NebulaNodeDetail.vue";
import { buildNebulaGraphData } from "./knowledge-map/nebulaGraphData";
import type { NebulaNode } from "./knowledge-map/nebulaGraphData";
import { initNebulaGraph, type NebulaGraphController } from "./knowledge-map/useNebulaGraph";
import type { KnowledgeMapData, PreviewEntry } from "./knowledge-map/types";

const data = mapData as KnowledgeMapData;

const canvasRef = ref<HTMLElement | null>(null);
const showAddForm = ref(false);
const previewEntry = ref<PreviewEntry | null>(null);
const selectedNode = ref<NebulaNode | null>(null);
const webglFailed = ref(false);
const isMobile = ref(false);

let controller: NebulaGraphController | null = null;

const graphData = computed(() => buildNebulaGraphData(data, previewEntry.value));

function updateMobile() {
  isMobile.value = window.matchMedia("(max-width: 767px)").matches;
}

async function mountGraph() {
  if (!canvasRef.value) return;
  try {
    controller = await initNebulaGraph(
      canvasRef.value,
      graphData.value,
      {
        onNodeClick: (node) => {
          selectedNode.value = node;
        },
        onBackgroundClick: () => {
          selectedNode.value = null;
        }
      },
      { isMobile: isMobile.value }
    );
  } catch {
    webglFailed.value = true;
  }
}

onMounted(() => {
  updateMobile();
  window.addEventListener("resize", updateMobile);
  window.addEventListener("keydown", onKeydown);
  mountGraph();
});

onUnmounted(() => {
  window.removeEventListener("resize", updateMobile);
  window.removeEventListener("keydown", onKeydown);
  controller?.destroy();
  controller = null;
});

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    if (showAddForm.value) {
      showAddForm.value = false;
    } else {
      selectedNode.value = null;
      controller?.focusNode(null);
    }
  }
}

watch(graphData, (next) => {
  controller?.refresh(next);
});

watch(selectedNode, (node) => {
  controller?.focusNode(node?.id ?? null);
});

function setPreview(entry: PreviewEntry | null) {
  previewEntry.value = entry;
}

function closeDetail() {
  selectedNode.value = null;
  controller?.focusNode(null);
}
</script>

<template>
  <div class="knowledge-map knowledge-map--fullscreen">
    <div ref="canvasRef" class="knowledge-map__canvas" />

    <NebulaHud @add="showAddForm = true" />

    <NebulaNodeDetail :node="selectedNode" @close="closeDetail" />

    <Teleport to="body">
      <div v-if="showAddForm" class="nebula-modal-backdrop" @click.self="showAddForm = false">
        <div class="nebula-modal" role="dialog" aria-label="添加知识点">
          <AddEntryForm
            :data="data"
            :open="showAddForm"
            @close="showAddForm = false"
            @preview="setPreview"
          />
        </div>
      </div>
    </Teleport>

    <div v-if="webglFailed" class="knowledge-map__fallback">
      <p>WebGL 不可用，请使用支持 WebGL 的浏览器查看知识地图。</p>
    </div>
  </div>
</template>
