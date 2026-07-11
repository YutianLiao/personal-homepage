<script setup lang="ts">
/**
 * Pure scale shell — does not change page layout CSS.
 * Pages keep their own grids/spacing; this only scales the whole stage.
 *
 * DESIGN_W: design canvas width. Larger → smaller on-screen UI at the same window.
 * scale = innerWidth / DESIGN_W. Check: window.innerWidth
 *
 * Also publishes --site-stage-min-h (= innerHeight / scale) so position:fixed
 * panels (sidebar, knowledge planet) fill one visual viewport after zoom.
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vitepress";

/** Larger than 1440 → at a given window, scale < 1 and UI looks smaller. */
const DESIGN_W = 1680;

const route = useRoute();
const stageRef = ref<HTMLElement | null>(null);
const scale = ref(1);
const stageHeight = ref(0);
const stageMinHeight = ref(0);
const useZoom = ref(true);

const stageStyle = computed(() => {
  const base: Record<string, string> = {
    width: `${DESIGN_W}px`,
    minHeight: `${stageMinHeight.value}px`,
  };
  if (useZoom.value) {
    base.zoom = String(scale.value);
    return base;
  }
  base.transform = `scale(${scale.value})`;
  base.transformOrigin = "top center";
  return base;
});

const spacerStyle = computed(() => {
  if (useZoom.value) return { display: "none" };
  return {
    width: `${DESIGN_W * scale.value}px`,
    height: `${Math.max(stageHeight.value, stageMinHeight.value) * scale.value}px`,
    margin: "0 auto",
  };
});

function measureStage() {
  if (!stageRef.value) return;
  stageHeight.value = stageRef.value.scrollHeight;
}

function updateScale() {
  const next = window.innerWidth / DESIGN_W;
  scale.value = next;
  // Stage CSS px that map to one full visual viewport after zoom/transform.
  stageMinHeight.value = window.innerHeight / next;
  document.documentElement.style.setProperty("--site-scale", String(next));
  document.documentElement.style.setProperty(
    "--site-stage-min-h",
    `${stageMinHeight.value}px`
  );
  measureStage();
}

let resizeObserver: ResizeObserver | undefined;

onMounted(() => {
  useZoom.value = typeof CSS !== "undefined" && CSS.supports("zoom", "1");
  document.documentElement.classList.add("site-scale-root");
  document.documentElement.style.setProperty("--site-design-w", `${DESIGN_W}px`);

  updateScale();
  window.addEventListener("resize", updateScale, { passive: true });

  if (stageRef.value) {
    resizeObserver = new ResizeObserver(() => measureStage());
    resizeObserver.observe(stageRef.value);
  }
});

onUnmounted(() => {
  document.documentElement.classList.remove("site-scale-root");
  document.documentElement.style.removeProperty("--site-scale");
  document.documentElement.style.removeProperty("--site-design-w");
  document.documentElement.style.removeProperty("--site-stage-min-h");
  window.removeEventListener("resize", updateScale);
  resizeObserver?.disconnect();
});

watch(
  () => route.path,
  async () => {
    await nextTick();
    updateScale();
  }
);
</script>

<template>
  <div class="site-scale-viewport">
    <div
      ref="stageRef"
      class="site-scale-stage"
      :class="{ 'site-scale-stage--transform': !useZoom }"
      :style="stageStyle"
    >
      <slot />
    </div>
    <div class="site-scale-spacer" :style="spacerStyle" aria-hidden="true" />
  </div>
</template>

<style scoped>
.site-scale-viewport {
  width: 100%;
  overflow-x: hidden;
}

.site-scale-stage {
  position: relative;
  margin-inline: auto;
  min-height: 0;
}

.site-scale-spacer {
  pointer-events: none;
  visibility: hidden;
}
</style>
