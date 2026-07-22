<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";

const props = defineProps<{
  name: "sudoku" | "mobius" | "geometry";
}>();

const sources = {
  sudoku: "/decorative/sudoku-watermark.svg",
  mobius: "/decorative/mobius-watermark.svg",
  geometry: "/decorative/geometry-watermark.svg"
} as const;

const src = computed(() => withBase(sources[props.name]));
</script>

<template>
  <div class="home-math-piece" :class="`home-math-piece--${name}`" aria-hidden="true">
    <div class="home-math-piece__art" :style="{ backgroundImage: `url(${src})` }" />
  </div>
</template>
