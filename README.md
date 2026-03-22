# Terrarium Simulator (React)

A game-style browser terrarium focused on one large jar scene, with side controls
for adding ecosystem elements and tuning conditions.

## Setup

```bash
npm install
npm run dev
```

Then open the local Vite URL in your browser.

## Gameplay

Build a terrarium by adding creatures, plants, and environmental elements to a jar.
Press **Play** to start the simulation and watch the ecosystem evolve. The goal is to
balance moisture, biodiversity, and creature-to-plant ratios for maximum longevity.

### Creatures

- **Snail** — moves horizontally, affected by moisture and mold stress
- **Pill Bug** — ground-level crawler, resilient in moist conditions
- **Ant** — fast-moving, less affected by dry conditions than other creatures

All creatures have a **vitality** stat that drains over time. Soil slows the drain
but cannot prevent it — creatures will eventually die. Harsh conditions (bone-dry
or waterlogged) accelerate death. Dead creatures display a grayscale sprite with
reduced opacity.

### Plants

- **Moss**, **Fern**, **Flower**, **Tall Plant**

Plant health responds to ecosystem stability:
- **Healthy** (stability ≥ 72) — vibrant first-column sprite
- **Stressed** (stability ≥ 55) — mid-column sprite
- **Dead** (stability < 55) — wilted last-column sprite

### Ecosystem Collapse

The simulation ends when either:
1. The **longevity timer** runs out (based on ecosystem balance calculations)
2. All creatures die **and** all plants reach dead health

On collapse, all organisms transition to their dead sprites and a results popup
shows days survived and final score after a brief delay.

## Controls

- **Add/Remove**: creatures (snail, pill bug, ant) and plants (moss, fern, flower, tall plant)
- **Moisture**: add or remove water levels (0 = dry, 2 = optimal, 3 = waterlogged)
- **Soil**: toggle soil substrate layer
- **Play/Pause/Reset**: control simulation time

## Sprite Assets

All sprites live under `public/assets/` and are loaded at runtime.

### Creatures (`public/assets/creatures/`)

Each creature sprite sheet is **384×512 px** (3 columns × 4 rows, 128×128 per cell):

| Row | Animation |
|-----|-----------|
| 0   | Walking   |
| 1   | Turning   |
| 2   | Idle      |
| 3   | Dead (column 0 only) |

- `snail sprite.png`
- `pillbug.png`
- `ant.png`

### Plants (`public/assets/plants/`)

Each plant sprite sheet is **384×384 px** (3 columns × 3 rows, 128×128 per cell).
Columns represent health states (healthy → stressed → dead). Rows are animation frames.

- `moss.png`
- `fern.png`
- `flowering.png`
- `tall plant.png`

### Jar (`public/assets/jar/`)

- `jar.png` — 2-frame sprite sheet (open jar top half, sealed/corked jar bottom half)
- `jar-border.png` — interior border outline overlay (z-index 10)
- `soil.png` — soil substrate overlay

### Effects (`public/assets/jar effects/`)

- `fog.png` — humidity haze (6-frame horizontal strip)
- `water levels.png` — water level overlay (3-level vertical strip)

## Tech Stack

- React 19
- Vite 7
- CSS (no preprocessor)
