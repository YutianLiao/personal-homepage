export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type CellValue = 0 | Digit;
export type NotesGrid = Array<Set<Digit>>;

export interface BoardSnapshot {
  values: CellValue[];
  notes: Array<Digit[]>;
}

export function parseGrid(s: string): CellValue[] {
  const cleaned = s.replace(/[^0-9.]/g, "").replace(/0/g, ".").slice(0, 81);
  if (cleaned.length !== 81) {
    throw new Error("Invalid puzzle length");
  }
  return cleaned.split("").map((c) => (c === "." ? 0 : (Number(c) as Digit)));
}

export function gridToString(values: CellValue[]): string {
  return values.map((v) => (v === 0 ? "." : String(v))).join("");
}

export function emptyNotes(): NotesGrid {
  return Array.from({ length: 81 }, () => new Set<Digit>());
}

export function cloneNotes(notes: NotesGrid): NotesGrid {
  return notes.map((set) => new Set(set));
}

export function snapshotBoard(values: CellValue[], notes: NotesGrid): BoardSnapshot {
  return {
    values: values.slice(),
    notes: notes.map((set) => Array.from(set).sort((a, b) => a - b) as Digit[]),
  };
}

export function restoreBoard(snap: BoardSnapshot): { values: CellValue[]; notes: NotesGrid } {
  return {
    values: snap.values.slice(),
    notes: snap.notes.map((arr) => new Set(arr)),
  };
}

export function cellIndex(row: number, col: number): number {
  return row * 9 + col;
}

export function rowOf(i: number): number {
  return Math.floor(i / 9);
}

export function colOf(i: number): number {
  return i % 9;
}

export function boxOf(i: number): number {
  return Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3);
}

/** Indices that conflict with cell i (same digit in row/col/box). */
export function getConflictIndices(values: CellValue[], i: number): number[] {
  const v = values[i];
  if (!v) return [];
  const conflicts: number[] = [];
  const r = rowOf(i);
  const c = colOf(i);
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let k = 0; k < 9; k++) {
    const ri = r * 9 + k;
    const ci = k * 9 + c;
    const bi = (br + Math.floor(k / 3)) * 9 + (bc + (k % 3));
    for (const j of [ri, ci, bi]) {
      if (j !== i && values[j] === v && !conflicts.includes(j)) {
        conflicts.push(j);
      }
    }
  }
  return conflicts;
}

export function getAllConflictSet(values: CellValue[]): Set<number> {
  const set = new Set<number>();
  for (let i = 0; i < 81; i++) {
    if (!values[i]) continue;
    const conf = getConflictIndices(values, i);
    if (conf.length) {
      set.add(i);
      for (const j of conf) set.add(j);
    }
  }
  return set;
}

export function isFilled(values: CellValue[]): boolean {
  return values.every((v) => v !== 0);
}

export function matchesSolution(values: CellValue[], solution: string): boolean {
  const sol = parseGrid(solution);
  for (let i = 0; i < 81; i++) {
    if (values[i] !== sol[i]) return false;
  }
  return true;
}

export function isComplete(values: CellValue[], solution: string): boolean {
  return isFilled(values) && matchesSolution(values, solution);
}

export function getSubmitIssues(
  values: CellValue[],
  solution: string,
  given: boolean[]
): { wrong: Set<number>; empty: Set<number> } {
  const sol = parseGrid(solution);
  const wrong = new Set<number>();
  const empty = new Set<number>();
  for (let i = 0; i < 81; i++) {
    if (given[i]) continue;
    if (values[i] === 0) empty.add(i);
    else if (values[i] !== sol[i]) wrong.add(i);
  }
  return { wrong, empty };
}

export function relatedIndices(i: number): number[] {
  const out: number[] = [];
  const r = rowOf(i);
  const c = colOf(i);
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let k = 0; k < 9; k++) {
    out.push(r * 9 + k, k * 9 + c, (br + Math.floor(k / 3)) * 9 + (bc + (k % 3)));
  }
  return [...new Set(out)].filter((j) => j !== i);
}

export class UndoStack {
  private stack: BoardSnapshot[] = [];
  private readonly max: number;

  constructor(max = 50) {
    this.max = max;
  }

  push(values: CellValue[], notes: NotesGrid) {
    this.stack.push(snapshotBoard(values, notes));
    if (this.stack.length > this.max) this.stack.shift();
  }

  pop(): BoardSnapshot | null {
    return this.stack.pop() ?? null;
  }

  clear() {
    this.stack = [];
  }

  get canUndo() {
    return this.stack.length > 0;
  }
}
