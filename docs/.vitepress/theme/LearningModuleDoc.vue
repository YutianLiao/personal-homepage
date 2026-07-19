<script setup lang="ts">
import VPDoc from "vitepress/dist/client/theme-default/components/VPDoc.vue";
import LearningModuleChapterNav from "./components/LearningModuleChapterNav.vue";
import LearningModuleDocMeta from "./components/LearningModuleDocMeta.vue";
import LearningModulePager from "./components/LearningModulePager.vue";
</script>

<template>
  <VPDoc>
    <template #doc-before>
      <header class="learning-module-doc-header">
        <LearningModuleChapterNav />
        <LearningModuleDocMeta />
      </header>
    </template>
    <template #doc-after>
      <LearningModulePager />
    </template>
  </VPDoc>
</template>
