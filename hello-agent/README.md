# Hello Agent 内容仓库

```
hello-agent/
├── 00-preface/              # 前言（占位）
├── 01-math-foundations/     # 数学基础
│   ├── 01-neural-networks.md
│   ├── 02-rnn.md
│   └── 03-lstm.md
└── 02-attention/            # 注意力机制
    └── 01-seq2seq-tutorial.md
```

## 添加文章

- **数学基础 / 前言**：在对应分部新建 `NN-标题.md`
- **注意力机制**：新建 `02-xxx.md` 或编辑 `01-seq2seq-tutorial.md`
- **勿改** `docs/hello-agent/`（构建时从本目录同步）

## 重新生成 Seq2Seq 教程（从 HTML）

```bash
npm run convert:seq2seq
```

仅覆盖 `02-attention/01-seq2seq-tutorial.md`，**不会删除**数学基础三篇。

## 本地预览

```bash
npm run dev
```
