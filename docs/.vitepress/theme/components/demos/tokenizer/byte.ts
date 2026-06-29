import type { Token, TokenizerModule } from "./types";
import { formatFromBytes } from "./utils";
import ByteExplanation from "./ByteExplanation.vue";

const encoder = new TextEncoder();

export const byteTokenizer: TokenizerModule = {
  meta: {
    id: "byte",
    name: "Byte-level (UTF-8)",
    summary: "将文本编码为 UTF-8 字节序列，每字节一个 token。",
    complexity: "O(n)",
    refs: []
  },
  tokenize(text: string): Token[] {
    const bytes = encoder.encode(text);
    return Array.from(bytes).map((b) => {
      const { text: piece, display, partialUtf8 } = formatFromBytes([b]);
      return {
        text: piece,
        id: b,
        bytes: [b],
        kind: "byte" as const,
        display,
        partialUtf8
      };
    });
  },
  Explanation: ByteExplanation
};
