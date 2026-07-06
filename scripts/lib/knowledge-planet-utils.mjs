import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
export const DATA_PATH = join(ROOT, "data/knowledge-planet.json");
export const PUBLIC_PATH = join(ROOT, "docs/public/data/knowledge-planet.json");

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Uniform point on unit sphere (Fibonacci / golden spiral). */
export function fibonacciSphere(n, index) {
  if (n <= 0) return { x: 0, y: 0, z: 1 };
  const y = 1 - (2 * (index + 0.5)) / n;
  const radius = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = GOLDEN_ANGLE * index;
  return {
    x: Math.cos(theta) * radius,
    y,
    z: Math.sin(theta) * radius
  };
}

/** Stable pseudo-random color from point id. */
export function colorFromId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 58%)`;
}

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "item";
}

export function uniqueId(base, existing) {
  let id = base;
  let n = 2;
  while (existing.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}

export function loadData() {
  const raw = readFileSync(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

export function saveData(data) {
  const json = `${JSON.stringify(data, null, 2)}\n`;
  writeFileSync(DATA_PATH, json, "utf8");
  mkdirSync(dirname(PUBLIC_PATH), { recursive: true });
  copyFileSync(DATA_PATH, PUBLIC_PATH);
}

export function collectPoints(data) {
  const points = [];
  for (const topic of data.topics) {
    for (const sub of topic.subtopics) {
      for (const point of sub.points) {
        points.push({ topic, sub, point });
      }
    }
  }
  return points;
}

export function collectPointIds(data) {
  return new Set(collectPoints(data).map((p) => p.point.id));
}

/** Reassign sphere positions for all points; preserve color & familiarity. */
export function redistributeAllPoints(data) {
  const all = collectPoints(data);
  const n = all.length;
  all.forEach((entry, index) => {
    entry.point.position = fibonacciSphere(n, index);
  });
  return data;
}

export function findSubtopic(data, l1Id, l2Id) {
  const topic = data.topics.find((t) => t.id === l1Id);
  if (!topic) return null;
  const sub = topic.subtopics.find((s) => s.id === l2Id);
  if (!sub) return null;
  return { topic, sub };
}

export function ensurePointDefaults(point) {
  if (point.familiarity === undefined) point.familiarity = 0;
  if (!point.color) point.color = colorFromId(point.id);
}
