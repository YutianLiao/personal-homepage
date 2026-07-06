#!/usr/bin/env node
import {
  loadData,
  saveData,
  slugify,
  uniqueId,
  collectPointIds,
  redistributeAllPoints,
  findSubtopic,
  ensurePointDefaults,
  colorFromId
} from "./lib/knowledge-planet-utils.mjs";

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args[key] = next;
        i += 1;
      } else {
        args[key] = true;
      }
    } else {
      args._.push(a);
    }
  }
  return args;
}

function usage() {
  console.log(`Usage:
  node scripts/knowledge-planet.mjs add-point --l1 <id> --l2 <id> --title "..." [--familiarity 0] [--id custom-id]
  node scripts/knowledge-planet.mjs remove-point --id <pointId>
  node scripts/knowledge-planet.mjs add-subtopic --l1 <id> --title "..." [--id custom-id]
  node scripts/knowledge-planet.mjs add-topic --title "..." [--id custom-id]
  node scripts/knowledge-planet.mjs redistribute
  node scripts/knowledge-planet.mjs sync`);
}

function cmdAddTopic(args) {
  const data = loadData();
  const title = args.title;
  if (!title) throw new Error("--title is required");
  const existing = new Set(data.topics.map((t) => t.id));
  const id = args.id ? args.id : uniqueId(slugify(title), existing);
  data.topics.push({ id, title, subtopics: [] });
  saveData(data);
  console.log(`Added topic "${title}" (${id})`);
}

function cmdAddSubtopic(args) {
  const data = loadData();
  const l1 = args.l1;
  const title = args.title;
  if (!l1 || !title) throw new Error("--l1 and --title are required");
  const topic = data.topics.find((t) => t.id === l1);
  if (!topic) throw new Error(`Topic not found: ${l1}`);
  const existing = new Set(topic.subtopics.map((s) => s.id));
  const id = args.id ? args.id : uniqueId(slugify(title), existing);
  topic.subtopics.push({ id, title, points: [] });
  saveData(redistributeAllPoints(data));
  console.log(`Added subtopic "${title}" (${id}) under ${l1}`);
}

function cmdAddPoint(args) {
  const data = loadData();
  const { l1, l2, title } = args;
  if (!l1 || !l2 || !title) throw new Error("--l1, --l2, and --title are required");
  const found = findSubtopic(data, l1, l2);
  if (!found) throw new Error(`Subtopic not found: ${l1}/${l2}`);
  const existing = collectPointIds(data);
  const id = args.id ? args.id : uniqueId(slugify(title), existing);
  const familiarity = args.familiarity !== undefined ? Number(args.familiarity) : 0;
  const point = {
    id,
    title,
    familiarity: Math.min(100, Math.max(0, familiarity)),
    color: colorFromId(id),
    position: { x: 0, y: 0, z: 1 }
  };
  ensurePointDefaults(point);
  found.sub.points.push(point);
  saveData(redistributeAllPoints(data));
  console.log(`Added point "${title}" (${id})`);
}

function cmdRemovePoint(args) {
  const data = loadData();
  const id = args.id;
  if (!id) throw new Error("--id is required");
  let removed = false;
  for (const topic of data.topics) {
    for (const sub of topic.subtopics) {
      const idx = sub.points.findIndex((p) => p.id === id);
      if (idx >= 0) {
        sub.points.splice(idx, 1);
        removed = true;
        break;
      }
    }
    if (removed) break;
  }
  if (!removed) throw new Error(`Point not found: ${id}`);
  saveData(redistributeAllPoints(data));
  console.log(`Removed point ${id}`);
}

function cmdRedistribute() {
  const data = loadData();
  saveData(redistributeAllPoints(data));
  console.log("Redistributed all point positions on sphere");
}

function cmdSync() {
  const data = loadData();
  saveData(data);
  console.log("Synced knowledge-planet.json → docs/public/data/");
}

const args = parseArgs(process.argv.slice(2));
const command = args._[0];

try {
  switch (command) {
    case "add-topic":
      cmdAddTopic(args);
      break;
    case "add-subtopic":
      cmdAddSubtopic(args);
      break;
    case "add-point":
      cmdAddPoint(args);
      break;
    case "remove-point":
      cmdRemovePoint(args);
      break;
    case "redistribute":
      cmdRedistribute();
      break;
    case "sync":
      cmdSync();
      break;
    default:
      usage();
      process.exit(command ? 1 : 0);
  }
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
