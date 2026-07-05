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
├── DESIGN.md                 # 站点视觉规范
├── scripts/
│   ├── build-learning-modules.mjs
│   └── convert-seq2seq.mjs
└── docs/
    ├── .vitepress/
    │   ├── config.ts
    │   ├── learning-modules.json   # 模块注册表
    │   ├── demos.json              # Demo 注册表
    │   ├── knowledge-map.json      # Knowledge Map 数据（手改）
    │   ├── learning-sidebars.json  # 自动生成
    │   ├── learning-manifests.json # 自动生成（Prev/Next）
    │   ├── transformLearningModule.ts
    │   └── theme/
    │       ├── tokens.css          # UI 超参数（字体、标题大小等）
    │       ├── custom.css
    │       ├── components/KnowledgeMap.vue
    │       └── LearningModuleDoc.vue
    ├── interest-journey/       # Interest Journey 子页（手改 Markdown）
    │   ├── learning-archive.md
    │   └── knowledge-map.md
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

新增 Demo：`demos.json` 注册 → `docs/demos/{id}/index.md` → `theme/index.ts` 注册组件。

## Interest Journey

Nav 下拉两项，路由前缀 `/interest-journey/`。两页均 `sidebar: false`，切换靠顶栏 nav，无左侧栏。

| 路由 | 文件 | 内容 |
| --- | --- | --- |
| `/interest-journey/learning-archive` | `docs/interest-journey/learning-archive.md` | 课程/书籍/链接索引；`pageClass: interest-journey-page` |
| `/interest-journey/knowledge-map` | `docs/interest-journey/knowledge-map.md` | 全屏 3D 星云图谱；`layout: page`、`pageClass: knowledge-map-page` |

**Learning Archive**：纯 Markdown，直接编辑 `learning-archive.md`。装饰图仅本页（`Layout.vue`）。

**Knowledge Map**：数据 `docs/.vitepress/knowledge-map.json`（`domains` → `topics` → `entries`）。依赖 `three` + `3d-force-graph`，客户端动态加载。

```
theme/components/KnowledgeMap.vue
theme/components/knowledge-map/
├── useNebulaGraph.ts       # WebGL 场景
├── nebulaGraphData.ts      # JSON → graphData
├── NebulaHud.vue           # 顶栏浮层
├── NebulaNodeDetail.vue    # 节点详情浮卡
└── AddEntryForm.vue        # 弹窗表单 → JSON 导出
```

追加知识点：HUD 打开表单 → 生成 JSON → 粘贴进 `knowledge-map.json` → commit & push。

与 **Learning** 区别：Learning 是长文笔记 + 构建同步；Interest Journey 的 Archive 是资源列表，Map 是全屏 3D 图谱。

## UI tokens

`docs/.vitepress/theme/tokens.css`：颜色、字体、`--site-h1-size` 等。全站与学习模块共用，勿在模块内单独覆盖排版。

## 导航

`config.ts` → `themeConfig.nav`。Learning / Demo / Interest Journey 下拉项来自各自注册或硬编码子链。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 开发 |
| `npm run build:learning-modules` | 同步学习模块 |
| `npm run convert:seq2seq` | HTML → `learning/hello-agent/02-attention/01-seq2seq-tutorial.md` |

## Agent 检查

- [ ] 学习模块内容只改 `learning/{module}/`，未手改 `docs/{module}/`
- [ ] 新模块已写入 `learning-modules.json` 并执行构建
- [ ] 新 Demo 已写入 `demos.json` 并注册组件
- [ ] Knowledge Map 数据只改 `knowledge-map.json`（或页内表单导出后粘贴）
- [ ] Learning Archive 只改 `interest-journey/learning-archive.md`
- [ ] `transformPageData` 在 `config.ts`
- [ ] 公式用 `$`/`$$`，矩阵行分隔 `\\`
- [ ] 图片放在分部 `assets/`

## 关键文件

| 任务 | 文件 |
| --- | --- |
| 模块注册 | `docs/.vitepress/learning-modules.json` |
| Demo 注册 | `docs/.vitepress/demos.json` |
| Knowledge Map 数据 | `docs/.vitepress/knowledge-map.json` |
| Interest Journey 页面 | `docs/interest-journey/*.md` |
| UI 超参数 | `docs/.vitepress/theme/tokens.css` |
| 站点配置 | `docs/.vitepress/config.ts` |
| 模块页面数据 | `docs/.vitepress/transformLearningModule.ts` |
| 内容同步 | `scripts/build-learning-modules.mjs` |
