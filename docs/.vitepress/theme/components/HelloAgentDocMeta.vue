<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";

const { page } = useData();
const label = computed(() => (page.value as { readingTime?: string }).readingTime ?? "");
</script>

<template>
  <p v-if="label" class="hello-agent-reading-time" aria-label="建议阅读时间">
    建议阅读 · {{ label }}
  </p>
</template>
