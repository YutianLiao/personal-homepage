# Doc aside scientist sketches

Pencil portraits for doc pages with an **On this page** outline. **One scientist per nav section** — all pages under the same route prefix share one portrait.

Architecture and checklist: repository root `DESIGN.md` (section「Doc 右栏科学家素描」). Registry: [`doc-aside-scientists.json`](../../../.vitepress/doc-aside-scientists.json).

## Active sections

Longest-prefix match (`/interest-journey/learning-archive` before `/interest-journey`).

| Prefix | Scientist |
|--------|-----------|
| `/interest-journey/learning-archive` | G.H. Hardy |
| `/interest-journey` | Carl Sagan |
| `/learning` | Donald Knuth |
| `/hello-agent` | Alan Turing |
| `/my-notes` | Claude Shannon |
| `/demos` | Ada Lovelace |
| `/collections` | Srinivasa Ramanujan |
| `/blog` | Srinivasa Ramanujan |
| `/miscellaneous` | Richard Feynman |
| `/cv` | Carl Friedrich Gauss |

## Library (15 WebP, unused kept)

Display width ~9rem; assets are 360×540 WebP (~20KB each). Do not commit multi‑MB source PNGs.

| File | Scientist | Status |
|------|-----------|--------|
| `feynman.webp` | Richard Feynman | in use |
| `gauss.webp` | Carl Friedrich Gauss | in use |
| `hardy.webp` | G.H. Hardy | in use |
| `ramanujan.webp` | Srinivasa Ramanujan | in use |
| `turing.webp` | Alan Turing | in use |
| `shannon.webp` | Claude Shannon | in use |
| `lovelace.webp` | Ada Lovelace | in use |
| `knuth.webp` | Donald Knuth | in use |
| `nash.webp` | John Nash | reserved |
| `hilbert.webp` | David Hilbert | reserved |
| `sagan.webp` | Carl Sagan | in use |
| `rosenblatt.webp` | Frank Rosenblatt | reserved |
| `schmidhuber.webp` | Jürgen Schmidhuber | reserved |
| `hochreiter.webp` | Sepp Hochreiter | reserved |
| `bahdanau.webp` | Dmitry Bahdanau | reserved |

## Asset style

Portrait **3:4**, white background, gray pencil lines. Blend via `.site-sketch-decor--aside` in `custom.css`.

## New section

1. Add `{ "prefix": "/…", "scientist": "id" }` to `sections` in `doc-aside-scientists.json`.
2. Reuse a reserved scientist or add `scientists` entry + `{id}.webp` here.
