<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import mapData from "../../knowledge-map.json";
import AddEntryForm from "./knowledge-map/AddEntryForm.vue";
import AppleLetter from "./knowledge-map/AppleLetter.vue";
import ConstellationHud from "./knowledge-map/ConstellationHud.vue";
import ConstellationScene from "./knowledge-map/ConstellationScene.vue";
import ConstellationSelectionChips from "./knowledge-map/ConstellationSelectionChips.vue";
import { buildConstellationGraph } from "./knowledge-map/buildConstellationGraph";
import type { MapNode } from "./knowledge-map/graphModel";
import type { KnowledgeMapData, PreviewEntry } from "./knowledge-map/types";

const data = mapData as KnowledgeMapData;

const sceneRef = ref<InstanceType<typeof ConstellationScene> | null>(null);
const showAddForm = ref(false);
const previewEntry = ref<PreviewEntry | null>(null);
const selectedNodes = ref<MapNode[]>([]);
const letterNode = ref<MapNode | null>(null);
const letterOpen = ref(false);
const focusNodeId = ref<string | null>(null);

const allNodes = computed(() => buildConstellationGraph(data, previewEntry.value).nodes);

function onSelection(nodes: MapNode[]) {
  selectedNodes.value = nodes;
}

function onOpenEntry(node: MapNode) {
  letterNode.value = node;
  letterOpen.value = true;
}

function closeLetter() {
  letterOpen.value = false;
}

function setPreview(entry: PreviewEntry | null) {
  previewEntry.value = entry;
}

function onFocus(nodeId: string) {
  focusNodeId.value = nodeId;
  sceneRef.value?.focusNode(nodeId);
  setTimeout(() => {
    focusNodeId.value = null;
  }, 100);
}

function onResetView() {
  sceneRef.value?.focusNode(
    allNodes.value.find((n) => n.kind === "domain")?.id ?? allNodes.value[0]?.id ?? ""
  );
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    if (letterOpen.value) closeLetter();
    else if (showAddForm.value) showAddForm.value = false;
    else sceneRef.value?.clearSelection();
  }
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="knowledge-map knowledge-map--fullscreen knowledge-map--constellation">
    <ConstellationScene
      ref="sceneRef"
      :data="data"
      :preview="previewEntry"
      :focus-node-id="focusNodeId"
      @select="onSelection"
      @open-entry="onOpenEntry"
    />

    <ConstellationHud
      :domains="data.domains"
      :nodes="allNodes"
      @add="showAddForm = true"
      @focus="onFocus"
      @reset-view="onResetView"
    />

    <ConstellationSelectionChips
      :nodes="selectedNodes"
      @clear="sceneRef?.clearSelection()"
      @remove="(id) => sceneRef?.deselectNode(id)"
    />

    <AppleLetter :node="letterNode" :open="letterOpen" @close="closeLetter" />

    <Teleport to="body">
      <div
        v-if="showAddForm"
        class="constellation-modal-backdrop"
        @click.self="showAddForm = false"
      >
        <div class="constellation-modal" role="dialog" aria-label="添加知识点">
          <AddEntryForm
            :data="data"
            :open="showAddForm"
            @close="showAddForm = false"
            @preview="setPreview"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
