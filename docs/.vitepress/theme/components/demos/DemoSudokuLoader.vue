<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const SudokuDemo = defineAsyncComponent(
  () => import("./sudoku/SudokuDemo.vue")
);
</script>

<template>
  <SudokuDemo />
</template>
