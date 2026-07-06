<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import * as THREE from "three";
import type { FlatKnowledgePoint } from "./types";
import { createScene } from "./sphere/createScene";
import { createOrbits } from "./sphere/createOrbits";
import { createNodes, updateNodeHighlight } from "./sphere/createNodes";
import { createEdges, updateEdgeHighlight } from "./sphere/createEdges";
import { createRenderScheduler } from "./sphere/createRenderScheduler";

const props = defineProps<{
  points: FlatKnowledgePoint[];
  highlightIds: Set<string>;
  hasQuery: boolean;
  selectedId: string | null;
}>();

const emit = defineEmits<{
  select: [point: FlatKnowledgePoint | null];
}>();

const canvasRef = ref<HTMLElement | null>(null);
const hoveredId = ref<string | null>(null);

let ctx: ReturnType<typeof createScene> | null = null;
let scheduler: ReturnType<typeof createRenderScheduler> | null = null;
let orbitGroup: ReturnType<typeof createOrbits> | null = null;
let nodeGroup: ReturnType<typeof createNodes> | null = null;
let edgeGroup: ReturnType<typeof createEdges> | null = null;
let resizeObserver: ResizeObserver | null = null;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const pickTargets: THREE.Object3D[] = [];

function requestRender() {
  scheduler?.requestRender();
}

function subtopicMap(points: FlatKnowledgePoint[]) {
  const map = new Map<string, Set<string>>();
  for (const p of points) {
    const set = map.get(p.l2Id) ?? new Set();
    set.add(p.id);
    map.set(p.l2Id, set);
  }
  return map;
}

function rebuildScene() {
  if (!ctx) return;
  orbitGroup?.dispose();
  nodeGroup?.dispose();
  edgeGroup?.dispose();
  if (orbitGroup) ctx.scene.remove(orbitGroup.group);
  if (nodeGroup) ctx.scene.remove(nodeGroup.group);
  if (edgeGroup) ctx.scene.remove(edgeGroup.group);

  orbitGroup = createOrbits();
  nodeGroup = createNodes(props.points);
  edgeGroup = createEdges(props.points);
  ctx.scene.add(orbitGroup.group);
  ctx.scene.add(edgeGroup.group);
  ctx.scene.add(nodeGroup.group);
  pickTargets.length = 0;
  pickTargets.push(...nodeGroup.meshes.values());
  applyHighlight();
  requestRender();
}

function applyHighlight() {
  if (!nodeGroup || !edgeGroup) return;
  updateNodeHighlight(
    nodeGroup.meshes,
    props.highlightIds,
    props.hasQuery,
    props.selectedId,
    hoveredId.value
  );
  updateEdgeHighlight(
    edgeGroup.group,
    props.highlightIds,
    subtopicMap(props.points),
    props.hasQuery,
    props.selectedId
  );
  requestRender();
}

function pickPoint(clientX: number, clientY: number): FlatKnowledgePoint | null {
  if (!ctx || !nodeGroup || !canvasRef.value) return null;
  const rect = canvasRef.value.getBoundingClientRect();
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, ctx.camera);
  const hits = raycaster.intersectObjects(pickTargets, false);
  if (!hits.length) return null;
  const id = hits[0].object.userData.pointId as string;
  return props.points.find((p) => p.id === id) ?? null;
}

let lastPointerMove = 0;

function onPointerMove(e: PointerEvent) {
  if (!ctx) return;
  const now = performance.now();
  if (now - lastPointerMove < 32) return;
  lastPointerMove = now;

  const hit = pickPoint(e.clientX, e.clientY);
  const next = hit?.id ?? null;
  if (next !== hoveredId.value) {
    hoveredId.value = next;
    applyHighlight();
  }
  ctx.renderer.domElement.style.cursor = hit ? "pointer" : "grab";
}

let pointerDownX = 0;
let pointerDownY = 0;

function onPointerDown(e: PointerEvent) {
  pointerDownX = e.clientX;
  pointerDownY = e.clientY;
}

function onPointerUp(e: PointerEvent) {
  const dx = e.clientX - pointerDownX;
  const dy = e.clientY - pointerDownY;
  if (dx * dx + dy * dy > 36) return;

  const hit = pickPoint(e.clientX, e.clientY);
  if (hit && hit.id === props.selectedId) {
    emit("select", null);
  } else {
    emit("select", hit);
  }
}

watch(() => props.points, () => rebuildScene(), { deep: true });

onMounted(() => {
  if (!canvasRef.value) return;
  ctx = createScene(canvasRef.value);
  scheduler = createRenderScheduler(ctx);
  rebuildScene();

  const el = ctx.renderer.domElement;
  el.addEventListener("pointermove", onPointerMove);
  el.addEventListener("pointerdown", onPointerDown);
  el.addEventListener("pointerup", onPointerUp);

  resizeObserver = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    if (width > 0 && height > 0) {
      ctx?.resize(width, height);
      requestRender();
    }
  });
  resizeObserver.observe(canvasRef.value);
});

onUnmounted(() => {
  scheduler?.dispose();
  scheduler = null;
  resizeObserver?.disconnect();
  if (ctx) {
    ctx.renderer.domElement.removeEventListener("pointermove", onPointerMove);
    ctx.renderer.domElement.removeEventListener("pointerdown", onPointerDown);
    ctx.renderer.domElement.removeEventListener("pointerup", onPointerUp);
  }
  orbitGroup?.dispose();
  nodeGroup?.dispose();
  edgeGroup?.dispose();
  ctx?.dispose();
  ctx = null;
});

watch(
  () =>
    [
      props.hasQuery,
      props.selectedId,
      hoveredId.value,
      [...props.highlightIds].sort().join(",")
    ] as const,
  () => applyHighlight()
);
</script>

<template>
  <div
    ref="canvasRef"
    class="knowledge-sphere"
    role="application"
    aria-label="3D 知识星球，拖拽旋转，点击知识点查看详情"
  />
</template>

<style scoped>
.knowledge-sphere {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: transparent;
  touch-action: none;
}

.knowledge-sphere :deep(canvas) {
  display: block;
  outline: none;
}
</style>
