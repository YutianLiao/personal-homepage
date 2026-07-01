<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const TokenizerDemo = defineAsyncComponent(
  () => import("./TokenizerDemo.vue")
);
</script>

<template>
  <TokenizerDemo />
</template>
