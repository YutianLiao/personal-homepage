# personal-homepage

Yutian Liao 的个人主页 — VitePress + Vue 交互 Demo。

## 快速开始

```bash
npm install
npm run dev
# → http://localhost:5173
```

`predev` 会自动同步学习模块、Knowledge Planet 数据与数独题库。

## 文档索引

| 文档 | 内容 |
| --- | --- |
| [`PAGE_CHECKLIST.md`](PAGE_CHECKLIST.md) | 全站页面校对 TODO |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | 目录结构、模块注册、构建管线、常用命令 |
| [`DESIGN.md`](DESIGN.md) | 视觉规范、tokens、布局与缩放 |
| [`WRITING_CONVENTIONS.md`](WRITING_CONVENTIONS.md) | 中文标点、链接、术语写法 |
| [`demos/`](demos/) | 交互 Demo 内容源（Tokenizer、Sudoku） |
| [`learning/`](learning/) | 学习模块 Markdown 源 |
| [`knowledge-planet/README.md`](knowledge-planet/README.md) | 3D 知识星球维护说明 |

## 主要页面

- **Demo**：`/demos/tokenizer/`、`/demos/sudoku/`
- **Learning**：`/hello-agent/`、`/cs336/`
- **Interest Journey**：Learning Archive、Knowledge Planet
- **Collections**：经 Miscellaneous 页内链访问

## 部署

GitHub Actions 使用 `npm run build`。本地模拟 Pages 路径：

```bash
npm run preview:pages
```
