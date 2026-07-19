# My Notes

`index.md` is the notes overview. Each `NN-topic.md` file is one self-contained course or study note.

```
learning/my-notes/
├── index.md
├── 01-cs336.md
└── NN-topic.md
```

When adding a note:

1. Create `NN-topic.md` with a `title` in its frontmatter.
2. Add its link and description to `index.md`.
3. Run `npm run build:learning-modules`.

The build script copies this directory to `docs/my-notes/` and generates the sidebar and pager entries.
