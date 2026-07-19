<script setup lang="ts">
import VPDoc from "vitepress/dist/client/theme-default/components/VPDoc.vue";
import LearningModuleDocMeta from "./components/LearningModuleDocMeta.vue";
import LearningModulePager from "./components/LearningModulePager.vue";
import ModuleTopNav from "./components/ModuleTopNav.vue";
import DocAsideScientistSketch from "./components/DocAsideScientistSketch.vue";
</script>

<template>
  <VPDoc>
    <template #doc-before>
      <ModuleTopNav />
    </template>
    <template #aside-top>
      <LearningModuleDocMeta />
    </template>
    <template #aside-outline-after>
      <DocAsideScientistSketch />
    </template>
    <template #doc-after>
      <LearningModulePager />
    </template>
  </VPDoc>
</template>
