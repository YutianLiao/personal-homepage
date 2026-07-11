# Tokenizer Visualizer

交互式分词 Demo。页面壳：`docs/demos/tokenizer/index.md`，组件：`docs/.vitepress/theme/components/demos/`。

## 页面布局

```
┌─────────────────────────────────────────────────────────┐
│  Masthead：Tokenizer Visualizer                          │
├──────────────────────────────┬──────────────────────────┤
│  主工作台（左）               │  统计与详情（右 sticky）   │
│  ├ 算法卡片（下拉 + 载入示例） │  ├ 字符 / Token / 比值   │
│  ├ 输入文本卡片（textarea）   │  ├ Token 类型图例         │
│  └ Token 输出卡片（chips）    │  └ Token 详情表           │
├──────────────────────────────┴──────────────────────────┤
│  算法说明（底部折叠区）                                   │
│  ├ 「什么是分词器」（固定）                               │
│  └ 当前算法 Explanation + References（随下拉切换）      │
└─────────────────────────────────────────────────────────┘
```

## 改哪里？（内容地图）

| 想改什么 | 文件 |
| --- | --- |
| 页面布局、三卡片 UI、右侧统计表 | `theme/components/demos/TokenizerDemo.vue` |
| 「什么是分词器」固定说明 | `TokenizerDemo.vue` → `.tokenizer-demo__learn` 第一个 `<details>` |
| 算法下拉名称、简介、复杂度徽章 | `theme/components/demos/tokenizer/*.ts` 里各模块的 `meta`（`name` / `summary` / `complexity`） |
| 某算法的原理、步骤、References 链接 | 同目录下 `*Explanation.vue`（如 `BpeExplanation.vue`） |
| 默认示例文本、统计辅助函数 | `theme/components/demos/tokenizer/utils.ts`（`SAMPLE_TEXTS`、`TOKEN_KIND_LABELS` 等） |
| 注册/排序算法、切换 BPE 词表 | `theme/components/demos/tokenizer/registry.ts`（`TOKENIZER_META` + `loadTokenizerModule`）、`bpe.ts` |
| UI 卡片标题（「算法」「输入文本」「Token 输出」） | `TokenizerDemo.vue` 模板 |
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
