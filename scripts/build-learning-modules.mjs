#!/usr/bin/env node
/**
 * Sync learning module sources → docs/{id}/ and build sidebars + pager manifests.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const registryPath = path.join(root, "docs/.vitepress/learning-modules.json");
const sidebarsPath = path.join(root, "docs/.vitepress/learning-sidebars.json");
const manifestsPath = path.join(root, "docs/.vitepress/learning-manifests.json");

const PART_RE = /^\d{2}-/;
const PAGE_RE = /^\d{2}-.+\.md$/;

function readRegistry() {
  const { modules } = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  if (!Array.isArray(modules) || modules.length === 0) {
    throw new Error("learning-modules.json must define a non-empty modules array");
  }
  return modules;
}

function removeStaleModules(modules) {
  if (!fs.existsSync(sidebarsPath)) return;

  const previousSidebars = JSON.parse(fs.readFileSync(sidebarsPath, "utf8"));
  const activeRoutes = new Set(
    modules.map((module) => (module.route.endsWith("/") ? module.route : `${module.route}/`))
  );

  for (const route of Object.keys(previousSidebars)) {
    if (activeRoutes.has(route)) continue;
    const id = route.split("/").filter(Boolean)[0];
    if (!id) continue;
    fs.rmSync(path.join(root, "docs", id), { recursive: true, force: true });
    console.log(`${id}: removed stale generated module`);
  }
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

function syncModule(module) {
  const sourceRoot = path.join(root, module.sourceDir);
  const destRoot = path.join(root, "docs", module.id);
  if (!fs.existsSync(sourceRoot)) {
    throw new Error(`Missing source folder: ${module.sourceDir}/`);
  }
  fs.rmSync(destRoot, { recursive: true, force: true });
  fs.cpSync(sourceRoot, destRoot, { recursive: true });
  return destRoot;
}

function scanModule(scanRoot, module) {
  const route = module.route.endsWith("/") ? module.route : `${module.route}/`;
  const sidebar = [{ text: "Overview", link: route }];
  const manifest = [];

  if (module.flat) {
    const pages = fs
      .readdirSync(scanRoot)
      .filter((name) => PAGE_RE.test(name) && fs.statSync(path.join(scanRoot, name)).isFile())
      .sort();

    const items = pages.map((file) => {
      const slug = file.replace(/\.md$/, "");
      const link = `${route}${slug}`.replace(/\/+/g, "/");
      const title = pageTitle(path.join(scanRoot, file));
      manifest.push({ title, link, part: "Notes" });
      return { text: title, link };
    });

    if (items.length > 0) {
      sidebar.push({
        text: "Notes",
        collapsed: false,
        items
      });
    }

    return { sidebar, manifest };
  }

  const parts = fs
    .readdirSync(scanRoot)
    .filter((name) => PART_RE.test(name) && fs.statSync(path.join(scanRoot, name)).isDirectory())
    .sort();

  for (const partName of parts) {
    const partDir = path.join(scanRoot, partName);
    const pages = fs
      .readdirSync(partDir)
      .filter((name) => PAGE_RE.test(name))
      .sort();

    const items = pages.map((file) => {
      const slug = file.replace(/\.md$/, "");
      const link = `${route}${partName}/${slug}`.replace(/\/+/g, "/");
      const title = pageTitle(path.join(partDir, file));
      manifest.push({ title, link, part: readPartTitle(partDir) });
      return { text: title, link };
    });

    if (items.length > 0) {
      sidebar.push({
        text: readPartTitle(partDir),
        collapsed: false,
        items
      });
    }
  }

  return { sidebar, manifest };
}

function main() {
  const modules = readRegistry();
  const sidebars = {};
  const manifests = {};

  removeStaleModules(modules);

  for (const module of modules) {
    const destRoot = syncModule(module);
    const { sidebar, manifest } = scanModule(destRoot, module);
    const routeKey = module.route.endsWith("/") ? module.route : `${module.route}/`;
    sidebars[routeKey] = sidebar;
    manifests[module.id] = manifest;
    console.log(
      `${module.id}: synced → docs/${module.id} (${manifest.length} pages, ${sidebar.length - 1} parts)`
    );
  }

  fs.writeFileSync(sidebarsPath, `${JSON.stringify(sidebars, null, 2)}\n`, "utf8");
  fs.writeFileSync(manifestsPath, `${JSON.stringify(manifests, null, 2)}\n`, "utf8");
}

main();
