# Demo 组件

注册表：`docs/.vitepress/demos.json`  
设计规范：`DESIGN.md`（仓库根目录）

## 新增 Demo

1. `demos/{id}/README.md` 说明
2. `demos.json` 添加 `{ id, title, route, component, sourceDir }`
3. 新建 `docs/demos/{id}/index.md`：`layout: page`、`pageClass: demo-page`、`outline: false`、`<demo-xxx />`
4. 在 `theme/index.ts` 的 `enhanceApp` 以 `defineAsyncComponent` 异步注册 Vue 组件

单 demo 页面不设 overview，总览在 `docs/demos/index.md`。

## 分词器（Tokenizer Visualizer）

**内容编辑地图见仓库根目录 [`demos/tokenizer/README.md`](../../../../../../demos/tokenizer/README.md)。**

目录：`theme/components/demos/tokenizer/`

每个算法：`meta`、`tokenize()`、`init?()`、`Explanation.vue`（含 References）。  
注册：`registry.ts` → `TOKENIZER_META`（下拉元数据）+ `loadTokenizerModule(id)`（按需加载完整模块）。

左侧固定说明与 UI 文案在 `TokenizerDemo.vue`。
