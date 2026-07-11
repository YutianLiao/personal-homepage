# Hero sketch decor

Home hero meadow backdrop (`HomeHeroSketchEnv.vue`).

| File | Role |
|------|------|
| `env.png` | Portrait meadow / rainbow pencil sketch — right-side decor, blends into page background |
| `flora.png` | Horizontal flora strip under the math title line |

## Layout (`HomeHeroSketchEnv.vue`)

- Rendered in `Layout.vue` → `#home-hero-info`, inside `.VPHero .main`
- `position: absolute; right: 0` — does not affect left hero copy width
- Height: measured at runtime from `.main` top to `.home-features-custom` top (Biography divider)
- `ResizeObserver` + window resize keep alignment after layout changes

## Visual blend

Shared classes in `custom.css`: **`.site-sketch-decor`** / **`.site-sketch-decor__img`** (also used by doc aside scientist portraits via `.site-sketch-decor--aside`).

- `mix-blend-mode: multiply` — white paper merges with `--site-bg`
- Radial `mask-image` — soft edges, no hard crop box
- `::after` gradient overlays using `--site-bg` on left / top / bottom for seamless fade into the page

## Replacing assets

- `env.png`: portrait (~2:3), light background, dense grass along bottom edge
- `flora.png`: wide horizontal strip, transparent or dark-on-light sketch
