#!/usr/bin/env node
/**
 * Convert seq2seq HTML → learning/hello-agent/02-attention/01-seq2seq-tutorial.md
 * 不包含 RNN/LSTM 基础章节（见 01-math-foundations/）。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const htmlPath = path.resolve(root, "../../Notes/seq2seq-tutorial/seq2seq-attention-tutorial.html");
const assetsSrc = path.resolve(root, "../../Notes/seq2seq-tutorial/assets");
const helloRoot = path.join(root, "learning/hello-agent");

const PARTS = {
  "00-preface": { title: "前言" },
  "01-math-foundations": { title: "第一部分：数学基础" },
  "02-attention": { title: "第二部分：注意力机制" }
};

const ATTENTION_DIR = "02-attention";
const OUTPUT_FILE = "01-seq2seq-tutorial.md";

/** 仅导出论文精读部分；ch-02~04 已迁至数学基础 */
const SEQ2SEQ_CHAPTERS = [
  { id: "ch-01", title: "论文背景与定位" },
  { id: "ch-05", title: "Seq2Seq 模型架构" },
  { id: "ch-06", title: "三个关键工程技巧" },
  { id: "ch-07", title: "训练目标、解码与 Beam Search" },
  { id: "ch-08", title: "训练细节与工程优化" },
  { id: "ch-09", title: "权重共享、BPTT 与训练机制" },
  { id: "ch-10", title: "实验结果与模型分析" },
  { id: "ch-11", title: "固定向量瓶颈与 Attention 铺垫" },
  { id: "ch-12", title: "论文时间线与后续学习路径" },
  { id: "ch-13", title: "速查索引" },
  { id: "ch-appendix", title: "附录：术语表与 Conclusion 译文" }
];

const INTRO = `## 本教程说明

本篇精读 **Sutskever et al. (2014) — Sequence to Sequence Learning with Neural Networks**。

**前置阅读**（左侧「第一部分：数学基础」）：

- [神经网络](../01-math-foundations/01-neural-networks) — 前馈网络、反向传播、为何固定维度网络做不了翻译
- [RNN](../01-math-foundations/02-rnn) — 隐藏状态、BPTT、梯度消失/爆炸
- [LSTM](../01-math-foundations/03-lstm) — 门控机制、长依赖、训练稳定性

## 阅读路线

1. **论文背景** → 理解本文在 NMT 史上的位置
2. **模型架构 ~ 工程技巧** → Encoder-Decoder、双 LSTM、源句反转
3. **训练与解码** → 损失函数、Teacher Forcing、Beam Search
4. **实验与瓶颈** → BLEU、长句退化、Attention 铺垫
5. **速查与附录** → 术语表、Conclusion 译文

> 演进主线：2014 Sutskever — Seq2Seq + LSTM · 2014 Bahdanau — Attention · 2017 Transformer
`;

const LATEX_UNICODE = {
  "∈": "\\in ",
  "·": "\\cdot ",
  "σ": "\\sigma ",
  "∂": "\\partial ",
  "∏": "\\prod ",
  "ℝ": "\\mathbb{R}",
  "→": "\\to ",
  "α": "\\alpha ",
  "β": "\\beta ",
  "γ": "\\gamma ",
  "λ": "\\lambda ",
  "θ": "\\theta ",
  "−": "-",
  "–": "-",
  "…": "\\ldots ",
  "∑": "\\sum ",
  "⊙": "\\odot ",
  "⊤": "^\\top ",
  "̂": "\\hat "
};

function normalizeLatex(text) {
  let out = text.replace(/\s+/g, " ").trim();
  for (const [from, to] of Object.entries(LATEX_UNICODE)) {
    out = out.split(from).join(to);
  }
  return out;
}

function nodeToLatex(node) {
  if (node.nodeType === 3) return node.textContent ?? "";
  if (node.nodeType !== 1) return "";
  const tag = node.nodeName;
  if (tag === "BR") return "\\\\";
  if (tag === "SUB") return `_{${normalizeLatex(nodeToLatexChildren(node))}}`;
  if (tag === "SUP") return `^{${normalizeLatex(nodeToLatexChildren(node))}}`;
  if (tag === "I" || tag === "EM" || tag === "SPAN" || tag === "STRONG" || tag === "B") {
    return nodeToLatexChildren(node);
  }
  return nodeToLatexChildren(node);
}

function nodeToLatexChildren(el) {
  return Array.from(el.childNodes).map(nodeToLatex).join("");
}

