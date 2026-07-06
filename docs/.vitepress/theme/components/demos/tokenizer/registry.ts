import type { TokenizerMeta, TokenizerModule } from "./types";

/** Lightweight metadata for algorithm dropdown (no heavy imports). */
export const TOKENIZER_META: Pick<TokenizerMeta, "id" | "name">[] = [
  { id: "whitespace", name: "空格分词 (Whitespace)" },
  { id: "character", name: "字符分词 (Character)" },
  { id: "byte", name: "字节分词 (Byte)" },
  { id: "unigram", name: "Unigram" },
  { id: "bpe", name: "BPE (tiktoken)" },
  { id: "wordpiece", name: "WordPiece (BERT)" }
];

const loaders: Record<string, () => Promise<TokenizerModule>> = {
  whitespace: () => import("./whitespace").then((m) => m.whitespaceTokenizer),
  character: () => import("./character").then((m) => m.characterTokenizer),
  byte: () => import("./byte").then((m) => m.byteTokenizer),
  unigram: () => import("./unigram").then((m) => m.unigramTokenizer),
  bpe: () => import("./bpe").then((m) => m.bpeTokenizer),
  wordpiece: () => import("./wordpiece").then((m) => m.wordpieceTokenizer)
};

const moduleCache = new Map<string, TokenizerModule>();

export async function loadTokenizerModule(
  id: string
): Promise<TokenizerModule | undefined> {
  const cached = moduleCache.get(id);
  if (cached) return cached;
  const loader = loaders[id];
  if (!loader) return undefined;
  const mod = await loader();
  moduleCache.set(id, mod);
  return mod;
}

export type { Token, TokenKind, TokenizerMeta, BpeEncodingId } from "./types";
