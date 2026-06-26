# Notes

Standalone tutorial / note folders live here. Each subfolder is one self-contained reading (HTML + `assets/`, optional PDF, etc.).

## Add a new tutorial

1. Create a folder, e.g. `notes/my-new-topic/`
2. Put your main HTML inside (e.g. `my-new-topic.html`) and any `assets/` it references
3. Register it in **`docs/hello-agent/index.md`** frontmatter:

```yaml
tutorials:
  - slug: my-new-topic              # URL: /hello-agent/my-new-topic
    folder: my-new-topic            # folder name under notes/
    html: my-new-topic.html         # entry HTML filename
    title: My New Topic             # page title
    description: One-line summary   # shown in the overview table
    # sidebarTitle: Shorter label   # optional; defaults to title
```

4. Run sync (also runs automatically before `npm run dev` / `npm run build`):

```bash
npm run sync:notes
```

That copies files into `docs/public/hello-agent/<slug>/`, generates the VitePress page, sidebar, and overview table.

## Current folders

| Folder | Registered slug |
| --- | --- |
| `seq2seq-tutorial/` | `seq2seq-attention-tutorial` |
