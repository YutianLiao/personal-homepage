/**
 * Merge open Sudoku banks into indexed shards for the Sudoku Lab demo.
 * Sources:
 *   - grantm/sudoku-exchange-puzzle-bank (Public Domain)
 *   - HiSudoku/PuzzleLibrary (credited in README)
 *
 * Usage: node scripts/prepare-sudoku-puzzles.mjs
 * Skips network fetch when output already exists and --force is not set,
 * unless SUDOKU_FORCE=1.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "docs/.vitepress/theme/data/sudoku");
const CACHE_DIR = join(ROOT, "scripts/.cache/sudoku");

const FORCE = process.argv.includes("--force") || process.env.SUDOKU_FORCE === "1";
const TARGET_TOTAL = 5200;

const EXCHANGE = {
  easy: {
    url: "https://raw.githubusercontent.com/grantm/sudoku-exchange-puzzle-bank/master/easy.txt",
    difficulty: "easy",
    take: 1400,
  },
  medium: {
    url: "https://raw.githubusercontent.com/grantm/sudoku-exchange-puzzle-bank/master/medium.txt",
    difficulty: "medium",
    take: 1400,
  },
  hard: {
    url: "https://raw.githubusercontent.com/grantm/sudoku-exchange-puzzle-bank/master/hard.txt",
    difficulty: "hard",
    take: 1200,
  },
  diabolical: {
    url: "https://raw.githubusercontent.com/grantm/sudoku-exchange-puzzle-bank/master/diabolical.txt",
    difficulty: "expert",
    take: 800,
  },
};

const HISUDOKU = {
  easy: {
    url: "https://raw.githubusercontent.com/HiSudoku/PuzzleLibrary/main/puzzles/v1/QuickPlay/Easy.json",
    difficulty: "easy",
    take: 200,
  },
  medium: {
    url: "https://raw.githubusercontent.com/HiSudoku/PuzzleLibrary/main/puzzles/v1/QuickPlay/Medium.json",
    difficulty: "medium",
    take: 200,
  },
  hard: {
    url: "https://raw.githubusercontent.com/HiSudoku/PuzzleLibrary/main/puzzles/v1/QuickPlay/Hard.json",
    difficulty: "hard",
    take: 150,
  },
  expert: {
    url: "https://raw.githubusercontent.com/HiSudoku/PuzzleLibrary/main/puzzles/v1/QuickPlay/Expert.json",
    difficulty: "expert",
    take: 100,
  },
};

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function fetchText(url, cacheName) {
  await mkdir(CACHE_DIR, { recursive: true });
  const cachePath = join(CACHE_DIR, cacheName);
  if ((await exists(cachePath)) && !FORCE) {
    return readFile(cachePath, "utf8");
  }
  console.log(`  fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  const text = await res.text();
  await writeFile(cachePath, text, "utf8");
  return text;
}

function normalizePuzzle(s) {
  return String(s)
    .trim()
    .replace(/[^0-9.]/g, "")
    .replace(/0/g, ".")
    .slice(0, 81);
}

function puzzleId(puzzle) {
  return createHash("sha1").update(puzzle).digest("hex").slice(0, 16);
}

/** Minimal unique-solution solver for 81-char grids ('.' empty). */
function solvePuzzle(puzzle) {
  const board = puzzle.split("").map((c) => (c === "." ? 0 : Number(c)));
  if (board.length !== 81 || board.some((n) => Number.isNaN(n) || n < 0 || n > 9)) {
    return null;
  }

  function candidates(i) {
    const used = new Set();
    const r = Math.floor(i / 9);
    const c = i % 9;
    const br = Math.floor(r / 3) * 3;
    const bc = Math.floor(c / 3) * 3;
    for (let k = 0; k < 9; k++) {
      used.add(board[r * 9 + k]);
      used.add(board[k * 9 + c]);
      used.add(board[(br + Math.floor(k / 3)) * 9 + (bc + (k % 3))]);
    }
    const out = [];
    for (let n = 1; n <= 9; n++) if (!used.has(n)) out.push(n);
    return out;
  }

  function nextEmpty() {
    let best = -1;
    let bestLen = 10;
    for (let i = 0; i < 81; i++) {
      if (board[i] !== 0) continue;
      const len = candidates(i).length;
      if (len === 0) return -2;
      if (len < bestLen) {
        bestLen = len;
        best = i;
        if (len === 1) break;
      }
    }
    return best;
  }

  function dfs() {
    const i = nextEmpty();
    if (i === -1) return true;
    if (i === -2) return false;
    for (const n of candidates(i)) {
      board[i] = n;
      if (dfs()) return true;
      board[i] = 0;
    }
    return false;
  }

  if (!dfs()) return null;
  return board.join("");
}

function sampleLines(text, take) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length <= take) return lines;
  // Deterministic stride sample for reproducibility
  const step = lines.length / take;
  const out = [];
  for (let i = 0; i < take; i++) {
    out.push(lines[Math.min(lines.length - 1, Math.floor(i * step))]);
  }
  return out;
}

function parseExchangeLine(line) {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 2) return null;
  // hash puzzle rating  OR  puzzle rating
  let puzzle;
  let rating;
  if (parts[0].length === 81 || parts[0].includes("0") || parts[0].includes(".")) {
    puzzle = normalizePuzzle(parts[0]);
    rating = parts[1] ? Number(parts[1]) : undefined;
  } else {
    puzzle = normalizePuzzle(parts[1]);
    rating = parts[2] ? Number(parts[2]) : undefined;
  }
  if (puzzle.length !== 81) return null;
  return { puzzle, rating: Number.isFinite(rating) ? rating : undefined };
}

