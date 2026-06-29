export type TokenKind = "word" | "char" | "byte" | "subword" | "special" | "space" | "punct";

export interface Token {
  text: string;
  id?: number;
  bytes?: number[];
  kind: TokenKind;
  /** Visible label in chips (e.g. whitespace symbols). */
  display?: string;
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

export interface TokenizerModule {
  meta: TokenizerMeta;
  tokenize: (text: string) => Promise<Token[]> | Token[];
  init?: () => Promise<void>;
  Explanation: object;
}

export type BpeEncodingId = "cl100k_base" | "o200k_base";
