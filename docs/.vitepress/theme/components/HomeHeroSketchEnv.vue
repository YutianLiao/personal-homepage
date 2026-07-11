<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { withBase } from "vitepress";

const root = ref<HTMLElement | null>(null);
const envHeight = ref<string | null>(null);

let resizeObserver: ResizeObserver | null = null;

function measureEnvHeight() {
  const el = root.value;
  if (!el) return;

  const main = el.closest(".main");
  const home = el.closest(".VPHome");
  const features = home?.querySelector(".home-features-custom");
  if (!main || !features) return;

  const mainTop = main.getBoundingClientRect().top;
  const featuresTop = features.getBoundingClientRect().top;
  const height = Math.round(featuresTop - mainTop);
  if (height > 0) envHeight.value = `${height}px`;
}

onMounted(() => {
  measureEnvHeight();
  resizeObserver = new ResizeObserver(measureEnvHeight);
  const main = root.value?.closest(".main");
  const home = root.value?.closest(".VPHome");
  const hero = home?.querySelector(".VPHero");
  if (main) resizeObserver.observe(main);
  if (hero) resizeObserver.observe(hero);
  window.addEventListener("resize", measureEnvHeight);
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  window.removeEventListener("resize", measureEnvHeight);
});
</script>

<template>
  <div
    ref="root"
    class="site-sketch-decor hero-sketch-env"
    :style="envHeight ? { height: envHeight } : undefined"
    aria-hidden="true"
  >
    <img
      class="site-sketch-decor__img hero-sketch-env__img"
      :src="withBase('/decorative/hero-sketch/env.png')"
      alt=""
      draggable="false"
    />
  </div>
</template>

<style scoped>
.hero-sketch-env {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 0;
  width: min(300px, 34vw);
}

.hero-sketch-env__img {
  object-position: center bottom;
}

@media (max-width: 640px) {
  .hero-sketch-env {
    width: min(200px, 48vw);
  }

  .hero-sketch-env__img {
    opacity: 0.56;
  }
}
</style>