function replaceMathInHtml(html) {
  const dom = new JSDOM(`<div id="root">${html}</div>`);
  const rootEl = dom.window.document.getElementById("root");

  rootEl.querySelectorAll("div.equation, p.equation").forEach((block) => {
    const math = block.querySelector(".math");
    const latex = normalizeLatex(math ? nodeToLatexChildren(math) : nodeToLatexChildren(block));
    const p = dom.window.document.createElement("p");
    p.className = "math-block";
    p.textContent = `$$${latex}$$`;
    block.replaceWith(p);
  });

  rootEl.querySelectorAll("span.math").forEach((span) => {
    const latex = normalizeLatex(nodeToLatexChildren(span));
    span.replaceWith(dom.window.document.createTextNode(`$${latex}$`));
  });

  return rootEl.innerHTML;
}

function demoteHeadings(html) {
  const dom = new JSDOM(`<div id="wrap">${html}</div>`);
  const wrap = dom.window.document.getElementById("wrap");
  for (const tag of ["h4", "h3", "h2"]) {
    const next = { h2: "h3", h3: "h4", h4: "h5" }[tag];
    wrap.querySelectorAll(tag).forEach((el) => {
      const n = dom.window.document.createElement(next);
      n.innerHTML = el.innerHTML;
      el.replaceWith(n);
    });
  }
  return wrap.innerHTML;
}

function tableToMarkdown(node) {
  const html = node.outerHTML ?? `<table>${node.innerHTML ?? ""}</table>`;
  const dom = new JSDOM(`<div>${html}</div>`);
  const table = dom.window.document.querySelector("table");
  if (!table) return "";
  const rows = [...table.querySelectorAll("tr")].map((tr) =>
    [...tr.querySelectorAll("th, td")].map((cell) =>
      cell.textContent.replace(/\|/g, "\\|").replace(/\n/g, " ").trim()
    )
  );
  if (!rows.length) return "";
  const header = rows[0];
  const sep = header.map(() => "---");
  const body = rows.slice(1);
  const lines = [
    `| ${header.join(" | ")} |`,
    `| ${sep.join(" | ")} |`,
    ...body.map((r) => `| ${r.join(" | ")} |`)
  ];
  return `\n\n${lines.join("\n")}\n\n`;
}

function setupTurndown() {
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    bulletListMarker: "-"
  });

  td.addRule("table", {
    filter: (node) => node.nodeName === "TABLE",
    replacement: (_c, node) => tableToMarkdown(node)
  });

  td.addRule("keepSvgFigure", {
    filter: (node) =>
      node.nodeName === "FIGURE" && node.querySelector("svg") && !node.querySelector("img"),
    replacement: (_content, node) => {
      const cap = node.querySelector("figcaption")?.textContent?.trim();
      return `\n\n<div class="learning-module-figure" v-pre>\n${node.outerHTML}\n</div>\n\n${cap ? `*${cap}*\n\n` : ""}`;
    }
  });

  td.addRule("figureImg", {
    filter: (node) => node.nodeName === "FIGURE" && node.querySelector("img"),
    replacement: (_content, node) => {
      const img = node.querySelector("img");
      const src = img.getAttribute("src")?.replace(/^assets\//, "./assets/") ?? "";
      const alt = img.getAttribute("alt") ?? "";
      const cap = node.querySelector("figcaption")?.textContent?.trim() ?? "";
      return `\n\n![${alt}](${src})\n\n${cap ? `*${cap}*\n\n` : ""}`;
    }
  });

  for (const cls of ["takeaway", "callout", "example", "faq-inline"]) {
    td.addRule(cls, {
      filter: (node) => node.nodeName === "DIV" && node.classList?.contains(cls),
      replacement: (content) => `\n\n> ${content.trim().replace(/\n+/g, "\n> ")}\n\n`
    });
  }

  td.addRule("lead", {
    filter: (node) => node.nodeName === "P" && node.classList?.contains("lead"),
    replacement: (content) => `\n\n${content.trim()}\n\n`
  });

  td.addRule("cite", {
    filter: (node) => node.classList?.contains("cite"),
    replacement: (content) => `\n\n*${content.trim()}*\n\n`
  });

  return td;
}

function stripChapterChrome(html) {
  const dom = new JSDOM(`<div id="wrap">${html}</div>`);
  const wrap = dom.window.document.getElementById("wrap");
  wrap.querySelector(".chapter-num")?.remove();
  wrap.querySelector("h1")?.remove();
  return wrap.innerHTML;
}

function matrix2x2(r1, r2) {
  const fmt = (row) => row.split(",").map((s) => s.trim()).join(" & ");
  return `\\begin{bmatrix}${fmt(r1)} \\\\ ${fmt(r2)}\\end{bmatrix}`;
}

