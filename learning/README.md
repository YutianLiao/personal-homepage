# Learning 模块

各课程的内容源目录，构建时同步到 `docs/{id}/`。

```
learning/
├── hello-agent/     → docs/hello-agent/
└── my-notes/        → docs/my-notes/
```

- 注册：`docs/.vitepress/learning-modules.json`（`sourceDir` 指向本目录下子文件夹）
- 同步：`npm run build:learning-modules`（`predev` / `prebuild` 自动执行）
- `hello-agent/` 使用分部目录；`my-notes/` 使用根目录下的 `NN-topic.md` 单文件笔记
- **只编辑本目录**，勿手改 `docs/hello-agent/`、`docs/my-notes/`
