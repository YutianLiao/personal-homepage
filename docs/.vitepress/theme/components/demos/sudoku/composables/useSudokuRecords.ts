import { computed, ref, readonly } from "vue";
import type { CompletionHistoryEntry, Difficulty, PuzzleFull, PuzzleRecord } from "../types";
import {
  createSyncFile,
  downloadBundle,
  getLinkedFileName,
  getStorageMode,
  importBundleFromFile,
  linkSyncFile,
  mergeBundles,
  readLinkedFileBundle,
  setStorageMode,
  supportsFileSync,
  unlinkSyncFile,
  writeLinkedFileBundle,
  type SudokuPersistedBundle,
  type SudokuStorageMode,
} from "./sudoku-storage";

const STORAGE_KEY = "sudoku-records-v1";
const HISTORY_KEY = "sudoku-history-v1";
const MAX_HISTORY = 500;

function loadAllLocal(): Record<string, PuzzleRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, PuzzleRecord>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function loadHistoryLocal(): CompletionHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CompletionHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAllLocal(map: Record<string, PuzzleRecord>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota */
  }
}

function saveHistoryLocal(list: CompletionHistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)));
  } catch {
    /* ignore quota */
  }
}

function toBundle(
  records: Record<string, PuzzleRecord>,
  history: CompletionHistoryEntry[]
): SudokuPersistedBundle {
  return { version: 1, records, history: history.slice(0, MAX_HISTORY) };
}

const recordsMap = ref<Record<string, PuzzleRecord>>(
  typeof window !== "undefined" ? loadAllLocal() : {}
);

const historyList = ref<CompletionHistoryEntry[]>(
  typeof window !== "undefined" ? loadHistoryLocal() : []
);

const storageMode = ref<SudokuStorageMode>(
  typeof window !== "undefined" ? getStorageMode() : "local"
);

const linkedFileName = ref<string | null>(null);
const storageMessage = ref("");

async function persist() {
  saveAllLocal(recordsMap.value);
  saveHistoryLocal(historyList.value);
  if (storageMode.value === "file") {
    const ok = await writeLinkedFileBundle(toBundle(recordsMap.value, historyList.value));
    if (!ok) storageMessage.value = "同步文件写入失败，数据已保存在浏览器本地。";
  }
}

async function applyBundle(bundle: SudokuPersistedBundle, persistAfter = true) {
  recordsMap.value = bundle.records;
  historyList.value = bundle.history.slice(0, MAX_HISTORY);
  if (persistAfter) await persist();
}

