import type { Token, TokenizerModule } from "./types";
import CharacterExplanation from "./CharacterExplanation.vue";

export const characterTokenizer: TokenizerModule = {
  meta: {
    id: "character",
    name: "Character",
    summary: "逐 Unicode 字符切分，每个字符一个 token。",
    complexity: "O(n)",
    refs: [
      {
        label: "Karpathy — char-RNN",
        url: "https://karpathy.github.io/2015/05/21/rnn-effectiveness/"
      }
    ]
  },
  tokenize(text: string): Token[] {
    return Array.from(text).map((ch) => ({
      text: ch,
      kind: ch.trim() === "" ? "space" : /\p{L}|\p{N}/u.test(ch) ? "char" : "punct",
      display:
        ch === " "
          ? "␣"
          : ch === "\n"
            ? "↵"
            : ch === "\t"
              ? "⇥"
              : undefined
    }));
  },
  Explanation: CharacterExplanation
};
