# Demo 组件

组件注册：`theme/index.ts`（`enhanceApp` 中 `defineAsyncComponent`）  
设计规范：`DESIGN.md`（仓库根目录）

## 新增 Demo

1. `demos/{id}/README.md` 说明
2. 在 `theme/index.ts` 的 `enhanceApp` 用 `defineAsyncComponent` 注册组件标签（如 `demo-xxx`）
3. 新建 `docs/demos/{id}/index.md`：`layout: page`、`pageClass: demo-page`、`outline: false`、内嵌 `<demo-xxx />`
4. 在 `gallery-sections.ts` 加 Gallery 卡片 + `docs/public/gallery/demos/{id}.webp` 截图

单 demo 页面不设 overview，总览在 `docs/demos/index.md`。

## 分词器（Tokenizer Visualizer）

**内容编辑地图见仓库根目录 [`demos/tokenizer/README.md`](../../../../../../demos/tokenizer/README.md)。**

目录：`theme/components/demos/tokenizer/`

每个算法：`meta`、`tokenize()`、`init?()`、`Explanation.vue`（含 References）。  
注册：`registry.ts` → `TOKENIZER_META`（下拉元数据）+ `loadTokenizerModule(id)`（按需加载完整模块）。

主界面为工作台布局：算法 / 输入 / Token 输出三卡片 + 右侧统计与详情。说明文案在 `TokenizerDemo.vue`。

## 数独（Sudoku Lab）

**内容编辑地图见仓库根目录 [`demos/sudoku/README.md`](../../../../../../demos/sudoku/README.md)。**

目录：`theme/components/demos/sudoku/`（`DemoSudokuLoader.vue` 为异步入口包装）

题库由 `npm run prepare:sudoku` 生成至 `theme/data/sudoku/`。进行中对局仅内存。

**持久化**：

- `sessionStorage`：密码门禁
- `localStorage`：最快用时、完成历史、存储模式
- `indexedDB` + File System Access API：可选文件同步（见 `sudoku-storage.ts`、`SudokuHistory.vue`）
