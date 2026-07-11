import type { CompletionHistoryEntry, PuzzleRecord } from "../types";

export type SudokuStorageMode = "local" | "file";

export interface SudokuPersistedBundle {
  version: 1;
  records: Record<string, PuzzleRecord>;
  history: CompletionHistoryEntry[];
}

const MODE_KEY = "sudoku-storage-mode-v1";
const IDB_NAME = "sudoku-lab-db";
const IDB_STORE = "kv";
const FILE_HANDLE_KEY = "syncFileHandle";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function getStorageMode(): SudokuStorageMode {
  try {
    const raw = localStorage.getItem(MODE_KEY);
    return raw === "file" ? "file" : "local";
  } catch {
    return "local";
  }
}

export function setStorageMode(mode: SudokuStorageMode) {
  localStorage.setItem(MODE_KEY, mode);
}

export function supportsFileSync(): boolean {
  return typeof window !== "undefined" && "showOpenFilePicker" in window;
}

async function getLinkedFileHandle(): Promise<FileSystemFileHandle | null> {
  if (!supportsFileSync()) return null;
  const handle = await idbGet<FileSystemFileHandle>(FILE_HANDLE_KEY);
  return handle ?? null;
}

async function readBundleFromHandle(
  handle: FileSystemFileHandle
): Promise<SudokuPersistedBundle | null> {
  try {
    const file = await handle.getFile();
    const text = await file.text();
    const parsed = JSON.parse(text) as SudokuPersistedBundle;
    if (parsed?.version !== 1 || typeof parsed.records !== "object" || !Array.isArray(parsed.history)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function readLinkedFileBundle(): Promise<SudokuPersistedBundle | null> {
  const handle = await getLinkedFileHandle();
  if (!handle) return null;
  return readBundleFromHandle(handle);
}

export async function writeLinkedFileBundle(bundle: SudokuPersistedBundle): Promise<boolean> {
  const handle = await getLinkedFileHandle();
  if (!handle) return false;
  try {
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(bundle, null, 2));
    await writable.close();
    return true;
  } catch {
    return false;
  }
}

export async function linkSyncFile(): Promise<{ ok: boolean; message: string }> {
  if (!supportsFileSync()) {
    return { ok: false, message: "当前浏览器不支持文件同步，请使用 Chrome / Edge。" };
  }
  try {
    const [handle] = await (window as Window & {
      showOpenFilePicker: (opts: object) => Promise<FileSystemFileHandle[]>;
    }).showOpenFilePicker({
      types: [
        {
          description: "Sudoku Lab 数据",
          accept: { "application/json": [".json"] },
        },
      ],
      multiple: false,
    });
    await idbSet(FILE_HANDLE_KEY, handle);
    setStorageMode("file");
    return { ok: true, message: `已绑定文件：${handle.name}` };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return { ok: false, message: "已取消选择文件" };
    }
    return { ok: false, message: e instanceof Error ? e.message : "绑定失败" };
  }
}

export async function createSyncFile(): Promise<{ ok: boolean; message: string }> {
  if (!supportsFileSync()) {
    return { ok: false, message: "当前浏览器不支持文件同步，请使用 Chrome / Edge。" };
  }
  try {
    const handle = await (window as Window & {
      showSaveFilePicker: (opts: object) => Promise<FileSystemFileHandle>;
    }).showSaveFilePicker({
      suggestedName: "sudoku-lab-data.json",
      types: [
        {
          description: "Sudoku Lab 数据",
          accept: { "application/json": [".json"] },
        },
      ],
    });
    await idbSet(FILE_HANDLE_KEY, handle);
    setStorageMode("file");
    return { ok: true, message: `已创建并绑定：${handle.name}` };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return { ok: false, message: "已取消创建文件" };
    }
    return { ok: false, message: e instanceof Error ? e.message : "创建失败" };
  }
}

export async function unlinkSyncFile() {
  await idbDelete(FILE_HANDLE_KEY);
  setStorageMode("local");
}

export async function getLinkedFileName(): Promise<string | null> {
  const handle = await getLinkedFileHandle();
  return handle?.name ?? null;
}

export function downloadBundle(bundle: SudokuPersistedBundle, filename = "sudoku-lab-data.json") {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importBundleFromFile(
  file: File,
  mode: "replace" | "merge"
): Promise<SudokuPersistedBundle | null> {
  try {
    const text = await file.text();
    const incoming = JSON.parse(text) as SudokuPersistedBundle;
    if (incoming?.version !== 1) return null;
    if (mode === "replace") return incoming;

    const records = { ...incoming.records };
    const historyIds = new Set(incoming.history.map((h) => h.id));
    return {
      version: 1,
      records,
      history: incoming.history,
    };
  } catch {
    return null;
  }
}

export function mergeBundles(
  local: SudokuPersistedBundle,
  remote: SudokuPersistedBundle
): SudokuPersistedBundle {
  const records = { ...local.records, ...remote.records };
  for (const [id, rec] of Object.entries(remote.records)) {
    const prev = local.records[id];
    if (!prev || rec.bestTimeMs < prev.bestTimeMs) {
      records[id] = rec;
    } else if (prev) {
      records[id] = {
        ...prev,
        attempts: Math.max(prev.attempts, rec.attempts),
      };
    }
  }

  const seen = new Set<string>();
  const history = [...local.history, ...remote.history]
    .filter((h) => {
      if (seen.has(h.id)) return false;
      seen.add(h.id);
      return true;
    })
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 500);

  return { version: 1, records, history };
}