function fixBmatrix(md) {
  return md.replace(/\\begin\{bmatrix\}([\s\S]*?)\\end\{bmatrix\}/g, (_, inner) => {
    const body = inner
      .replace(/(\S)\\(?=\s*\\)/g, "$1")
      .replace(/\\\s+\\end\{bmatrix\}/g, "\\end{bmatrix}")
      .replace(/\s*\\\s*\\\s*/g, " \\\\ ")
      .trim();
    return `\\begin{bmatrix}${body}\\end{bmatrix}`;
  });
}

function fixBracketEscapes(md) {
  md = md.replace(/\\\[\\\[([^\]]+)\],\\\[([^\]]+)\]\\\]/g, (_, r1, r2) => matrix2x2(r1, r2));
  md = md.replace(/\\\[(\d+)\\\]/g, "[$1]");
  md = md.replace(/Uniform\\\[([^\]]+)\\\]/g, "Uniform$[$1]$");
  md = md.replace(/\\\[([^\]]*;[^\]]*)\\\]/g, (_, inner) => {
    const rows = inner.split(";").map((r) => r.trim()).join(" \\\\ ");
    return `\\begin{bmatrix}${rows}\\end{bmatrix}`;
  });
  md = md.replace(/\\\[([^\]]+)\\\]/g, (_, inner) => `[${inner.trim()}]`);
  return md;
}

function fixMathInMarkdown(md) {
  const fixInner = (inner) => inner.replace(/\\_/g, "_").replace(/\\\*/g, "*");
  md = md.replace(/\$\$([\s\S]+?)\$\$/g, (_m, inner) => `$$${fixInner(inner)}$$`);
  md = md.replace(/\$([^$\n]+?)\$/g, (_m, inner) => `$${fixInner(inner)}$`);
  return md;
}

function escapeSpecialTags(md) {
  for (const tag of ["EOS", "PAD", "GO", "BOS"]) {
    const raw = `<${tag}>`;
    const wrapped = `\`${raw}\``;
    md = md.split(raw).join(wrapped);
    md = md.replace(new RegExp(`\`${wrapped}\``, "g"), wrapped);
  }
  return md;
}

function unwrapBlockquoteTables(md) {
  return md.replace(/^> (\|.*\|)\s*$/gm, "$1");
}

function sanitizeMarkdown(md) {
  md = md.replace(/^<([A-Z][A-Z0-9_]*)>$/gm, "`<$1>`");
  md = md.replace(/<(\d)/g, "&lt;$1");
  md = fixBracketEscapes(md);
  md = fixBmatrix(md);
  md = fixMathInMarkdown(md);
  md = escapeSpecialTags(md);
  return unwrapBlockquoteTables(md);
}

function convertChapter(sectionHtml, turndown) {
  const withMath = replaceMathInHtml(sectionHtml);
  const body = demoteHeadings(stripChapterChrome(withMath));
  let md = turndown.turndown(body);
  md = md.replace(/\n{3,}/g, "\n\n").trim();
  return sanitizeMarkdown(md);
}

function ensurePartDirs() {
  for (const [dir, meta] of Object.entries(PARTS)) {
    const partPath = path.join(helloRoot, dir);
    fs.mkdirSync(path.join(partPath, "assets"), { recursive: true });
    fs.writeFileSync(
      path.join(partPath, "part.json"),
      `${JSON.stringify({ title: meta.title }, null, 2)}\n`,
      "utf8"
    );
    if (dir === ATTENTION_DIR) {
      for (const entry of fs.readdirSync(partPath)) {
        if (entry.endsWith(".md")) fs.rmSync(path.join(partPath, entry));
      }
    }
  }
}

function copyAssets() {
  const dest = path.join(helloRoot, ATTENTION_DIR, "assets");
  if (!fs.existsSync(assetsSrc)) return;
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(assetsSrc, dest, { recursive: true });
}

function main() {
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`Source HTML not found: ${htmlPath}`);
  }

  const html = fs.readFileSync(htmlPath, "utf8");
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const turndown = setupTurndown();

  ensurePartDirs();
  copyAssets();

  const sections = [INTRO];

  for (const ch of SEQ2SEQ_CHAPTERS) {
    const section = doc.querySelector(`section#${ch.id}`);
    if (!section) throw new Error(`Missing section ${ch.id}`);
    const body = convertChapter(section.innerHTML, turndown);
    sections.push(`## ${ch.title}\n\n${body}\n`);
  }

  const out = `---
title: Seq2Seq 与注意力机制入门教程
description: Hello Agent · 第二部分：注意力机制
---

${sections.join("\n").trim()}
`;

  fs.writeFileSync(path.join(helloRoot, ATTENTION_DIR, OUTPUT_FILE), out, "utf8");
  console.log("wrote", path.relative(root, path.join(helloRoot, ATTENTION_DIR, OUTPUT_FILE)));
}

main();
