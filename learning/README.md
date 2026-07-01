# Learning 模块

各课程的内容源目录，构建时同步到 `docs/{id}/`。

```
learning/
├── hello-agent/     → docs/hello-agent/
└── cs336/           → docs/cs336/
```

- 注册：`docs/.vitepress/learning-modules.json`（`sourceDir` 指向本目录下子文件夹）
- 同步：`npm run build:learning-modules`（`predev` / `prebuild` 自动执行）
- **只编辑本目录**，勿手改 `docs/hello-agent/`、`docs/cs336/`
