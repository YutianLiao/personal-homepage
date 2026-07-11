<script setup lang="ts">
import { ref } from "vue";
import type { Difficulty } from "./types";

const props = defineProps<{
  completedCount: number;
  puzzleCount?: number;
  loading?: boolean;
}>();

const emit = defineEmits<{
  newChallenge: [difficulty: Difficulty | "all"];
  historyChallenge: [];
}>();

const difficulty = ref<Difficulty | "all">("all");

const options: Array<{ value: Difficulty | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
];
</script>

<template>
  <section class="sudoku-lobby sudoku-demo__panel" aria-label="挑战大厅">
    <header class="sudoku-lobby__head">
      <h3 class="sudoku-demo__panel-title">Challenge</h3>
      <span class="sudoku-lobby__meta">已完成 {{ props.completedCount }} 题</span>
    </header>

    <p v-if="props.puzzleCount" class="sudoku-lobby__bank">
      题库 {{ props.puzzleCount.toLocaleString() }} 题
    </p>

    <div class="sudoku-lobby__diff">
      <span class="sudoku-demo__label">难度</span>
      <div class="sudoku-lobby__chips" role="group" aria-label="难度筛选">
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          class="sudoku-lobby__chip"
          :class="{ 'sudoku-lobby__chip--active': difficulty === opt.value }"
          @click="difficulty = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div class="sudoku-lobby__actions">
      <button
        type="button"
        class="sudoku-lobby__btn sudoku-lobby__btn--primary"
        :disabled="props.loading"
        @click="emit('newChallenge', difficulty)"
      >
        挑战新题
      </button>
      <button
        type="button"
        class="sudoku-lobby__btn"
        :disabled="props.loading || props.completedCount === 0"
        :title="props.completedCount === 0 ? '先完成一题后再挑战历史' : undefined"
        @click="emit('historyChallenge')"
      >
        历史挑战
      </button>
    </div>
  </section>
</template>
