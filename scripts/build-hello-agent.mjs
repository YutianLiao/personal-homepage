#!/usr/bin/env node
/**
 * Sync hello-agent/ (source) → docs/hello-agent/ (VitePress) and build sidebar + pager manifest.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sourceRoot = path.join(root, "hello-agent");
const destRoot = path.join(root, "docs/hello-agent");
const sidebarPath = path.join(root, "docs/.vitepress/hello-agent-sidebar.json");
const manifestPath = path.join(root, "docs/.vitepress/hello-agent-manifest.json");

const PART_RE = /^\d{2}-/;
const PAGE_RE = /^\d{2}-.+\.md$/;

function syncSourceToDocs() {
  if (!fs.existsSync(sourceRoot)) {
    throw new Error(`Missing source folder: hello-agent/`);
  }
  fs.rmSync(destRoot, { recursive: true, force: true });
  fs.cpSync(sourceRoot, destRoot, { recursive: true });
}

function readPartTitle(partDir) {
  const metaPath = path.join(partDir, "part.json");
  if (fs.existsSync(metaPath)) {
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    if (meta.title) return meta.title;
  }
  return path.basename(partDir).replace(/^\d{2}-/, "").replace(/-/g, " ");
}

function pageTitle(mdPath) {
  const raw = fs.readFileSync(mdPath, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (m) {
    const titleLine = m[1].match(/^title:\s*(.+)$/m);
    if (titleLine) {
      let t = titleLine[1].trim();
      if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
        t = t.slice(1, -1);
      }
      return t;
    }
  }
  return path.basename(mdPath, ".md").replace(/^\d{2}-/, "");
}

function scanHelloAgent(scanRoot) {
  const parts = fs
    .readdirSync(scanRoot)
    .filter((name) => PART_RE.test(name) && fs.statSync(path.join(scanRoot, name)).isDirectory())
    .sort();

  const sidebar = [{ text: "Overview", link: "/hello-agent/" }];
  const manifest = [];

  for (const partName of parts) {
    const partDir = path.join(scanRoot, partName);
    const pages = fs
      .readdirSync(partDir)
      .filter((name) => PAGE_RE.test(name))
      .sort();

    const items = pages.map((file) => {
      const link = `/hello-agent/${partName}/${file.replace(/\.md$/, "")}`;
      const title = pageTitle(path.join(partDir, file));
      manifest.push({ title, link, part: readPartTitle(partDir) });
      return { text: title, link };
    });

    sidebar.push({
      text: readPartTitle(partDir),
      collapsed: false,
      items
    });
  }

  return { sidebar, manifest };
}

function main() {
  syncSourceToDocs();
  const { sidebar, manifest } = scanHelloAgent(destRoot);
  fs.writeFileSync(sidebarPath, `${JSON.stringify(sidebar, null, 2)}\n`, "utf8");
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`hello-agent: synced → docs/hello-agent (${manifest.length} pages, ${sidebar.length - 1} parts)`);
}

main();
