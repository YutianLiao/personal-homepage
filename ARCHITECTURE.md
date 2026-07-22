# personal-homepage

VitePress 个人主页。本地：`npm run dev` → `http://localhost:5173`。

更完整的入门说明见根目录 [`README.md`](README.md)。写作规范见 [`WRITING_CONVENTIONS.md`](WRITING_CONVENTIONS.md)。页面校对进度见 [`PAGE_CHECKLIST.md`](PAGE_CHECKLIST.md)。

## 目录

```
personal-homepage/
├── README.md
├── ARCHITECTURE.md
├── DESIGN.md
├── WRITING_CONVENTIONS.md
├── learning/                 # 学习模块内容源
│   ├── hello-agent/
│   └── my-notes/
├── demos/                    # Demo 内容源
│   ├── tokenizer/README.md
│   └── sudoku/README.md
├── data/
│   └── knowledge-planet.json    # Knowledge Planet 数据源（脚本读写）
├── knowledge-planet/            # Knowledge Planet 说明文档
├── scripts/
│   ├── build-learning-modules.mjs
│   ├── knowledge-planet.mjs     # 知识点增删 / 球面坐标维护
│   ├── lib/knowledge-planet-utils.mjs
│   └── prepare-sudoku-puzzles.mjs
└── docs/
    ├── .vitepress/
    │   ├── config.ts
    │   ├── learning-modules.json   # 模块注册表
    │   ├── demos.json              # Demo 注册表
    │   ├── gallery-sections.ts     # 三分区 Gallery 数据 + 归属判定
    │   ├── doc-aside-scientists.json  # 右栏科学家映射
    │   ├── module-top-navs.ts      # 模块顶部导航数据
    │   ├── learning-sidebars.json  # 自动生成
    │   ├── learning-manifests.json # 自动生成（Prev/Next）
    │   ├── transformPageData.ts    # config.ts 入口，编排下列 transform
    │   ├── transformLearningModule.ts  # 阅读时间 / 布局 / Prev·Next
    │   ├── transformGalleryPages.ts    # 分区总览页 outline / pageClass
    │   └── theme/
    │       ├── tokens.css          # UI 超参数（字体、标题大小等）
    │       ├── custom.css
    │       └── LearningModuleDoc.vue
    ├── interest-journey/       # Interest Journey 子页（手改 Markdown）
    │   ├── learning-archive.md
    │   └── knowledge-planet.md
    ├── collections/            # 经 Miscellaneous 链入，无独立 nav
    │   ├── movies.md
    │   └── open-problems.md
    ├── demos/
    │   ├── index.md
    │   ├── tokenizer/index.md
    │   └── sudoku/index.md
    ├── hello-agent/          # 构建同步，勿手改
    └── my-notes/             # 构建同步，勿手改
```

## 学习模块

注册：`docs/.vitepress/learning-modules.json`

内容源目录结构（以 `learning/hello-agent/` 为例）：

```
learning/{module}/
├── index.md
├── NN-slug/part.json         # { "title": "分部名" }
├── NN-slug/assets/
└── NN-slug/NN-标题.md        # frontmatter title
```

`My Notes` 是扁平笔记模块，注册项带 `"flat": true`。`index.md` 是导航总览；每个
`NN-topic.md` 是一篇自包含的完整笔记，不再拆成分部：

```
learning/my-notes/
├── index.md
├── 01-cs336.md
└── NN-topic.md
```

构建：`npm run build:learning-modules`（`predev`/`prebuild` 自动执行）

- 同步 `{sourceDir}/` → `docs/{id}/`
- 生成侧栏与分页清单
- 清理已从注册表移除的旧模块构建目录

文章页功能（`transformLearningModule.ts`）：阅读时间、Prev/Next、`layout: learning-module-doc`。

`/learning/` 是 Learning 模块的照片 Gallery 总览。顶栏点击 Learning 进入该页，悬浮显示模块快捷菜单；Gallery 元数据见 `gallery-sections.ts`。

## Demo 模块

注册：`docs/.vitepress/demos.json`

```
demos/
├── tokenizer/README.md
└── sudoku/README.md

docs/demos/
├── index.md
├── tokenizer/index.md
└── sudoku/index.md

docs/.vitepress/theme/components/demos/
├── TokenizerDemo.vue
├── tokenizer/
├── DemoSudokuLoader.vue      # 数独异步入口
└── sudoku/                   # Sudoku Lab
```

