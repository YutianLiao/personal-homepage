<script setup lang="ts">
import { withBase } from "vitepress";

function hideBroken(e: Event) {
  const el = e.target as HTMLImageElement;
  el.style.display = "none";
}
</script>

<template>
  <div class="home-university-marks" aria-hidden="true">
    <img
      class="home-university-marks__crest home-university-marks__crest--warwick"
      :src="withBase('/decorative/university/warwick.svg')"
      alt=""
      draggable="false"
      @error="hideBroken"
    />
    <img
      class="home-university-marks__crest home-university-marks__crest--tum"
      :src="withBase('/decorative/university/tum.svg')"
      alt=""
      draggable="false"
      @error="hideBroken"
    />
  </div>
</template>
