# personal-homepage 项目架构说明

> 供 Agent / 维护者快速理解仓库结构、设计决策与修改流程。  
> 仓库路径：`personal-homepage/`（VitePress 个人主页，部署至 GitHub Pages）。

---

## 1. 项目概览

| 项 | 说明 |
| --- | --- |
| 框架 | [VitePress](https://vitepress.dev/) 1.x |
| 内容 | `docs/` 下 Markdown 页面 + 自定义 Vue 主题 |
| 部署 | GitHub Actions → `gh-pages`；`base` 为 `/personal-homepage/` |
| 本地预览 | `npm run dev` → 默认 `http://localhost:5173` |

**设计取向**：极简学术主页（参考 yufeizhao.com 风格），Home 含数学装饰与交互 Biography；Hello Agent 为独立长文笔记系列。

---

## 2. 目录结构

```
personal-homepage/
├── ARCHITECTURE.md          # 本文件
├── package.json
├── scripts/
│   ├── build-hello-agent.mjs   # hello-agent 同步 + 侧栏/分页清单
│   └── convert-seq2seq.mjs     # 外部 HTML → 02-attention 单篇 MD
├── hello-agent/             # ★ Hello Agent 内容源（只改这里）
│   ├── index.md
│   ├── README.md
│   ├── 00-preface/          # 分部占位（part.json + assets/）
│   ├── 01-math-foundations/
│   └── 02-attention/
│       ├── part.json
│       ├── assets/
│       └── 01-seq2seq-tutorial.md
└── docs/                    # VitePress 根目录
    ├── index.md             # Home
    ├── interest-journey.md
    ├── miscellaneous.md
    ├── cv.md
    ├── blog/
    ├── collections/
    ├── hello-agent/         # 由 build:hello-agent 从 hello-agent/ 同步（勿手改）
    ├── public/decorative/   # 静态图（数独、Ramsey、公式水印等）
    └── .vitepress/
        ├── config.ts
        ├── transformHelloAgent.ts
        ├── hello-agent-sidebar.json    # 自动生成
        ├── hello-agent-manifest.json   # 自动生成（Prev/Next）
        └── theme/
            ├── index.ts
            ├── Layout.vue
            ├── HelloAgentDoc.vue
            ├── custom.css
            ├── components/
            └── utils/readingTime.ts
```

---

## 3. Hello Agent 内容架构

### 3.1 分部约定

- 文件夹名：`NN-slug/`（两位数字 = 侧栏顺序）
- 每分部含 `part.json`：`{ "title": "显示名称" }`
- 文章：`NN-标题.md`（同分部内数字 = 顺序）
- 图片：放在该分部 `assets/`，文中引用 `./assets/xxx.png`

### 3.2 当前内容布局

| 分部 | 目录 | 文章 |
| --- | --- | --- |
| 前言 | `00-preface/` | 无（占位） |
| 第一部分：数学基础 | `01-math-foundations/` | `01-neural-networks.md`、`02-rnn.md`、`03-lstm.md` |
| 第二部分：注意力机制 | `02-attention/` | `01-seq2seq-tutorial.md`（Sutskever 2014 精读，不含 RNN/LSTM 普及） |

**阅读时间**：`transformHelloAgent.ts` 从磁盘读取 Markdown 正文（去掉 frontmatter）估算，约 420 字/分钟；适用于所有 `hello-agent/**/*.md` 文章页。

`npm run convert:seq2seq` 仅覆盖 `02-attention/01-seq2seq-tutorial.md`，不删除数学基础文章。

### 3.3 构建流水线

```
hello-agent/  ──build:hello-agent──►  docs/hello-agent/
                │                      hello-agent-sidebar.json
                └────────────────────► hello-agent-manifest.json
```

- `predev` / `prebuild` 自动执行 `build:hello-agent`
- **不要**直接编辑 `docs/hello-agent/` 下的 MD（会被覆盖）

### 3.4 页面功能（仅 hello-agent 内文章页）

在 `docs/.vitepress/transformHelloAgent.ts` 中配置：

| 功能 | 实现 |
| --- | --- |
| 自定义版式 | `layout: hello-agent-doc` → `HelloAgentDoc.vue`（基于 `VPDoc`） |
| 建议阅读时间 | `readingTime.ts`，约 420 字/分钟，显示在右侧栏顶部 |
| Prev / Next | `HelloAgentPager.vue` 读 `hello-agent-manifest.json` |
| 数学公式 | `config.ts` → `markdown.math: true`（MathJax） |

---

## 4. 站点主题与页面

### 4.1 导航栏顺序（`config.ts` → `themeConfig.nav`）

Home → Interest Journey → Miscellaneous → CV → Blog → Hello Agent

### 4.2 自定义 Layout（`theme/Layout.vue`）

- **Home**：自定义 Hero（头像、Euler 公式、数独装饰）、`HomeVPHomeFeatures` 替代默认 Features
- **Interest Journey / Miscellaneous**：角标装饰图（`layout-bottom`）

### 4.3 样式（`theme/custom.css`）

- 品牌色、Home Hero、Timeline 分隔线、Hello Agent 阅读时间与分页样式
- MathJax：`mjx-container` 横向滚动

### 4.4 GitHub Pages base

`config.ts` 根据 `GITHUB_REPOSITORY` 设置 `base: '/personal-homepage/'`。本地 `npm run dev` 时 `base` 为 `/`。模拟线上子路径：`npm run preview:pages`。

---

## 5. 常用命令

```bash
npm run dev              # 开发（会先 build:hello-agent）
npm run build            # 生产构建
npm run build:pages      # 带 GitHub Pages base 的构建
npm run preview:pages    # 构建后本地预览子路径
npm run build:hello-agent # 仅同步 hello-agent + 生成侧栏
npm run convert:seq2seq  # 从 ../Notes/seq2seq-tutorial HTML 重生成教程 MD
```

---

## 6. 修改指南（按任务）

### 改 Hello Agent 文章

1. 编辑 `hello-agent/02-attention/01-seq2seq-tutorial.md`（或在新分部新建 `NN-xxx.md`）
2. `npm run dev` 刷新预览

### 在前言 / 数学基础添加第一篇

1. 在 `00-preface/` 或 `01-math-foundations/` 新建 `01-标题.md` + frontmatter
2. 运行 `npm run build:hello-agent`（或 `dev`）

### 新增分部

1. 创建 `03-slug/part.json` + `assets/`
2. 添加编号 MD 文件
3. `build:hello-agent` 自动更新侧栏

### 改导航 / 侧栏 / 页脚

- 全局导航：`docs/.vitepress/config.ts`
- Hello Agent 侧栏：由 `scripts/build-hello-agent.mjs` 生成，改内容结构即可

### 改 Home 装饰 / Biography

- `docs/index.md`（frontmatter + Timeline HTML）
- `theme/components/HomeMathPiece.vue`、`HomeVPHomeFeatures.vue`
- 图片：`docs/public/decorative/`

### 从外部 HTML 迁移笔记

参考 `scripts/convert-seq2seq.mjs`：JSDOM + Turndown，HTML `.math` → LaTeX，`fixBmatrix` / `fixBracketEscapes` 后处理。

---

## 7. LaTeX / 公式注意事项

| 写法 | 结果 |
| --- | --- |
| `$h_t$` | 行内公式 ✓ |
| `$$\sum_i x_i$$` | 块级公式 ✓ |
| `\begin{bmatrix}1 & 0 \\ 0 & 1\end{bmatrix}` | 矩阵 ✓（行分隔为 `\\`） |
| `\[1,0\]` 或 `\[` `\]` | ✗ Turndown 残留，不渲染 |
| `0\ \\ 0`（反斜杠错位） | ✗ 矩阵行分隔损坏；用 `fixBmatrix` 或手写 `0 \\ 0` |

转换脚本会在 `sanitizeMarkdown` 中调用 `fixBmatrix` 修复 `0\ \\` → `0 \\`。

---

## 8. 外部依赖路径

| 用途 | 路径 |
| --- | --- |
| Seq2Seq HTML 源 | `../../Notes/seq2seq-tutorial/seq2seq-attention-tutorial.html` |
| Seq2Seq 图片 | `../../Notes/seq2seq-tutorial/assets/` → 复制到 `hello-agent/02-attention/assets/` |

---

## 9. Agent 修改检查清单

- [ ] Hello Agent 内容是否只改了 `hello-agent/`？
- [ ] 是否运行了 `build:hello-agent` 或 `dev`/`build`？
- [ ] 公式是否用 `$`/`$$`，矩阵行分隔是否为 `\\`？
- [ ] 新图片是否放在对应分部 `assets/`？
- [ ] `transformPageData` 是否在 **`config.ts`**（不在 `theme/index.ts`）？
- [ ] 导航顺序是否与 `config.ts` 一致？

---

## 10. 关键文件速查

| 需求 | 文件 |
| --- | --- |
| 站点配置 | `docs/.vitepress/config.ts` |
| Hello Agent 页面数据 | `docs/.vitepress/transformHelloAgent.ts` |
| 主题入口 | `docs/.vitepress/theme/index.ts` |
| Hello Agent 版式 | `docs/.vitepress/theme/HelloAgentDoc.vue` |
| 阅读时间 | `docs/.vitepress/theme/utils/readingTime.ts` |
| 内容同步 | `scripts/build-hello-agent.mjs` |
| 内容源 | `hello-agent/` |
