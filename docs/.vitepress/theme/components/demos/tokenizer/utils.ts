import type { Token, TokenKind } from "./types";

const KIND_ORDER: TokenKind[] = ["word", "subword", "char", "byte", "space", "punct", "special"];

export const TOKEN_KIND_LABELS: Record<TokenKind, string> = {
  word: "词 / 片段",
  subword: "子词 (BPE / WordPiece)",
  char: "字符",
  byte: "字节",
  space: "空白",
  punct: "标点",
  special: "特殊符号"
};

export function tokenDisplay(token: Token): string {
  if (token.display) return token.display;
  if (token.text === " ") return "␣";
  if (token.text === "\n") return "↵";
  if (token.text === "\t") return "⇥";
  return token.text;
}

export function bytesLabel(bytes?: number[]): string {
  if (!bytes?.length) return "—";
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ");
}

export function kindColorIndex(kind: TokenKind): number {
  const idx = KIND_ORDER.indexOf(kind);
  return idx >= 0 ? idx : 0;
}

export const SAMPLE_TEXTS = [
  "Hello, world! 你好世界",
  "Tokenization bridges raw text and neural networks.",
  "GPT-4 uses BPE on UTF-8 bytes with a large vocabulary.",
  "BERT uses WordPiece with ## prefixes for subwords."
];
