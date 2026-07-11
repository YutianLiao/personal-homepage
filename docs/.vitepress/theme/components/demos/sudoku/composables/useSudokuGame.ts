import { computed, onBeforeUnmount, ref, shallowRef } from "vue";
import type { PuzzleFull } from "../types";
import {
  UndoStack,
  cloneNotes,
  emptyNotes,
  getAllConflictSet,
  getSubmitIssues,
  parseGrid,
  relatedIndices,
  restoreBoard,
  type CellValue,
  type Digit,
  type NotesGrid,
} from "../engine/sudoku-engine";

export function useSudokuGame() {
  const puzzle = shallowRef<PuzzleFull | null>(null);
  const given = shallowRef<boolean[]>([]);
  const values = ref<CellValue[]>([]);
  const notes = shallowRef<NotesGrid>(emptyNotes());
  const selected = ref(0);
  const noteMode = ref(false);
  const startedAt = ref<number | null>(null);
  const elapsedMs = ref(0);
  const finished = ref(false);
  const failed = ref(false);
  const celebrating = ref(false);
  const isRepeat = ref(false);
  const submitWrong = ref<Set<number>>(new Set());
  const submitEmpty = ref<Set<number>>(new Set());

  const undo = new UndoStack(50);
  let tickTimer: ReturnType<typeof setInterval> | null = null;

  const conflicts = computed(() => getAllConflictSet(values.value));
  const related = computed(() => {
    if (selected.value < 0) return new Set<number>();
    return new Set(relatedIndices(selected.value));
  });
  const selectedDigit = computed(() => values.value[selected.value] || 0);
  const canUndo = computed(() => undo.canUndo);
  const locked = computed(() => finished.value || failed.value);
  const isPlaying = computed(() => !!puzzle.value && !finished.value && !failed.value);

  function stopTick() {
    if (tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
  }

  function startTick() {
    stopTick();
    tickTimer = setInterval(() => {
      if (startedAt.value !== null && !locked.value) {
        elapsedMs.value = Date.now() - startedAt.value;
      }
    }, 50);
  }

  function clearSubmitMarks() {
    submitWrong.value = new Set();
    submitEmpty.value = new Set();
  }

  function reset() {
    stopTick();
    puzzle.value = null;
    given.value = [];
    values.value = [];
    notes.value = emptyNotes();
    selected.value = 0;
    noteMode.value = false;
    startedAt.value = null;
    elapsedMs.value = 0;
    finished.value = false;
    failed.value = false;
    celebrating.value = false;
    isRepeat.value = false;
    clearSubmitMarks();
    undo.clear();
  }

  function start(p: PuzzleFull, repeat = false) {
    reset();
    const grid = parseGrid(p.puzzle);
    puzzle.value = p;
    given.value = grid.map((v) => v !== 0);
    values.value = grid;
    notes.value = emptyNotes();
    selected.value = grid.findIndex((v) => v === 0);
    if (selected.value < 0) selected.value = 0;
    isRepeat.value = repeat;
    startedAt.value = Date.now();
    elapsedMs.value = 0;
    startTick();
  }

  function retrySamePuzzle() {
    if (!puzzle.value) return;
    start(puzzle.value, isRepeat.value);
  }

  function pushUndo() {
    undo.push(values.value, notes.value);
  }

  function applyDigit(digit: Digit | 0) {
    if (!puzzle.value || locked.value) return;
    const i = selected.value;
    if (given.value[i]) return;
    pushUndo();
    if (noteMode.value && digit !== 0) {
      const next = cloneNotes(notes.value);
      if (next[i].has(digit)) next[i].delete(digit);
      else next[i].add(digit);
      notes.value = next;
      const vals = values.value.slice();
      vals[i] = 0;
      values.value = vals;
    } else {
      const vals = values.value.slice();
      vals[i] = digit;
      values.value = vals;
      const next = cloneNotes(notes.value);
      next[i].clear();
      if (digit !== 0) {
        for (const j of relatedIndices(i)) {
          next[j].delete(digit);
        }
      }
      notes.value = next;
    }
  }

  function erase() {
    applyDigit(0);
  }

  function undoMove() {
    if (!undo.canUndo || locked.value) return;
    const snap = undo.pop();
    if (!snap) return;
    const restored = restoreBoard(snap);
    values.value = restored.values;
    notes.value = restored.notes;
  }

  function submit(): "success" | "fail" {
    if (!puzzle.value || locked.value) return "fail";
    const issues = getSubmitIssues(values.value, puzzle.value.solution, given.value);
    if (issues.wrong.size === 0 && issues.empty.size === 0) {
      finished.value = true;
      failed.value = false;
      clearSubmitMarks();
      if (startedAt.value !== null) {
        elapsedMs.value = Date.now() - startedAt.value;
      }
      stopTick();
      celebrating.value = true;
      return "success";
    }
    failed.value = true;
    submitWrong.value = issues.wrong;
    submitEmpty.value = issues.empty;
    if (startedAt.value !== null) {
      elapsedMs.value = Date.now() - startedAt.value;
    }
    stopTick();
    return "fail";
  }

  function moveSelection(dr: number, dc: number) {
    if (locked.value) return;
    const r = Math.floor(selected.value / 9);
    const c = selected.value % 9;
    const nr = Math.max(0, Math.min(8, r + dr));
    const nc = Math.max(0, Math.min(8, c + dc));
    selected.value = nr * 9 + nc;
  }

  function selectCell(i: number) {
    if (locked.value) return;
    selected.value = i;
  }

  function toggleNoteMode() {
    if (locked.value) return;
    noteMode.value = !noteMode.value;
  }

  onBeforeUnmount(() => {
    reset();
  });

  return {
    puzzle,
    given,
    values,
    notes,
    selected,
    noteMode,
    startedAt,
    elapsedMs,
    finished,
    failed,
    celebrating,
    isRepeat,
    submitWrong,
    submitEmpty,
    locked,
    conflicts,
    related,
    selectedDigit,
    canUndo,
    isPlaying,
    start,
    reset,
    retrySamePuzzle,
    submit,
    applyDigit,
    erase,
    undoMove,
    moveSelection,
    selectCell,
    toggleNoteMode,
  };
}
