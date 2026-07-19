# Site Design System

极简学术主页视觉规范。实现见 `docs/.vitepress/theme/tokens.css` 与 `custom.css`。

## 固定画布缩放（只加壳）

全站外包一层缩放壳：`scale = innerWidth / 1680`，按宽等比缩放 + 纵向滚动。

| 文件 | 职责 |
| --- | --- |
| `theme/components/SiteScaleViewport.vue` | 唯一缩放逻辑；`Layout.vue` 包裹 `DefaultLayout` |
| `theme/site-scale.css` | **仅**禁止结构型断点（移动端堆叠/汉堡菜单）；不改页面排版 |

**边界**：各页布局（Biography、Timeline、知识星球三栏等）仍由页面自己的 CSS 决定；外壳不得改 gutter、对齐、栅格数值。设计宽 `DESIGN_W = 1680`（略大于原 1440，同窗口下 UI 更小）；只改 `SiteScaleViewport.vue` 内该常量即可调大小。

`position: fixed` 面板（侧栏、知识星球）在 `zoom` 下会按视口高度再被缩小而裁切底部；外壳同步写入 `--site-stage-min-h = innerHeight / scale`，并校正这些面板高度，以适配不同浏览器尺寸。

**顶栏 / 左栏**：顶栏在所有页面使用同一套几何（忽略 VitePress `has-sidebar` 对 Logo/菜单的偏移），翻页时位置不变。左边栏是顶栏下方的独立内容轨（固定宽 + 充足内边距 + 右边线），不再占用顶栏 Logo 列。

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
- **层次**：首页用发丝分隔线纵向排列；Demo 等交互模块用 `.site-panel` 卡片
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

- **`.site-section-eyebrow`**：大写标签 + accent 短横线（文档/Demo 模块标题）
- **`.site-panel`**：统一卡片（Demo 模块等交互工作台）
- **`.site-prose`**：与 Markdown 正文共享排版（链接、strong、code）
- **`.site-sketch-decor`**：铅笔素描与页面背景融合（`multiply` + 径向遮罩 + `--site-bg` 晕染）；首页环境图与文档右栏科学家肖像共用

## Doc 右栏科学家素描

在桌面端出现 **On this page** 右栏的文档页，于大纲 **下方约 2.5rem** 展示一位著名科学家的铅笔肖像。**按导航分区共用一位科学家**（同一路由前缀下的所有子页显示同一张肖像），而非每页一位。

| 路由前缀 | 科学家 | 覆盖范围 |
| --- | --- | --- |
| `/miscellaneous` | Feynman | Miscellaneous |
| `/cv` | Gauss | CV |
| `/interest-journey/learning-archive` | Hardy | Learning Archive |
| `/blog` | Ramanujan | Blog 全部文章 |
| `/collections` | Ramanujan | Collections（与 Blog 共用） |
| `/hello-agent` | Turing | Hello Agent 模块全部章节 |
| `/my-notes` | Shannon | My Notes 全部笔记 |

未分配分区、或 `outline: false` / 无大纲的页面不显示。`scientists` 库中未使用的肖像保留备扩展，不删除。

| 层级 | 文件 | 职责 |
| --- | --- | --- |
| 注册表 | `docs/.vitepress/doc-aside-scientists.json` | `scientists`（id → 姓名、图片）、`sections`（路由前缀 → id，最长前缀匹配） |
| 查找 | `theme/composables/useDocAsideScientist.ts` | 路由归一化、前缀匹配、排除 `home`/`page`/`outline: false`、无大纲不渲染 |
| 展示 | `theme/components/DocAsideScientistSketch.vue` | 竖版 3:4，`width: 100%` 填满右栏 |
| 注入 | `Layout.vue` `#aside-outline-after` | 默认 doc 布局 |
| 注入 | `LearningModuleDoc.vue` `#aside-outline-after` | Learning 模块 |
| 样式 | `custom.css` `.site-sketch-decor--aside` | 比首页 env 略清晰（opacity 0.74，晕染略弱） |
| 素材 | `docs/public/decorative/scientist-sketches/` | `{id}.png`，见目录内 README |

**触发条件**：`layout` 非 `home`/`page`；`outline !== false`；页面存在 h2/h3 大纲。

**新分区 Checklist**

1. 确认该分区下页面在桌面端会出现 **On this page**
2. 在 `sections` 添加 `{ "prefix": "/your-prefix", "scientist": "id" }`
3. 若为新科学家：在 `scientists` 添加条目 + `scientist-sketches/{id}.png`
4. 目视检查该分区下任意子页是否显示同一肖像

科学家库共 15 位，当前 6 位在用、9 位保留；详见 [`scientist-sketches/README.md`](docs/public/decorative/scientist-sketches/README.md)。

## 模块样式

- **首页 Hero / Features / Timeline**：纵向列表 + 底部分隔线；右侧素描环境图（`hero-sketch/env.png`）与页面背景融合叠放；标题下使用柔和彩虹素描（`rainbow.png`）；数独 / 公式等数学水印保持低干扰
- **分区 Gallery**：Interest Journey / Learning / Demo 使用真实页面截图组成双列编辑式画廊；无厚重卡片底色，图片使用直角纸框、轻微错位节奏，标题与描述置于图下
- **章节标题 (h2)**：无衬线、英文斜体（`font-synthesis: none`）；非首个 h2 上方渐变分隔线
- **折叠区块**：底部分隔线、summary 行式布局
- **Demo 工作台**：左文档 + 右可视化/统计；各模块 `.site-panel` 边框
- **Knowledge Planet**：全视口沉浸式三栏；CSS 星云背景（冷暖对撞）；左右玻璃面板；中间 Three.js 球体（知识点光晕、球面连线、球外星轨、远景星尘）；点击知识点显示详情；按需渲染降低静止时 GPU 占用

## 反模式

- 三栏挤占说明文字
- 默认浏览器 `<details>` 灰框
- 彩虹渐变、emoji 装饰、Inter/Roboto
- 中文回退系统宋体（须加载 Noto webfont）
- 无 `site-prose` 的嵌入组件内链接失去 accent 样式