设计规范：`DESIGN.md`。组件约定：`theme/components/demos/README.md`。

与 Learning 差异：Demo 为交互式 Vue 组件；Sudoku 题库由 `npm run prepare:sudoku` 生成（`predev`/`prebuild` 自动执行）。sidebar 由 `demos.json` 驱动；顶栏与 `/demos/` Gallery 的文案、链接和截图由 `gallery-sections.ts` 驱动。

**按需加载**：`theme/index.ts` 以 `defineAsyncComponent` 注册 Demo 组件；算法模块与重资源（BPE `js-tiktoken/lite` + 单 rank、WordPiece `bert-vocab.txt`）仅在用户进入 Demo 页并选用对应算法时加载。默认算法为轻量 `whitespace`，避免首屏拉取词表。Sudoku 题库按难度分片懒加载。

**Sudoku 存储**（详见 `demos/sudoku/README.md`）：`sessionStorage` 门禁；`localStorage` 成绩与历史；可选 File System Access API + `indexedDB` 文件同步。

新增 Demo：`demos.json` 注册 → `docs/demos/{id}/index.md` → `theme/index.ts` 异步注册组件 → 在 `gallery-sections.ts` 添加 Gallery 项并将页面截图放入 `docs/public/gallery/demos/`。

## Interest Journey

`/interest-journey/` 是照片 Gallery 总览；顶栏点击进入总览，悬浮显示两项快捷菜单。两张子页均 `sidebar: false`，无左侧栏。

| 路由 | 文件 | 内容 |
| --- | --- | --- |
| `/interest-journey/` | `docs/interest-journey/index.md` | Gallery 总览 |
| `/interest-journey/learning-archive` | `docs/interest-journey/learning-archive.md` | 课程/书籍/链接索引；`pageClass: interest-journey-page` |
| `/interest-journey/knowledge-planet` | `docs/interest-journey/knowledge-planet.md` | 3D 知识星球；`pageClass: knowledge-planet-page` |

**Learning Archive**：纯 Markdown，直接编辑 `learning-archive.md`。装饰图仅本页（`Layout.vue`）。

**Knowledge Planet**：三级结构（一级主题 → 二级主题 → 知识点）。数据 `data/knowledge-planet.json`，构建前同步至 `docs/public/data/knowledge-planet.json`。Vue + Three.js（异步加载）见 `theme/components/knowledge-planet/`。维护：`npm run kp:add` / `kp:remove` / `kp:redistribute`。文档：[`knowledge-planet/README.md`](knowledge-planet/README.md)（含页面功能、性能说明、Schema）。

与 **Learning** 区别：Learning 是长文笔记 + 构建同步；Interest Journey 的 Archive 是资源列表。

## Collections

路由 `/collections/*`，**无**顶栏 nav 与 sidebar 条目；经 `docs/miscellaneous.md` 内链访问。

| 路由 | 文件 |
| --- | --- |
| `/collections/movies` | `docs/collections/movies.md` |
| `/collections/open-problems` | `docs/collections/open-problems.md` |

Doc 右栏科学家素描映射见 `doc-aside-scientists.json`（含 Collections 对应画像）。

## 装饰资产

PNG / SVG 见 `docs/public/decorative/README.md`。**大部分 PNG 不入 Git 仓库**；缺失时组件 `onerror` 隐藏，站点仍可构建。发布前可将素材拷贝至对应路径，或使用 LFS / CI 外置供给。

数独 Demo 两侧装饰为组件内联 SVG（`SudokuSketchDecor.vue`），不依赖 `decorative/` 目录。

## UI tokens

`docs/.vitepress/theme/tokens.css`：颜色、字体、`--site-h1-size` 等。全站与学习模块共用，勿在模块内单独覆盖排版。

## 固定画布缩放

见 [`DESIGN.md`](DESIGN.md) § 固定画布缩放。实现：`SiteScaleViewport.vue` + `site-scale.css`（只加壳，不改页面布局）。

## 导航

