import type { Tiktoken } from "js-tiktoken";
import type { BpeEncodingId, Token, TokenizerModule } from "./types";
import { formatFromBytes } from "./utils";
import BpeExplanation from "./BpeExplanation.vue";

let encoding: Tiktoken | null = null;
let currentEncodingId: BpeEncodingId = "cl100k_base";

export function getBpeEncodingId(): BpeEncodingId {
  return currentEncodingId;
}

export async function setBpeEncoding(id: BpeEncodingId): Promise<void> {
  if (encoding && currentEncodingId === id) return;
  const { getEncoding } = await import("js-tiktoken");
  encoding = getEncoding(id);
  currentEncodingId = id;
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
    summary: "OpenAI tiktoken：GPT-3.5/4 使用的真实 BPE 词表与合并规则。",
    complexity: "O(n) 编码",
    refs: [
      { label: "Sennrich et al. 2016 — Neural Machine Translation of Rare Words with Subword Units", url: "https://arxiv.org/abs/1508.07909" },
      { label: "Radford et al. 2019 — Language Models are Unsupervised Multitask Learners (GPT-2, byte-level BPE)", url: "https://d4mucfpksywv.cloudfront.net/better-language-models/language_models_are_unsupervised_multitask_learners.pdf" },
      { label: "OpenAI tiktoken", url: "https://github.com/openai/tiktoken" }
    ]
  },
  async init() {
    await setBpeEncoding(currentEncodingId);
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
