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

## Library (15 PNGs, unused kept)

| File | Scientist | Status |
|------|-----------|--------|
| `feynman.png` | Richard Feynman | in use |
| `gauss.png` | Carl Friedrich Gauss | in use |
| `hardy.png` | G.H. Hardy | in use |
| `ramanujan.png` | Srinivasa Ramanujan | in use |
| `turing.png` | Alan Turing | in use |
| `shannon.png` | Claude Shannon | in use |
| `lovelace.png` | Ada Lovelace | in use |
| `knuth.png` | Donald Knuth | in use |
| `nash.png` | John Nash | reserved |
| `hilbert.png` | David Hilbert | reserved |
| `sagan.png` | Carl Sagan | in use |
| `rosenblatt.png` | Frank Rosenblatt | reserved |
| `schmidhuber.png` | Jürgen Schmidhuber | reserved |
| `hochreiter.png` | Sepp Hochreiter | reserved |
| `bahdanau.png` | Dmitry Bahdanau | reserved |

## Asset style

Portrait **3:4**, white background, gray pencil lines. Blend via `.site-sketch-decor--aside` in `custom.css`.

## New section

1. Add `{ "prefix": "/…", "scientist": "id" }` to `sections` in `doc-aside-scientists.json`.
2. Reuse a reserved scientist or add `scientists` entry + `{id}.png` here.