`config.ts` → `themeConfig.nav`。Interest Journey / Learning / Demo 使用 `GalleryNavGroup.vue`：名称本身是 Gallery 总览链接，悬浮或聚焦时显示子页菜单。三个分区的数据统一来自 `gallery-sections.ts`，总览由 `SectionGallery.vue` 渲染；截图位于 `docs/public/gallery/`。全站导航中的古人读书背影与两行横渠四句由 `NavMissionVerse.vue` 注入 `Layout.vue` 的 `nav-bar-content-after` slot。

**顶部模块导航**：仅 Hello Agent / My Notes 由 `ModuleTopNav.vue` 渲染（数据见 `module-top-navs.ts`）；Learning 总览、Blog、Interest Journey、Demo、顶层单页等均不显示。

**右栏 On this page**：三个分区总览页（`/interest-journey/`、`/learning/`、`/demos/`）由 `GalleryAsideOutline.vue` 列出子页面（读 `gallery-sections.ts` 并在 `transformPageData` 时置 `outline: false`），其余文档页保留自身标题大纲。大纲下方由 `DocAsideScientistSketch.vue` 按分区展示科学家铅笔肖像（读 `doc-aside-scientists.json`，详见 `DESIGN.md`）。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 开发（自动执行 learning 同步、knowledge-planet 同步、数独题库准备） |
| `npm run build` | 生产构建 |
| `npm run build:learning-modules` | 同步学习模块 |
| `npm run sync:knowledge-planet` | 同步知识星球 JSON 至 public |
| `npm run prepare:sudoku` | 生成数独题库 JSON |
| `npm run kp:add` / `kp:remove` / `kp:redistribute` | 维护知识点 |
| `npm run build:pages` | 模拟 GitHub Pages `base` 路径构建 |
| `npm run preview:pages` | 构建并以 Pages base 预览 |

## Agent 检查

- [ ] 学习模块内容只改 `learning/{module}/`，未手改 `docs/{module}/`
- [ ] 新模块已写入 `learning-modules.json` 并执行构建
- [ ] My Notes 新笔记是根目录 `NN-topic.md`，并已加入 `learning/my-notes/index.md`
- [ ] 新 Demo 已写入 `demos.json` 并注册组件
- [ ] Gallery 子页变更已同步 `gallery-sections.ts`、本地 WebP 截图与对应总览
- [ ] Sudoku 功能变更已同步 `demos/sudoku/README.md` 与 `theme/components/demos/README.md`
- [ ] Learning Archive 只改 `interest-journey/learning-archive.md`
- [ ] Knowledge Planet 数据只改 `data/knowledge-planet.json`（用脚本增删），勿手改 `docs/public/data/`
- [ ] `transformPageData` 在 `config.ts`
- [ ] 公式用 `$`/`$$`，矩阵行分隔 `\\`
- [ ] 图片放在分部 `assets/`
- [ ] 中文文案符合 [`WRITING_CONVENTIONS.md`](WRITING_CONVENTIONS.md)

## 关键文件

| 任务 | 文件 |
| --- | --- |
| 模块注册 | `docs/.vitepress/learning-modules.json` |
| Demo 注册 | `docs/.vitepress/demos.json` |
| Gallery 数据 | `docs/.vitepress/gallery-sections.ts` |
| Gallery 组件 | `theme/components/GalleryNavGroup.vue`、`SectionGallery.vue` |
| Gallery 截图 | `docs/public/gallery/` |
| Interest Journey 页面 | `docs/interest-journey/*.md` |
| Collections 页面 | `docs/collections/*.md` |
| Knowledge Planet 数据 | `data/knowledge-planet.json` |
| Knowledge Planet 组件 | `docs/.vitepress/theme/components/knowledge-planet/` |
| Sudoku 存储 | `theme/components/demos/sudoku/composables/sudoku-storage.ts` |
| UI 超参数 | `docs/.vitepress/theme/tokens.css` |
| 站点配置 | `docs/.vitepress/config.ts` |
| 页面数据管线入口 | `docs/.vitepress/transformPageData.ts` |
| 模块页面数据 | `docs/.vitepress/transformLearningModule.ts` |
| 分区总览页数据 | `docs/.vitepress/transformGalleryPages.ts` |
| 右栏科学家映射 | `docs/.vitepress/doc-aside-scientists.json` |
| 内容同步 | `scripts/build-learning-modules.mjs` |
| 数独题库 | `scripts/prepare-sudoku-puzzles.mjs` |
