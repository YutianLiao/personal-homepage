import type { Token, TokenizerModule } from "./types";
import ByteExplanation from "./ByteExplanation.vue";

const encoder = new TextEncoder();

export const byteTokenizer: TokenizerModule = {
  meta: {
    id: "byte",
    name: "Byte-level (UTF-8)",
    summary: "将文本编码为 UTF-8 字节序列，每字节一个 token。",
    complexity: "O(n)",
    refs: [
      {
        label: "GPT-2 paper — byte-level BPE",
        url: "https://d4mucfpksywv.cloudfront.net/better-language-models/language_models_are_unsupervised_multitask_learners.pdf"
      }
    ]
  },
  tokenize(text: string): Token[] {
    const bytes = encoder.encode(text);
    return Array.from(bytes).map((b, i) => ({
      text: String.fromCharCode(b),
      id: b,
      bytes: [b],
      kind: "byte" as const,
      display: `0x${b.toString(16).padStart(2, "0")}`
    }));
  },
  Explanation: ByteExplanation
};
