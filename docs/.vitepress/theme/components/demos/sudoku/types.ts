export type Difficulty = "easy" | "medium" | "hard" | "expert";

export type DemoPhase = "login" | "lobby" | "playing" | "completed";

export type BoardTheme = "light" | "midnight";

export interface PuzzleMeta {
  id: string;
  source: string;
  sourceLabel: string;
  difficulty: Difficulty;
  rating?: number;
  shard: Difficulty;
}

export interface PuzzleFull extends PuzzleMeta {
  puzzle: string;
  solution: string;
}

export interface CompletionHistoryEntry {
  id: string;
  puzzleId: string;
  difficulty: Difficulty;
  startedAt: string;
  durationMs: number;
}

export interface PuzzleRecord {
  puzzleId: string;
  source: string;
  sourceLabel: string;
  difficulty: Difficulty;
  bestTimeMs: number;
  attempts: number;
  lastCompletedAt: string;
}

export interface PuzzleIndex {
  version: number;
  total: number;
  generatedAt: string;
  sources: Array<{ id: string; label: string; license: string; url: string }>;
  difficulties: Record<string, number>;
  shards: Record<string, string>;
}

export interface CompleteResult {
  timeMs: number;
  isNewBest: boolean;
  previousBestMs: number | null;
  puzzle: PuzzleFull;
}