export function useSudokuRecords() {
  async function refresh() {
    recordsMap.value = loadAllLocal();
    historyList.value = loadHistoryLocal();
    storageMode.value = getStorageMode();
    linkedFileName.value = await getLinkedFileName();

    if (storageMode.value === "file") {
      const remote = await readLinkedFileBundle();
      if (remote) {
        const merged = mergeBundles(
          toBundle(recordsMap.value, historyList.value),
          remote
        );
        await applyBundle(merged, true);
        storageMessage.value = "已从同步文件读取并合并数据。";
      } else if (linkedFileName.value) {
        storageMessage.value = "无法读取同步文件，暂时使用浏览器本地数据。";
      }
    }
  }

  const records = computed(() => Object.values(recordsMap.value));

  const completionHistory = computed(() =>
    [...historyList.value].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    )
  );

  const completedIds = computed(() => new Set(Object.keys(recordsMap.value)));

  const totalCompleted = computed(() => records.value.length);

  const globalBestMs = computed(() => {
    if (!records.value.length) return null;
    return Math.min(...records.value.map((r) => r.bestTimeMs));
  });

  const averageMs = computed(() => {
    if (!records.value.length) return null;
    const sum = records.value.reduce((a, r) => a + r.bestTimeMs, 0);
    return Math.round(sum / records.value.length);
  });

  const byDifficulty = computed(() => {
    const out: Record<Difficulty, number> = {
      easy: 0,
      medium: 0,
      hard: 0,
      expert: 0,
    };
    for (const r of records.value) {
      if (out[r.difficulty] !== undefined) out[r.difficulty]++;
    }
    return out;
  });

  function getRecord(puzzleId: string): PuzzleRecord | null {
    return recordsMap.value[puzzleId] ?? null;
  }

  async function recordCompletion(
    puzzle: PuzzleFull,
    timeMs: number,
    startedAtMs: number | null
  ): Promise<{ isNewBest: boolean; previousBestMs: number | null }> {
    const prev = recordsMap.value[puzzle.id] ?? null;
    const previousBestMs = prev?.bestTimeMs ?? null;
    const isNewBest = previousBestMs === null || timeMs < previousBestMs;
    const next: PuzzleRecord = {
      puzzleId: puzzle.id,
      source: puzzle.source,
      sourceLabel: puzzle.sourceLabel,
      difficulty: puzzle.difficulty,
      bestTimeMs: isNewBest ? timeMs : (previousBestMs as number),
      attempts: (prev?.attempts ?? 0) + 1,
      lastCompletedAt: new Date().toISOString(),
    };
    recordsMap.value = { ...recordsMap.value, [puzzle.id]: next };

    const startedAt =
      startedAtMs != null
        ? new Date(startedAtMs).toISOString()
        : new Date(Date.now() - timeMs).toISOString();
    const historyEntry: CompletionHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      puzzleId: puzzle.id,
      difficulty: puzzle.difficulty,
      startedAt,
      durationMs: timeMs,
    };
    historyList.value = [historyEntry, ...historyList.value].slice(0, MAX_HISTORY);
    await persist();

    return { isNewBest, previousBestMs };
  }

  function pickRandomCompletedId(): string | null {
    const ids = Object.keys(recordsMap.value);
    if (!ids.length) return null;
    return ids[Math.floor(Math.random() * ids.length)];
  }

  async function bindSyncFile() {
    const res = await linkSyncFile();
    storageMessage.value = res.message;
    if (res.ok) {
      storageMode.value = "file";
      linkedFileName.value = await getLinkedFileName();
      await persist();
    }
    return res.ok;
  }

  async function bindNewSyncFile() {
    const res = await createSyncFile();
    storageMessage.value = res.message;
    if (res.ok) {
      storageMode.value = "file";
      linkedFileName.value = await getLinkedFileName();
      await persist();
    }
    return res.ok;
  }

  async function unbindSyncFile() {
    await unlinkSyncFile();
    storageMode.value = "local";
    linkedFileName.value = null;
    storageMessage.value = "已切换为仅本地浏览器存储。";
  }

  function exportData() {
    downloadBundle(toBundle(recordsMap.value, historyList.value));
    storageMessage.value = "已导出备份文件。";
  }

  async function importData(file: File, mode: "replace" | "merge") {
    const incoming = await importBundleFromFile(file, mode);
    if (!incoming) {
      storageMessage.value = "导入失败：文件格式无效。";
      return false;
    }
    if (mode === "replace") {
      await applyBundle(incoming, true);
    } else {
      const merged = mergeBundles(
        toBundle(recordsMap.value, historyList.value),
        incoming
      );
      await applyBundle(merged, true);
    }
    storageMessage.value = mode === "replace" ? "已用文件覆盖本地数据。" : "已合并导入文件。";
    return true;
  }

  return {
    records: readonly(records),
    recordsMap: readonly(recordsMap),
    completionHistory: readonly(completionHistory),
    completedIds,
    totalCompleted,
    globalBestMs,
    averageMs,
    byDifficulty,
    storageMode: readonly(storageMode),
    linkedFileName: readonly(linkedFileName),
    storageMessage: readonly(storageMessage),
    supportsFileSync,
    getRecord,
    recordCompletion,
    pickRandomCompletedId,
    refresh,
    bindSyncFile,
    bindNewSyncFile,
    unbindSyncFile,
    exportData,
    importData,
  };
}

export function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const cs = Math.floor((ms % 1000) / 10);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h}:${String(mm).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

export function formatTimeShort(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${tenths}`;
}

export function formatDurationHuman(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min > 0 && sec === 0) return `${min} 分钟`;
  if (min > 0) return `${min} 分 ${sec} 秒`;
  return `${sec} 秒`;
}

export function formatStartTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
