<script setup lang="ts">
import { withBase } from "vitepress";
import { useDocAsideScientist } from "../composables/useDocAsideScientist";

const { scientist } = useDocAsideScientist();

function hideBroken(e: Event) {
  const el = e.target as HTMLImageElement;
  el.style.display = "none";
}
</script>

<template>
  <figure
    v-if="scientist"
    class="site-sketch-decor site-sketch-decor--aside doc-aside-scientist"
    aria-hidden="true"
  >
    <img
      class="site-sketch-decor__img"
      :src="withBase(scientist.image)"
      alt=""
      draggable="false"
      @error="hideBroken"
    />
  </figure>
</template>

<style scoped>
.doc-aside-scientist {
  width: min(100%, 9rem);
  margin-top: 1.35rem;
}
</style>
