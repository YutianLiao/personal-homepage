<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";

const props = defineProps<{
  name: "sudoku" | "ramsey" | "formulas";
}>();

const sources = {
  sudoku: "/decorative/sudoku-watermark.svg",
  ramsey: "/decorative/ramsey-r45-watermark.svg",
  formulas: "/decorative/math-watermark.svg"
} as const;

const src = computed(() => withBase(sources[props.name]));
</script>

<template>
  <div class="home-math-piece" :class="`home-math-piece--${name}`" aria-hidden="true">
    <div class="home-math-piece__art" :style="{ backgroundImage: `url(${src})` }" />
  </div>
</template>
