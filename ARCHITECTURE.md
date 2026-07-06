# personal-homepage

VitePress 个人主页。本地：`npm run dev` → `http://localhost:5173`。

## 目录

```
personal-homepage/
├── ARCHITECTURE.md
├── learning/                 # 学习模块内容源
│   ├── hello-agent/
│   └── cs336/
├── demos/                    # Demo 内容源
├── data/
│   └── knowledge-planet.json    # Knowledge Planet 数据源（脚本读写）
├── knowledge-planet/            # Knowledge Planet 说明文档
├── DESIGN.md                 # 站点视觉规范
├── scripts/
│   ├── build-learning-modules.mjs
│   ├── knowledge-planet.mjs     # 知识点增删 / 球面坐标维护
│   ├── lib/knowledge-planet-utils.mjs
│   └── convert-seq2seq.mjs
└── docs/
    ├── .vitepress/
    │   ├── config.ts
    │   ├── learning-modules.json   # 模块注册表
    │   ├── demos.json              # Demo 注册表
    │   ├── learning-sidebars.json  # 自动生成
    │   ├── learning-manifests.json # 自动生成（Prev/Next）
    │   ├── transformLearningModule.ts
    │   └── theme/
    │       ├── tokens.css          # UI 超参数（字体、标题大小等）
    │       ├── custom.css
    │       └── LearningModuleDoc.vue
    ├── interest-journey/       # Interest Journey 子页（手改 Markdown）
    │   ├── learning-archive.md
    │   └── knowledge-planet.md
    ├── hello-agent/          # 构建同步，勿手改
    └── cs336/                # 构建同步，勿手改
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

构建：`npm run build:learning-modules`（`predev`/`prebuild` 自动执行）

- 同步 `{sourceDir}/` → `docs/{id}/`
- 生成侧栏与分页清单

文章页功能（`transformLearningModule.ts`）：阅读时间、Prev/Next、`layout: learning-module-doc`。

## Demo 模块

注册：`docs/.vitepress/demos.json`

```
demos/                          # 内容源（类比 learning/hello-agent/）
└── tokenizer/README.md

docs/demos/
├── index.md                    # 总览
└── tokenizer/index.md          # 单 demo 页面（无独立 overview）

docs/.vitepress/theme/components/demos/
├── TokenizerDemo.vue
└── tokenizer/
```

设计规范：`DESIGN.md`。组件约定：`theme/components/demos/README.md`。

与 Learning 差异：Demo 为交互式 Vue 组件，无 build 同步脚本。nav/sidebar 由 `demos.json` 驱动。

**按需加载**：`theme/index.ts` 以 `defineAsyncComponent` 注册 Demo 组件；算法模块与重资源（BPE `js-tiktoken/lite` + 单 rank、WordPiece `bert-vocab.txt`）仅在用户进入 Demo 页并选用对应算法时加载。默认算法为轻量 `whitespace`，避免首屏拉取词表。

新增 Demo：`demos.json` 注册 → `docs/demos/{id}/index.md` → `theme/index.ts` 异步注册组件。

## Interest Journey

Nav 下拉两项，路由前缀 `/interest-journey/`。两页均 `sidebar: false`，切换靠顶栏 nav，无左侧栏。

| 路由 | 文件 | 内容 |
| --- | --- | --- |
| `/interest-journey/learning-archive` | `docs/interest-journey/learning-archive.md` | 课程/书籍/链接索引；`pageClass: interest-journey-page` |
| `/interest-journey/knowledge-planet` | `docs/interest-journey/knowledge-planet.md` | 3D 知识星球；`pageClass: knowledge-planet-page` |

**Learning Archive**：纯 Markdown，直接编辑 `learning-archive.md`。装饰图仅本页（`Layout.vue`）。

**Knowledge Planet**：三级结构（一级主题 → 二级主题 → 知识点）。数据 `data/knowledge-planet.json`，构建前同步至 `docs/public/data/knowledge-planet.json`。Vue + Three.js（异步加载）见 `theme/components/knowledge-planet/`。维护：`npm run kp:add` / `kp:remove` / `kp:redistribute`。文档：[`knowledge-planet/README.md`](knowledge-planet/README.md)（含页面功能、性能说明、Schema）。

与 **Learning** 区别：Learning 是长文笔记 + 构建同步；Interest Journey 的 Archive 是资源列表。

## UI tokens

`docs/.vitepress/theme/tokens.css`：颜色、字体、`--site-h1-size` 等。全站与学习模块共用，勿在模块内单独覆盖排版。

## 导航

`config.ts` → `themeConfig.nav`。Learning / Demo / Interest Journey 下拉项来自各自注册或硬编码子链。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 开发 |
| `npm run build:learning-modules` | 同步学习模块 |
| `npm run sync:knowledge-planet` | 同步知识星球 JSON 至 public |
| `npm run kp:add` / `kp:remove` / `kp:redistribute` | 维护知识点 |
| `npm run convert:seq2seq` | HTML → `learning/hello-agent/02-attention/01-seq2seq-tutorial.md` |

## Agent 检查

- [ ] 学习模块内容只改 `learning/{module}/`，未手改 `docs/{module}/`
- [ ] 新模块已写入 `learning-modules.json` 并执行构建
- [ ] 新 Demo 已写入 `demos.json` 并注册组件
- [ ] Learning Archive 只改 `interest-journey/learning-archive.md`
- [ ] Knowledge Planet 数据只改 `data/knowledge-planet.json`（用脚本增删），勿手改 `docs/public/data/`
- [ ] `transformPageData` 在 `config.ts`
- [ ] 公式用 `$`/`$$`，矩阵行分隔 `\\`
- [ ] 图片放在分部 `assets/`

## 关键文件

| 任务 | 文件 |
| --- | --- |
| 模块注册 | `docs/.vitepress/learning-modules.json` |
| Demo 注册 | `docs/.vitepress/demos.json` |
| Interest Journey 页面 | `docs/interest-journey/*.md` |
| Knowledge Planet 数据 | `data/knowledge-planet.json` |
| Knowledge Planet 组件 | `docs/.vitepress/theme/components/knowledge-planet/` |
| UI 超参数 | `docs/.vitepress/theme/tokens.css` |
| 站点配置 | `docs/.vitepress/config.ts` |
| 模块页面数据 | `docs/.vitepress/transformLearningModule.ts` |
| 内容同步 | `scripts/build-learning-modules.mjs` |
