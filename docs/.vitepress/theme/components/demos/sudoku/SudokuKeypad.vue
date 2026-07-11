<script setup lang="ts">
import type { Digit } from "./engine/sudoku-engine";

defineProps<{
  noteMode: boolean;
  canUndo: boolean;
  disabled?: boolean;
  showSubmit?: boolean;
}>();

const emit = defineEmits<{
  digit: [d: Digit];
  erase: [];
  undo: [];
  toggleNotes: [];
  submit: [];
}>();

const digits: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
</script>

<template>
  <div class="sudoku-keypad" aria-label="数字键盘">
    <div class="sudoku-keypad__digits">
      <button
        v-for="d in digits"
        :key="d"
        type="button"
        class="sudoku-keypad__digit"
        :disabled="disabled"
        @click="emit('digit', d)"
      >
        {{ d }}
      </button>
    </div>
    <div class="sudoku-keypad__tools">
      <button
        type="button"
        class="sudoku-keypad__tool"
        :class="{ 'sudoku-keypad__tool--active': noteMode }"
        :disabled="disabled"
        :aria-pressed="noteMode"
        @click="emit('toggleNotes')"
      >
        笔记
      </button>
      <button
        type="button"
        class="sudoku-keypad__tool"
        :disabled="disabled"
        @click="emit('erase')"
      >
        擦除
      </button>
      <button
        type="button"
        class="sudoku-keypad__tool"
        :disabled="disabled || !canUndo"
        @click="emit('undo')"
      >
        撤销
      </button>
    </div>
    <button
      v-if="showSubmit"
      type="button"
      class="sudoku-keypad__submit"
      :disabled="disabled"
      @click="emit('submit')"
    >
      提交答案
    </button>
  </div>
</template>
