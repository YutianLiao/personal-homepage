<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const KnowledgePlanet = defineAsyncComponent(
  () => import("./KnowledgePlanet.vue")
);
</script>

<template>
  <KnowledgePlanet />
</template>
