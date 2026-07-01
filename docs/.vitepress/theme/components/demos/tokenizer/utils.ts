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

function visWhitespace(text: string): string | undefined {
  if (text === " ") return "␣";
  if (text === "\n") return "↵";
  if (text === "\t") return "⇥";
  return undefined;
}

/** True when bytes form a complete, valid UTF-8 codepoint sequence. */
export function isValidUtf8(bytes: number[] | Uint8Array): boolean {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (arr.length === 0) return false;
  try {
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(arr);
    const re = new TextEncoder().encode(decoded);
    return re.length === arr.length && re.every((b, i) => b === arr[i]);
  } catch {
    return false;
  }
}

function hexDisplay(bytes: number[]): { text: string; display: string; partialUtf8: boolean } {
  const hex = bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ");
  return { text: "", display: hex, partialUtf8: true };
}

/** Decode bytes for display; fall back to hex when not valid standalone UTF-8. */
export function formatFromBytes(bytes: number[]): {
  text: string;
  display: string;
  partialUtf8: boolean;
} {
  if (bytes.length === 0) {
    return { text: "", display: "∅", partialUtf8: true };
  }

  if (isValidUtf8(bytes)) {
    const decoded = new TextDecoder("utf-8").decode(new Uint8Array(bytes));
    const vis = visWhitespace(decoded);
    return { text: decoded, display: vis ?? decoded, partialUtf8: false };
  }

  return hexDisplay(bytes);
}

export function tokenDisplay(token: Token): string {
  if (token.display) return token.display;
  if (token.partialUtf8 && token.bytes?.length) {
    return token.bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ");
  }
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

export function countCjkChars(text: string): number {
  return [...text].filter((ch) => /\p{Script=Han}/u.test(ch)).length;
}

export function countLatinLetters(text: string): number {
  const m = text.match(/[a-zA-Z]/g);
  return m ? m.length : 0;
}

export const SAMPLE_TEXTS = [
  "安得广厦千万间，大庇天下寒士俱欢颜。",
  "I have a dream that one day… the sons of former slaves and the sons of former slave-owners will be able to sit down together at the table of brotherhood."
];
