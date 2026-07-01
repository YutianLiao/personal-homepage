import type { Token, TokenizerModule } from "./types";
import UnigramExplanation from "./UnigramExplanation.vue";

const MAX_PIECE = 14;
const LOG_SINGLE = -3.4;

const PIECE_LOGP: [string, number][] = [
  ["I", -1.1],
  ["have", -1.6],
  ["a", -0.9],
  ["dream", -1.7],
  ["that", -1.2],
  ["one", -1.5],
  ["day", -1.6],
  ["the", -0.8],
  ["sons", -2.0],
  ["of", -0.7],
  ["former", -1.9],
  ["slaves", -2.1],
  ["and", -0.9],
  ["slave", -1.8],
  ["slave-owners", -2.0],
  ["owners", -2.0],
  ["will", -1.4],
  ["be", -1.0],
  ["able", -1.7],
  ["to", -0.6],
  ["sit", -1.9],
  ["down", -1.6],
  ["together", -2.0],
  ["at", -1.1],
  ["table", -1.8],
  ["brotherhood", -2.3],
  ["ing", -2.2],
  ["ers", -2.4],
  ["own", -2.3],
  ["ave", -2.5],
  ["ther", -2.6],
  ["…", -2.8]
];

function buildVocab(): Map<string, number> {
  const vocab = new Map<string, number>();
  for (const [piece, logp] of PIECE_LOGP) {
    vocab.set(piece, logp);
  }
  const seed =
    "I have a dream that one day the sons of former slaves and the sons of former slave-owners will be able to sit down together at the table of brotherhood.,!?;:'\"-";
  for (const ch of [...seed]) {
    if (!vocab.has(ch)) vocab.set(ch, LOG_SINGLE);
  }
  return vocab;
}

const VOCAB = buildVocab();
const PIECE_IDS = new Map<string, number>();
let nextId = 0;
for (const piece of [...VOCAB.keys()].sort()) {
  PIECE_IDS.set(piece, nextId++);
}

function vis(piece: string): string | undefined {
  if (piece === " ") return "␣";
  if (piece === "\n") return "↵";
  if (piece === "\t") return "⇥";
  return undefined;
}

function kindFor(piece: string): Token["kind"] {
  if (/^\s+$/.test(piece)) return "space";
  if (piece.length === 1 && /[\p{L}\p{N}]/u.test(piece)) return "char";
  if (piece.length === 1) return "punct";
  return "subword";
}

function viterbiSegment(text: string): string[] {
  if (!text) return [];
  const n = text.length;
  const dp = new Array<number>(n + 1).fill(-Infinity);
  const back: Array<{ prev: number; piece: string } | null> = new Array(n + 1).fill(null);
  dp[0] = 0;

  for (let i = 0; i < n; i++) {
    if (dp[i] === -Infinity) continue;
    const maxLen = Math.min(MAX_PIECE, n - i);
    for (let len = 1; len <= maxLen; len++) {
      const piece = text.slice(i, i + len);
      let logp = VOCAB.get(piece);
      if (logp === undefined) {
        if (len > 1) continue;
        logp = LOG_SINGLE;
      }
      const j = i + len;
      const score = dp[i] + logp;
      if (score > dp[j]) {
        dp[j] = score;
        back[j] = { prev: i, piece };
      }
    }
  }

  if (dp[n] === -Infinity || !back[n]) {
    return [...text];
  }

  const pieces: string[] = [];
  let pos = n;
  while (pos > 0 && back[pos]) {
    const { prev, piece } = back[pos]!;
    pieces.unshift(piece);
    pos = prev;
  }
  return pieces;
}

export const unigramTokenizer: TokenizerModule = {
  meta: {
    id: "unigram",
    name: "Unigram LM",
    summary: "",
    complexity: "O(n · L<sub>max</sub>)",
    refs: [
      { label: "Kudo 2018 — Unigram LM", url: "https://arxiv.org/abs/1808.06226" },
      { label: "SentencePiece", url: "https://github.com/google/sentencepiece" }
    ]
  },
  tokenize(text: string): Token[] {
    const pieces = viterbiSegment(text);
    return pieces.map((piece, idx) => ({
      text: piece,
      id: PIECE_IDS.get(piece) ?? 9000 + idx,
      kind: kindFor(piece),
      display: vis(piece)
    }));
  },
  Explanation: UnigramExplanation
};
