import type { Tiktoken } from "js-tiktoken/lite";
import type { BpeEncodingId, Token, TokenizerModule, VocabLoadProgress } from "./types";
import { formatFromBytes } from "./utils";
import BpeExplanation from "./BpeExplanation.vue";

let encoding: Tiktoken | null = null;
let currentEncodingId: BpeEncodingId = "cl100k_base";

export function getBpeEncodingId(): BpeEncodingId {
  return currentEncodingId;
}

async function loadRank(id: BpeEncodingId) {
  if (id === "cl100k_base") {
    return import("js-tiktoken/ranks/cl100k_base");
  }
  return import("js-tiktoken/ranks/o200k_base");
}

function report(onProgress: ((p: VocabLoadProgress) => void) | undefined, progress: VocabLoadProgress) {
  onProgress?.(progress);
}

export async function setBpeEncoding(
  id: BpeEncodingId,
  onProgress?: (progress: VocabLoadProgress) => void
): Promise<void> {
  if (encoding && currentEncodingId === id) return;

  report(onProgress, { progress: 8, message: "正在加载 BPE 引擎…" });

  const litePromise = import("js-tiktoken/lite");
  report(onProgress, { progress: 18, message: `正在下载词表 ${id}…` });

  let simulated = 18;
  const timer = window.setInterval(() => {
    simulated = Math.min(simulated + 4, 82);
    report(onProgress, { progress: simulated, message: `正在下载词表 ${id}…` });
  }, 140);

  try {
    const [{ Tiktoken }, rankMod] = await Promise.all([litePromise, loadRank(id)]);
    window.clearInterval(timer);
    report(onProgress, { progress: 90, message: "正在初始化编码器…" });
    const rank = rankMod.default ?? rankMod;
    encoding = new Tiktoken(rank);
    currentEncodingId = id;
    report(onProgress, { progress: 100, message: "词表加载完成" });
  } catch (error) {
    window.clearInterval(timer);
    throw error;
  }
}

function tokenBytes(enc: Tiktoken, id: number): number[] {
  if (typeof enc.decode_single_token_bytes === "function") {
    return Array.from(enc.decode_single_token_bytes(id));
  }
  const piece = enc.decode([id]);
  return Array.from(new TextEncoder().encode(piece));
}

function isSpecialToken(text: string): boolean {
  return /^<[^>]+>$/.test(text);
}

export const bpeTokenizer: TokenizerModule = {
  meta: {
    id: "bpe",
    name: "BPE (tiktoken)",
    summary: "",
    complexity: "O(n)",
    refs: [
      { label: "Sennrich et al. 2016 — Neural Machine Translation of Rare Words with Subword Units", url: "https://arxiv.org/abs/1508.07909" },
      { label: "Radford et al. 2019 — Language Models are Unsupervised Multitask Learners (GPT-2, byte-level BPE)", url: "https://d4mucfpksywv.cloudfront.net/better-language-models/language_models_are_unsupervised_multitask_learners.pdf" },
      { label: "OpenAI tiktoken", url: "https://github.com/openai/tiktoken" }
    ]
  },
  async init(options) {
    const id = options?.bpeEncodingId ?? currentEncodingId;
    await setBpeEncoding(id, options?.onVocabProgress);
  },
  tokenize(text: string): Token[] {
    if (!encoding) throw new Error("BPE encoding not initialized");
    const ids = encoding.encode(text);
    return ids.map((id) => {
      const bytes = tokenBytes(encoding!, id);
      const { text: piece, display, partialUtf8 } = formatFromBytes(bytes);
      const kind = isSpecialToken(piece) ? "special" : "subword";
      return { text: piece, id, bytes, kind, display, partialUtf8 };
    });
  },
  Explanation: BpeExplanation
};
