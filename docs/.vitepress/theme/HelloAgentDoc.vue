<script setup lang="ts">
import VPDoc from "vitepress/dist/client/theme-default/components/VPDoc.vue";
import HelloAgentDocMeta from "./components/HelloAgentDocMeta.vue";
import HelloAgentPager from "./components/HelloAgentPager.vue";
</script>

<template>
  <VPDoc>
    <template #aside-top>
      <HelloAgentDocMeta />
    </template>
    <template #doc-after>
      <HelloAgentPager />
    </template>
  </VPDoc>
</template>
