# Demo 组件

注册表：`docs/.vitepress/demos.json`

## 新增 Demo

1. `demos.json` 添加 `{ id, title, route, component }`
2. 新建 `docs/demos/{id}.md`：`layout: page`、`pageClass: demo-page`、`outline: false`
3. 在 `theme/index.ts` 的 `enhanceApp` 注册 Vue 组件
4. `config.ts` 会自动从 `demos.json` 生成 nav 与 sidebar

## 分词器算法模块

目录：`theme/components/demos/tokenizer/`

每个算法导出：

- `meta`：`id`, `name`, `summary`, `complexity`, `refs?`
- `tokenize(text)` → `Token[]`（可 async）
- `init?()`：加载词表
- `Explanation`：Vue 组件（算法详解）

注册：在 `registry.ts` 的 `TOKENIZER_MODULES` 追加。

词表资源：`docs/public/demos/tokenizer/`（如 `bert-vocab.txt`）。

BPE：`js-tiktoken`，`bpe.ts` 中 `setBpeEncoding(id)` 切换词表。
