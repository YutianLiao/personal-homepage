<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import type { BoardTheme, PuzzleFull } from "./types";
import type { CellValue, Digit, NotesGrid } from "./engine/sudoku-engine";
import { formatTime } from "./composables/useSudokuRecords";
import SudokuGrid from "./SudokuGrid.vue";
import SudokuKeypad from "./SudokuKeypad.vue";

const props = defineProps<{
  puzzle: PuzzleFull;
  values: CellValue[];
  given: boolean[];
  notes: NotesGrid;
  selected: number;
  conflicts: Set<number>;
  related: Set<number>;
  selectedDigit: number;
  noteMode: boolean;
  canUndo: boolean;
  elapsedMs: number;
  finished: boolean;
  failed: boolean;
  locked: boolean;
  celebrating: boolean;
  isRepeat: boolean;
  theme: BoardTheme;
  submitWrong: Set<number>;
  submitEmpty: Set<number>;
}>();

const emit = defineEmits<{
  select: [index: number];
  digit: [d: Digit];
  erase: [];
  undo: [];
  toggleNotes: [];
  move: [dr: number, dc: number];
  "update:theme": [t: BoardTheme];
  abandon: [];
  submit: [];
}>();

const sourceLine = computed(() => {
  const p = props.puzzle;
  const parts = [p.sourceLabel, capitalize(p.difficulty)];
  if (p.rating != null) parts.push(`Rating ${p.rating}`);
  if (props.isRepeat) parts.push("重复挑战");
  return parts.join(" · ");
});

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function onKey(e: KeyboardEvent) {
  if (props.locked) return;
  const tag = (e.target as HTMLElement | null)?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

  if (e.key === "ArrowUp") {
    e.preventDefault();
    emit("move", -1, 0);
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    emit("move", 1, 0);
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    emit("move", 0, -1);
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    emit("move", 0, 1);
  } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
    e.preventDefault();
    emit("erase");
  } else if (e.key === "n" || e.key === "N") {
    e.preventDefault();
    emit("toggleNotes");
  } else if (e.key === "z" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    emit("undo");
  } else if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
    e.preventDefault();
    emit("submit");
  } else if (/^[1-9]$/.test(e.key)) {
    e.preventDefault();
    emit("digit", Number(e.key) as Digit);
  }
}

onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => window.removeEventListener("keydown", onKey));

function toggleTheme() {
  emit("update:theme", props.theme === "light" ? "midnight" : "light");
}
</script>

<template>
  <section
    class="sudoku-board sudoku-demo__panel"
    :class="[
      theme === 'midnight' ? 'sudoku-board--midnight' : 'sudoku-board--light',
      { 'sudoku-board--failed': failed },
    ]"
    aria-label="数独对局"
  >
    <header class="sudoku-board__head">
      <div class="sudoku-board__meta">
        <span class="sudoku-board__source">{{ sourceLine }}</span>
        <span class="sudoku-board__id" title="Puzzle ID">#{{ puzzle.id.slice(0, 8) }}</span>
      </div>
      <div class="sudoku-board__controls">
        <button type="button" class="sudoku-board__theme" @click="toggleTheme">
          {{ theme === "light" ? "Midnight" : "Light Ink" }}
        </button>
        <time class="sudoku-board__timer" :datetime="`PT${Math.floor(elapsedMs / 1000)}S`">
          {{ formatTime(elapsedMs) }}
        </time>
        <button
          v-if="!locked"
          type="button"
          class="sudoku-board__abandon"
          @click="emit('abandon')"
        >
          放弃
        </button>
      </div>
    </header>

    <div class="sudoku-board__grid-wrap">
      <SudokuGrid
        :values="values"
        :given="given"
        :notes="notes"
        :selected="selected"
        :conflicts="conflicts"
        :related="related"
        :selected-digit="selectedDigit"
        :celebrating="celebrating"
        :locked="locked"
        :submit-wrong="submitWrong"
        :submit-empty="submitEmpty"
        @select="emit('select', $event)"
      />
    </div>

    <SudokuKeypad
      :note-mode="noteMode"
      :can-undo="canUndo"
      :disabled="locked"
      :show-submit="!locked"
      @digit="emit('digit', $event)"
      @erase="emit('erase')"
      @undo="emit('undo')"
      @toggle-notes="emit('toggleNotes')"
      @submit="emit('submit')"
    />

    <p class="sudoku-board__keys" aria-hidden="true">
      方向键移动 · 1–9 填数 · N 笔记 · Enter 提交 · Backspace 擦除 · ⌘/Ctrl+Z 撤销
    </p>
  </section>
</template>
