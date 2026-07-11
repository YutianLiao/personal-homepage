import { withBase } from "vitepress";
import type { Token, TokenizerModule, VocabLoadProgress } from "./types";
import WordpieceExplanation from "./WordpieceExplanation.vue";

let vocabToId: Map<string, number> | null = null;
let idToToken: string[] | null = null;

const UNK = "[UNK]";
const MAX_CHAR = 200;

function basicTokenize(text: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (/[\p{L}\p{N}]/u.test(ch)) {
      let j = i + 1;
      while (j < text.length && /[\p{L}\p{N}]/u.test(text[j])) j += 1;
      tokens.push(text.slice(i, j).toLowerCase());
      i = j;
      continue;
    }
    tokens.push(ch);
    i += 1;
  }
  return tokens;
}

function wordpieceOne(word: string): string[] {
  if (!vocabToId) return [UNK];
  if (word.length > MAX_CHAR) return [UNK];
  if (vocabToId.has(word)) return [word];

  const pieces: string[] = [];
  let start = 0;
  while (start < word.length) {
    let end = word.length;
    let found: string | null = null;
    while (start < end) {
      let piece = word.slice(start, end);
      if (start > 0) piece = `##${piece}`;
      if (vocabToId.has(piece)) {
        found = piece;
        break;
      }
      end -= 1;
    }
    if (!found) return [UNK];
    pieces.push(found);
    start = end;
  }
  return pieces;
}

async function fetchVocabText(
  url: string,
  onProgress?: (progress: VocabLoadProgress) => void
): Promise<string> {
  const report = (progress: VocabLoadProgress) => onProgress?.(progress);

  report({ progress: 5, message: "正在连接 BERT 词表…" });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load BERT vocab: ${res.status}`);

  const contentLength = Number(res.headers.get("Content-Length") ?? 0);
  if (!res.body || !contentLength) {
    report({ progress: 40, message: "正在下载 BERT 词表…" });
    const text = await res.text();
    report({ progress: 85, message: "正在解析词表…" });
    return text;
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    const ratio = received / contentLength;
    report({
      progress: Math.round(12 + ratio * 68),
      message: `正在下载 BERT 词表… ${Math.round(ratio * 100)}%`
    });
  }

  report({ progress: 84, message: "正在解析词表…" });
  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(merged);
}

export const wordpieceTokenizer: TokenizerModule = {
  meta: {
    id: "wordpiece",
    name: "WordPiece (BERT)",
    summary: "",
    complexity: "O(n) · O(L<sup>2</sup>)",
    refs: [
      { label: "Devlin et al. 2019 — BERT", url: "https://arxiv.org/abs/1810.04805" },
      {
        label: "HuggingFace bert-base-uncased vocab",
        url: "https://huggingface.co/bert-base-uncased"
      }
    ]
  },
  async init(options) {
    if (vocabToId) return;
    const url = withBase("/demos/tokenizer/bert-vocab.txt");
    const text = await fetchVocabText(url, options?.onVocabProgress);
    const lines = text.split(/\r?\n/).filter(Boolean);
    idToToken = lines;
    vocabToId = new Map(lines.map((tok, i) => [tok, i]));
    options?.onVocabProgress?.({ progress: 100, message: "词表加载完成" });
  },
  tokenize(text: string): Token[] {
    if (!vocabToId || !idToToken) throw new Error("WordPiece vocab not loaded");
    const basic = basicTokenize(text);
    const result: Token[] = [];
    for (const raw of basic) {
      if (raw.length === 1 && !/[\p{L}\p{N}]/u.test(raw)) {
        const id = vocabToId.get(raw);
        result.push({
          text: raw,
          id,
          kind: "punct",
          display: raw
        });
        continue;
      }
      const pieces = wordpieceOne(raw);
      for (const piece of pieces) {
        const id = vocabToId.get(piece);
        const isUnk = piece === UNK;
        result.push({
          text: piece,
          id,
          kind: isUnk ? "special" : "subword",
          display: piece.startsWith("##") ? piece.slice(2) : piece
        });
      }
    }
    return result;
  },
  Explanation: WordpieceExplanation
};
