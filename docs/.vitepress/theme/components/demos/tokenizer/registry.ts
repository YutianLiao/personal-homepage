import type { TokenizerModule } from "./types";
import { bpeTokenizer } from "./bpe";
import { byteTokenizer } from "./byte";
import { characterTokenizer } from "./character";
import { whitespaceTokenizer } from "./whitespace";
import { unigramTokenizer } from "./unigram";
import { wordpieceTokenizer } from "./wordpiece";

export const TOKENIZER_MODULES: TokenizerModule[] = [
  whitespaceTokenizer,
  characterTokenizer,
  byteTokenizer,
  unigramTokenizer,
  bpeTokenizer,
  wordpieceTokenizer
];

export function getTokenizerById(id: string): TokenizerModule | undefined {
  return TOKENIZER_MODULES.find((m) => m.meta.id === id);
}

export { setBpeEncoding, getBpeEncodingId } from "./bpe";
export type { Token, TokenKind, TokenizerMeta, BpeEncodingId } from "./types";
