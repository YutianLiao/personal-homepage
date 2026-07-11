export type TokenKind = "word" | "char" | "byte" | "subword" | "special" | "space" | "punct";

export interface Token {
  text: string;
  id?: number;
  bytes?: number[];
  kind: TokenKind;
  /** Visible label in chips (e.g. whitespace symbols). */
  display?: string;
  /** BPE byte token that is not valid standalone UTF-8 (show hex instead of ?). */
  partialUtf8?: boolean;
}

export interface TokenizerRef {
  label: string;
  url: string;
}

export interface TokenizerMeta {
  id: string;
  name: string;
  summary: string;
  complexity: string;
  refs?: TokenizerRef[];
}

export interface VocabLoadProgress {
  /** 0–100 */
  progress: number;
  message: string;
}

export interface TokenizerInitOptions {
  bpeEncodingId?: BpeEncodingId;
  onVocabProgress?: (progress: VocabLoadProgress) => void;
}

export interface TokenizerModule {
  meta: TokenizerMeta;
  tokenize: (text: string) => Promise<Token[]> | Token[];
  init?: (options?: TokenizerInitOptions) => Promise<void>;
  Explanation: object;
}

/** Algorithms that fetch or import an external vocabulary before tokenizing. */
export const VOCAB_TOKENIZER_IDS = ["bpe", "wordpiece"] as const;
export type VocabTokenizerId = (typeof VOCAB_TOKENIZER_IDS)[number];

export type BpeEncodingId = "cl100k_base" | "o200k_base";
