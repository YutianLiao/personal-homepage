# Tokenizer Visualizer

交互式分词 Demo。页面壳：`docs/demos/tokenizer/index.md`，组件：`docs/.vitepress/theme/components/demos/`。

## 改哪里？（内容地图）

| 想改什么 | 文件 |
| --- | --- |
| 左侧「什么是分词器」介绍、计费提示 | `theme/components/demos/TokenizerDemo.vue`（模板顶部 `panel-body` 段落） |
| 算法下拉名称、简介、复杂度徽章 | `theme/components/demos/tokenizer/*.ts` 里各模块的 `meta`（`name` / `summary` / `complexity`） |
| 某算法的原理、步骤、References 链接 | 同目录下 `*Explanation.vue`（如 `BpeExplanation.vue`） |
| 默认示例文本、中文计费统计逻辑 | `theme/components/demos/tokenizer/utils.ts`（`SAMPLE_TEXTS` 等） |
| 注册/排序算法、切换 BPE 词表 | `theme/components/demos/tokenizer/registry.ts`（`TOKENIZER_META` + `loadTokenizerModule`）、`bpe.ts` |
| UI 标签（「算法」「输入文本」）、统计区文案 | `TokenizerDemo.vue` 模板 |
| 颜色、间距、边框 | `docs/.vitepress/theme/tokens.css`、`custom.css`（`.tokenizer-demo` 段） |
| 导航标题、路由 | `docs/.vitepress/demos.json` |
| BERT 词表文件 | `docs/public/demos/tokenizer/bert-vocab.txt` |

**不要改** `docs/demos/tokenizer/index.md` 里的正文（只有 `<demo-tokenizer />` 壳）；**不要改** `docs/hello-agent/` 等构建同步目录。

## 算法模块结构

```
theme/components/demos/tokenizer/
├── registry.ts           # TOKENIZER_META + loadTokenizerModule（动态 import）
├── types.ts
├── utils.ts              # 示例文本、显示辅助
├── whitespace.ts + WhitespaceExplanation.vue
├── character.ts + CharacterExplanation.vue
├── byte.ts + ByteExplanation.vue
├── unigram.ts + UnigramExplanation.vue
├── bpe.ts + BpeExplanation.vue
└── wordpiece.ts + WordpieceExplanation.vue
```

每个算法：`meta` + `tokenize()` + 可选 `init()` + `Explanation.vue`。

## 加载策略

- `theme/index.ts` 以 `defineAsyncComponent` 注册 `<demo-tokenizer />`，未访问 Demo 页时不加载任何分词器代码。
- 进入 Demo 后默认算法为 **whitespace**（无外部资源）；切换算法时才 `import()` 对应模块与 Explanation。
- **BPE**：`js-tiktoken/lite` + 按 encoding 动态加载单 rank（cl100k ~1 MB / o200k ~2.2 MB），非全量 5.3 MB 包。
- **WordPiece**：`fetch` `bert-vocab.txt`（~226 KB），仅在选用时请求。

## 开发

```bash
npm run dev
# 打开 /demos/tokenizer/
```

BPE 首次切换会动态加载 `js-tiktoken/lite` 与对应 rank，仅在该页发生，不影响全站其他页面。
