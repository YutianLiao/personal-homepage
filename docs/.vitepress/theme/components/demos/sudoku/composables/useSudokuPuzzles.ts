import { ref, readonly } from "vue";
import type { Difficulty, PuzzleFull, PuzzleIndex } from "../types";

type ShardPuzzle = {
  id: string;
  puzzle: string;
  solution: string;
  source: string;
  sourceLabel: string;
  difficulty: Difficulty;
  rating?: number;
};

const shardCache = new Map<Difficulty, ShardPuzzle[]>();
const indexRef = ref<PuzzleIndex | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

async function loadIndex(): Promise<PuzzleIndex> {
  if (indexRef.value) return indexRef.value;
  loading.value = true;
  error.value = null;
  try {
    const mod = await import("../../../../data/sudoku/puzzle-index.json");
    indexRef.value = (mod.default ?? mod) as PuzzleIndex;
    return indexRef.value;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load puzzle index";
    throw e;
  } finally {
    loading.value = false;
  }
}

async function loadShard(diff: Difficulty): Promise<ShardPuzzle[]> {
  const cached = shardCache.get(diff);
  if (cached) return cached;
  loading.value = true;
  error.value = null;
  try {
    let mod;
    switch (diff) {
      case "easy":
        mod = await import("../../../../data/sudoku/puzzles-easy.json");
        break;
      case "medium":
        mod = await import("../../../../data/sudoku/puzzles-medium.json");
        break;
      case "hard":
        mod = await import("../../../../data/sudoku/puzzles-hard.json");
        break;
      case "expert":
        mod = await import("../../../../data/sudoku/puzzles-expert.json");
        break;
    }
    const list = (mod.default ?? mod) as ShardPuzzle[];
    shardCache.set(diff, list);
    return list;
  } catch (e) {
    error.value = e instanceof Error ? e.message : `Failed to load ${diff} puzzles`;
    throw e;
  } finally {
    loading.value = false;
  }
}

function toFull(p: ShardPuzzle): PuzzleFull {
  return {
    id: p.id,
    puzzle: p.puzzle,
    solution: p.solution,
    source: p.source,
    sourceLabel: p.sourceLabel,
    difficulty: p.difficulty,
    rating: p.rating,
    shard: p.difficulty,
  };
}

function pickRandom<T>(arr: T[]): T | null {
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useSudokuPuzzles() {
  async function ensureIndex() {
    return loadIndex();
  }

  async function pickNewPuzzle(
    difficulty: Difficulty | "all",
    completedIds: Set<string>
  ): Promise<{ puzzle: PuzzleFull; repeat: boolean }> {
    await loadIndex();
    const diffs: Difficulty[] =
      difficulty === "all" ? ["easy", "medium", "hard", "expert"] : [difficulty];

    // Prefer unfinished puzzles
    for (const d of shuffle(diffs)) {
      const shard = await loadShard(d);
      const fresh = shard.filter((p) => !completedIds.has(p.id));
      const chosen = pickRandom(fresh.length ? fresh : shard);
      if (chosen) {
        return { puzzle: toFull(chosen), repeat: completedIds.has(chosen.id) };
      }
    }
    throw new Error("No puzzles available");
  }

  async function loadPuzzleById(
    id: string,
    hintDifficulty?: Difficulty
  ): Promise<PuzzleFull | null> {
    await loadIndex();
    const order: Difficulty[] = hintDifficulty
      ? [hintDifficulty, "easy", "medium", "hard", "expert"]
      : ["easy", "medium", "hard", "expert"];
    const seen = new Set<Difficulty>();
    for (const d of order) {
      if (seen.has(d)) continue;
      seen.add(d);
      const shard = await loadShard(d);
      const found = shard.find((p) => p.id === id);
      if (found) return toFull(found);
    }
    return null;
  }

  return {
    index: readonly(indexRef),
    loading: readonly(loading),
    error: readonly(error),
    ensureIndex,
    pickNewPuzzle,
    loadPuzzleById,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
