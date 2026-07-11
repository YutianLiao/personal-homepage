# Doc aside scientist sketches

Pencil portraits for doc pages with an **On this page** outline. **One scientist per nav section** — all pages under the same route prefix share one portrait.

Architecture and checklist: repository root `DESIGN.md` (section「Doc 右栏科学家素描」). Registry: [`doc-aside-scientists.json`](../../../.vitepress/doc-aside-scientists.json).

## Active sections

| Prefix | Scientist |
|--------|-----------|
| `/miscellaneous` | Richard Feynman |
| `/cv` | Carl Friedrich Gauss |
| `/interest-journey/learning-archive` | G.H. Hardy |
| `/blog` | Srinivasa Ramanujan |
| `/collections` | Srinivasa Ramanujan |
| `/hello-agent` | Alan Turing |
| `/cs336` | Claude Shannon |

## Library (15 PNGs, unused kept)

| File | Scientist | Status |
|------|-----------|--------|
| `feynman.png` | Richard Feynman | in use |
| `gauss.png` | Carl Friedrich Gauss | in use |
| `hardy.png` | G.H. Hardy | in use |
| `ramanujan.png` | Srinivasa Ramanujan | in use |
| `turing.png` | Alan Turing | in use |
| `shannon.png` | Claude Shannon | in use |
| `lovelace.png` | Ada Lovelace | reserved |
| `knuth.png` | Donald Knuth | reserved |
| `nash.png` | John Nash | reserved |
| `hilbert.png` | David Hilbert | reserved |
| `sagan.png` | Carl Sagan | reserved |
| `rosenblatt.png` | Frank Rosenblatt | reserved |
| `schmidhuber.png` | Jürgen Schmidhuber | reserved |
| `hochreiter.png` | Sepp Hochreiter | reserved |
| `bahdanau.png` | Dmitry Bahdanau | reserved |

## Asset style

Portrait **3:4**, white background, gray pencil lines. Blend via `.site-sketch-decor--aside` in `custom.css`.

## New section

1. Add `{ "prefix": "/…", "scientist": "id" }` to `sections` in `doc-aside-scientists.json`.
2. Reuse a reserved scientist or add `scientists` entry + `{id}.png` here.