async function loadExchange(seen) {
  const items = [];
  for (const [key, cfg] of Object.entries(EXCHANGE)) {
    console.log(`Sudoku Exchange · ${key}`);
    const text = await fetchText(cfg.url, `exchange-${key}.txt`);
    const lines = sampleLines(text, cfg.take);
    let ok = 0;
    for (const line of lines) {
      const parsed = parseExchangeLine(line);
      if (!parsed || seen.has(parsed.puzzle)) continue;
      const solution = solvePuzzle(parsed.puzzle);
      if (!solution) continue;
      seen.add(parsed.puzzle);
      items.push({
        id: puzzleId(parsed.puzzle),
        puzzle: parsed.puzzle,
        solution,
        source: "sudoku-exchange",
        sourceLabel: "Sudoku Exchange",
        difficulty: cfg.difficulty,
        rating: parsed.rating,
      });
      ok++;
    }
    console.log(`  kept ${ok}`);
  }
  return items;
}

async function loadHiSudoku(seen) {
  const items = [];
  for (const [key, cfg] of Object.entries(HISUDOKU)) {
    console.log(`HiSudoku · ${key}`);
    let text;
    try {
      text = await fetchText(cfg.url, `hisudoku-${key}.json`);
    } catch (e) {
      console.warn(`  skip ${key}: ${e.message}`);
      continue;
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.warn(`  invalid JSON for ${key}`);
      continue;
    }
    const list = Array.isArray(data) ? data : data.puzzles || [];
    const stride = Math.max(1, Math.floor(list.length / cfg.take));
    let ok = 0;
    for (let i = 0; i < list.length && ok < cfg.take; i += stride) {
      const row = list[i];
      const puzzle = normalizePuzzle(row.puzzle ?? row[0] ?? "");
      let solution = row.solution ?? row[1];
      if (puzzle.length !== 81 || seen.has(puzzle)) continue;
      if (!solution || String(solution).replace(/[^1-9]/g, "").length !== 81) {
        solution = solvePuzzle(puzzle);
      } else {
        solution = String(solution).replace(/[^1-9]/g, "").slice(0, 81);
      }
      if (!solution || solution.length !== 81) continue;
      seen.add(puzzle);
      items.push({
        id: puzzleId(puzzle),
        puzzle,
        solution,
        source: "hisudoku",
        sourceLabel: "Hi Sudoku",
        difficulty: cfg.difficulty,
      });
      ok++;
    }
    console.log(`  kept ${ok}`);
  }
  return items;
}

async function main() {
  const indexPath = join(OUT_DIR, "puzzle-index.json");
  if ((await exists(indexPath)) && !FORCE) {
    const existing = JSON.parse(await readFile(indexPath, "utf8"));
    if ((existing.total || 0) >= 5000) {
      console.log(`Sudoku puzzles already prepared (${existing.total}). Use --force to rebuild.`);
      return;
    }
  }

  await mkdir(OUT_DIR, { recursive: true });
  const seen = new Set();
  const all = [];
  all.push(...(await loadExchange(seen)));
  all.push(...(await loadHiSudoku(seen)));

  if (all.length < 5000) {
    console.warn(`Only ${all.length} puzzles; topping up from exchange medium…`);
    const text = await fetchText(EXCHANGE.medium.url, "exchange-medium.txt");
    const lines = text.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      if (all.length >= TARGET_TOTAL) break;
      const parsed = parseExchangeLine(line);
      if (!parsed || seen.has(parsed.puzzle)) continue;
      const solution = solvePuzzle(parsed.puzzle);
      if (!solution) continue;
      seen.add(parsed.puzzle);
      all.push({
        id: puzzleId(parsed.puzzle),
        puzzle: parsed.puzzle,
        solution,
        source: "sudoku-exchange",
        sourceLabel: "Sudoku Exchange",
        difficulty: "medium",
        rating: parsed.rating,
      });
    }
  }

  const byDiff = { easy: [], medium: [], hard: [], expert: [] };
  for (const p of all) {
    const d = byDiff[p.difficulty] ? p.difficulty : "medium";
    byDiff[d].push(p);
  }

  const index = {
    version: 1,
    total: all.length,
    generatedAt: new Date().toISOString(),
    sources: [
      {
        id: "sudoku-exchange",
        label: "Sudoku Exchange",
        license: "Public Domain",
        url: "https://github.com/grantm/sudoku-exchange-puzzle-bank",
      },
      {
        id: "hisudoku",
        label: "Hi Sudoku",
        license: "See upstream repository",
        url: "https://github.com/HiSudoku/PuzzleLibrary",
      },
    ],
    difficulties: Object.fromEntries(
      Object.entries(byDiff).map(([k, v]) => [k, v.length])
    ),
    shards: Object.fromEntries(
      Object.keys(byDiff).map((k) => [k, `puzzles-${k}.json`])
    ),
  };

  for (const [diff, list] of Object.entries(byDiff)) {
    await writeFile(join(OUT_DIR, `puzzles-${diff}.json`), JSON.stringify(list), "utf8");
    console.log(`wrote puzzles-${diff}.json (${list.length})`);
  }
  await writeFile(indexPath, JSON.stringify(index, null, 2), "utf8");
  console.log(`wrote puzzle-index.json · total ${all.length}`);

  if (all.length < 5000) {
    console.error(`WARNING: only ${all.length} puzzles (< 5000). Check network / sources.`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
