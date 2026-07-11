<script setup lang="ts">
import { computed, ref } from "vue";
import type { CellValue, Digit, NotesGrid } from "./engine/sudoku-engine";
import { relatedIndices } from "./engine/sudoku-engine";

const props = defineProps<{
  values: CellValue[];
  given: boolean[];
  notes: NotesGrid;
  selected: number;
  conflicts: Set<number>;
  related: Set<number>;
  selectedDigit: number;
  celebrating?: boolean;
  locked?: boolean;
  submitWrong?: Set<number>;
  submitEmpty?: Set<number>;
}>();

const emit = defineEmits<{
  select: [index: number];
}>();

const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const hovered = ref(-1);

function cellClass(i: number) {
  const r = Math.floor(i / 9);
  const c = i % 9;
  const hoverBand =
    !props.locked &&
    hovered.value >= 0 &&
    (hovered.value === i || relatedIndices(hovered.value).includes(i));

  return {
    "sudoku-grid__cell--given": props.given[i],
    "sudoku-grid__cell--selected": !props.locked && props.selected === i,
    "sudoku-grid__cell--related": props.related.has(i) && props.selected !== i,
    "sudoku-grid__cell--hover-band": hoverBand && props.selected !== i,
    "sudoku-grid__cell--conflict": props.conflicts.has(i),
    "sudoku-grid__cell--same-digit":
      props.selectedDigit > 0 &&
      props.values[i] === props.selectedDigit &&
      props.selected !== i,
    "sudoku-grid__cell--box-r": r % 3 === 2 && r < 8,
    "sudoku-grid__cell--box-c": c % 3 === 2 && c < 8,
    "sudoku-grid__cell--celebrate": props.celebrating,
    "sudoku-grid__cell--locked": props.locked,
    "sudoku-grid__cell--submit-wrong": props.submitWrong?.has(i),
    "sudoku-grid__cell--submit-empty": props.submitEmpty?.has(i),
  };
}

const noteLists = computed(() =>
  props.notes.map((set) => DIGITS.filter((d) => set.has(d)))
);

function onCellEnter(i: number) {
  if (props.locked) return;
  hovered.value = i;
}

function onGridLeave() {
  hovered.value = -1;
}

function onSelect(i: number) {
  if (props.locked) return;
  emit("select", i);
}
</script>

<template>
  <div
    class="sudoku-grid"
    role="grid"
    aria-label="数独棋盘"
    aria-rowcount="9"
    aria-colcount="9"
    @mouseleave="onGridLeave"
  >
    <button
      v-for="i in 81"
      :key="i - 1"
      type="button"
      class="sudoku-grid__cell"
      :class="cellClass(i - 1)"
      role="gridcell"
      :aria-rowindex="Math.floor((i - 1) / 9) + 1"
      :aria-colindex="((i - 1) % 9) + 1"
      :aria-selected="selected === i - 1"
      :disabled="locked"
      :style="{ '--cell-i': String(i - 1) }"
      @click="onSelect(i - 1)"
      @mouseenter="onCellEnter(i - 1)"
      @focus="onCellEnter(i - 1)"
    >
      <span v-if="values[i - 1]" class="sudoku-grid__digit">{{ values[i - 1] }}</span>
      <span v-else-if="noteLists[i - 1].length" class="sudoku-grid__notes" aria-hidden="true">
        <span
          v-for="d in DIGITS"
          :key="d"
          class="sudoku-grid__note"
          :class="{ 'sudoku-grid__note--on': noteLists[i - 1].includes(d) }"
        >
          {{ noteLists[i - 1].includes(d) ? d : "" }}
        </span>
      </span>
    </button>
  </div>
</template>
