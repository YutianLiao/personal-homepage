import type { Token, TokenizerModule } from "./types";
import WhitespaceExplanation from "./WhitespaceExplanation.vue";

export const whitespaceTokenizer: TokenizerModule = {
  meta: {
    id: "whitespace",
    name: "空格分词 (Whitespace)",
    summary: "",
    complexity: "O(n)",
    refs: [
      {
        label: "Wikipedia — Tokenization",
        url: "https://en.wikipedia.org/wiki/Lexical_analysis#Tokenization"
      }
    ]
  },
  tokenize(text: string): Token[] {
    if (!text) return [];
    const parts = text.split(/(\s+)/).filter((p) => p.length > 0);
    return parts.map((part) => {
      if (/^\s+$/.test(part)) {
        return {
          text: part,
          kind: "space",
          display: part.replace(/ /g, "␣").replace(/\n/g, "↵").replace(/\t/g, "⇥")
        };
      }
      return { text: part, kind: "word" };
    });
  },
  Explanation: WhitespaceExplanation
};
