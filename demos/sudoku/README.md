# Sudoku Lab

交互式数独 Demo。页面壳：`docs/demos/sudoku/index.md`，组件：`docs/.vitepress/theme/components/demos/sudoku/`。

## 改哪里？（内容地图）

| 想改什么 | 文件 |
| --- | --- |
| 密码门禁、大厅/对局状态机、Arena 面板 | `SudokuDemo.vue` |
| 登录 UI | `SudokuLogin.vue` |
| 挑战新题 / 历史挑战 | `SudokuLobby.vue` |
| 棋盘、计时、主题、笔记、提交 | `SudokuBoard.vue`、`SudokuGrid.vue`、`SudokuKeypad.vue` |
| 名人堂与个人差距 | `SudokuHallOfFame.vue`、`data/sudoku/hall-of-fame.json` |
| 个人统计 | `SudokuStats.vue` |
| 历史记录与文件同步 UI | `SudokuHistory.vue` |
| 完成撒花 | `SudokuConfetti.vue` |
| 两侧素描装饰 | `SudokuSketchDecor.vue`（左：可推导填数示意；右：笔记模式教程） |
| 引擎（冲突 / 完成 / 笔记） | `engine/sudoku-engine.ts` |
| 对局逻辑（撤销、失败锁定、提交） | `composables/useSudokuGame.ts` |
| 题库索引与懒加载 | `composables/useSudokuPuzzles.ts`、`scripts/prepare-sudoku-puzzles.mjs` |
| 成绩与历史持久化、文件同步 | `composables/useSudokuRecords.ts`、`composables/sudoku-storage.ts` |
| 密码门禁 | `composables/useSudokuAuth.ts` |
| 样式 | `docs/.vitepress/theme/custom.css`（`.sudoku-demo`、`.sudoku-sketch-decor`）、`site-scale.css` |
| 导航标题、路由 | `docs/.vitepress/demos.json` |

**不要改** `docs/demos/sudoku/index.md` 里的正文（只有 `<demo-sudoku />` 壳）。

## 对局规则

- 无暂停、无提示；计时从开始到完成连续运行
- 进行中对局仅存内存；返回大厅 / 路由离开 / 刷新 / 关标签视为放弃，不写入成绩
- 须手动点击**提交**；提交失败会锁定棋盘并高亮错误格，可重试同一题
- 仅合法完成时写入成绩与完成历史

## 游戏能力

- **笔记模式**：小字候选数，与填数互斥
- **撤销**：单步回退
- **主题**：Light / Midnight Ink
- **Arena 面板**：名人堂、统计、历史记录（抽屉 overlay）
- **放弃确认**：返回大厅前二次确认
- **装饰**：宽屏两侧内联 SVG 素描（`SudokuSketchDecor.vue`），窄屏隐藏

## 存储模型

| 层 | 键 / 库 | 内容 |
| --- | --- | --- |
| `sessionStorage` | `sudoku-auth` | 密码门禁 token（SHA-256，非明文） |
| `localStorage` | `sudoku-records-v1` | 各题最快用时 |
| `localStorage` | `sudoku-history-v1` | 完成历史（最多 500 条） |
| `localStorage` | `sudoku-storage-mode-v1` | 存储模式：`local` 或 `file` |
| `indexedDB` | `sudoku-lab-db` | File System Access API 文件句柄 |
| 用户文件 | JSON bundle | 绑定本地文件后双向同步 records + history |

**文件同步**（Chrome / Edge 等支持 File System Access API 的浏览器）：

- 绑定已有 JSON、创建新文件、解绑
- 导出备份、从文件导入（覆盖或合并）
- 完成一局后若处于 `file` 模式，自动写回绑定文件

不支持文件 API 时回退为纯 `localStorage`，历史面板会提示。

## 题库

运行 `npm run prepare:sudoku`（`predev` / `prebuild` 会自动执行）生成：

- `docs/.vitepress/theme/data/sudoku/puzzle-index.json`
- `docs/.vitepress/theme/data/sudoku/puzzles-{easy,medium,hard,expert}.json`

来源：Sudoku Exchange Puzzle Bank（Public Domain）+ HiSudoku PuzzleLibrary（抽样）。
