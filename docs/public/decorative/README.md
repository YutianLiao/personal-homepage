# Decorative assets

Transparent PNG / SVG exports. Missing files are hidden via `onerror`.

## 入库策略

装饰 PNG 放在本目录对应路径，**部署前须已提交至 Git**（GitHub Pages 从仓库构建，未跟踪文件不会上线）。

数独 Demo（`/demos/sudoku/`）两侧素描为 Vue 组件内联 SVG（`SudokuSketchDecor.vue`），**不**使用本目录。

## 文件清单

| File | Used on | Placement |
|------|---------|-----------|
| `hero-sketch/` | Home | Meadow sketch (right, absolute, blends into bg); flora under title |
| `scientist-sketches/` | Doc pages with right outline | Pencil portrait below **On this page** — one per nav section; see [`scientist-sketches/README.md`](scientist-sketches/README.md) |
| `journey-left.png` | Interest Journey — Learning Archive | Upper-left viewport |
| `journey-right.png` | Interest Journey — Learning Archive | Mid-right viewport |
| `misc-left.png` | Miscellaneous | Bottom-left viewport |
| `misc-right.png` | Miscellaneous | Bottom-right viewport |
| `sudoku-watermark.svg` 等 | 首页 `HomeMathPiece` 等 | **非** Sudoku Demo 页 |

Corner stickers: about **220-320px** each.

**Note:** Knowledge Planet does not show journey decorative stickers.
