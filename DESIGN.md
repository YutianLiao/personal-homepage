# Site Design System

极简学术主页视觉规范。实现见 `docs/.vitepress/theme/tokens.css` 与 `custom.css`。

## 设计参考

| 来源 | 采纳要点 |
| --- | --- |
| [Refactoring UI](https://www.refactoringui.com/) | 模块化字号/间距阶梯、中性色 ramp、用层次而非堆边框造深度 |
| [Butterick's Practical Typography](https://practicaltypography.com/) | 正文行宽 ~65–75 字符、行高 1.6–1.8、衬线正文 + 无衬线标签 |
| [Radix Colors](https://www.radix-ui.com/colors) | 暖灰中性 ramp + 强调色分级 |
| Tufte / iA | 克制装饰、高数据墨水比、充足留白 |

## 原则

- **衬线正文 + 无衬线标题/标签**：英文 Source 系列 + 中文 Noto 思源系列，风格同源
- **强调色** `--site-accent`（绯红）用于链接、锚点、细线；**辅助色** `--site-secondary`（墨蓝）用于次要强调
- **层次**：`.site-panel` 卡片（浅边框 + surface + 轻阴影）优于纯发丝分隔线
- **交互**：细边框 + 浅底色 hover；不用 scale 动画
- **CJK**：`font-synthesis: none`，避免浏览器合成假斜体

## 字体

| 用途 | 变量 | 栈 |
| --- | --- | --- |
| 正文 | `--site-serif` | Source Serif 4 → Noto Serif SC → Songti SC |
| 标签/导航 | `--site-sans` | Source Sans 3 → Noto Sans SC → PingFang SC |
| 代码/Token | `--vp-font-family-mono` | ui-monospace, Cascadia Code, Menlo |

嵌入组件（Demo 说明区等）在容器上加 `.site-prose`，与 `.vp-doc` 共享链接/正文样式。

## Tokens

### 颜色 ramp

- **中性** `--n-50` … `--n-900`（暖石色）
- **强调** `--a-50`, `--a-500`, `--a-600`, `--a-700`（绯红）
- **辅助** `--b-50`, `--b-500`, `--b-600`（墨蓝）

语义变量：`--site-bg`, `--site-surface`, `--site-text`, `--site-text-secondary`, `--site-text-muted`, `--site-accent`, `--site-border` …

### 字号（1.25 模块比）

`--fs-xs` (0.72rem) → `--fs-3xl` (clamp hero)

### 间距（4px 基数）

`--space-1` (4px) … `--space-12` (48px)

### 布局

| 变量 | 值 |
| --- | --- |
| `--site-measure` | 68ch（正文行宽） |
| `--site-page-max` | 72rem |
| `--site-gutter` | clamp(1.25rem, 4.5vw, 2.75rem) |
| `--site-panel-padding` | 1.25rem 1.5rem |

## 组件

- **`.site-section-eyebrow`**：大写标签 + accent 短横线
- **`.site-panel`**：统一卡片（首页 features、timeline、Demo 模块）
- **`.site-prose`**：与 Markdown 正文共享排版（链接、strong、code）

## 模块样式

- **章节标题 (h2)**：无衬线、英文斜体（`font-synthesis: none`）；非首个 h2 上方渐变分隔线
- **折叠区块**：底部分隔线、summary 行式布局
- **Demo 工作台**：左文档 + 右可视化/统计；各模块 `.site-panel` 边框

## 反模式

- 三栏挤占说明文字
- 默认浏览器 `<details>` 灰框
- 彩虹渐变、emoji 装饰、Inter/Roboto
- 中文回退系统宋体（须加载 Noto webfont）
- 无 `site-prose` 的嵌入组件内链接失去 accent 样式
