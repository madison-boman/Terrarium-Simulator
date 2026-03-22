# Sprite Assets

Runtime asset paths used by the React app. The app loads these via CSS
`background-image` and automatically switches from fallback graphics to
sprites when available.

## Creatures (`creatures/`)

Each sheet is **384×512 px** — a 3×4 grid of 128×128 cells.

| Row | Purpose  | Frames |
|-----|----------|--------|
| 0   | Walking  | 3      |
| 1   | Turning  | 3      |
| 2   | Idle     | 3      |
| 3   | Dead     | 1 (column 0 only) |

- `snail sprite.png`
- `pillbug.png`
- `ant.png`

Inventory button icons use row 0, column 0 of each sheet.

## Plants (`plants/`)

Each sheet is **384×384 px** — a 3×3 grid of 128×128 cells.
Columns map to health (0 = healthy, 1 = stressed, 2 = dead).
Rows are animation variation frames.

- `moss.png`
- `fern.png`
- `flowering.png`
- `tall plant.png`

Inventory button icons use row 0, column 0 of each sheet.

## Jar (`jar/`)

- `jar.png` — 384×1024, two vertically stacked frames (open top, sealed bottom)
- `jar-border.png` — interior wall/floor outline, rendered at z-index 10 over jar contents
- `soil.png` — soil substrate overlay, rendered at z-index 2

## Effects (`jar effects/`)

- `fog.png` — 6-frame horizontal strip for humidity haze animation
- `water levels.png` — 3-level vertical strip for water overlay
