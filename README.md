# Terrarium Simulator (React)

A game-style browser terrarium focused on one large jar scene, with side controls
for adding ecosystem elements and tuning conditions.

## What changed

- Migrated the app to **React + Vite**
- Shifted from chart-heavy dashboard to a **video game style scene**
- Added a large animated jar view with:
  - sprite-based snails
  - plants and microbes placed inside the jar
  - humidity fog and optional water effects overlay
- Added side-panel gameplay controls:
  - add snails/plants/microbes
  - tune humidity, lighting, soil quality, and water cycle
  - run/pause/reset simulation

## Setup

```bash
npm install
npm run dev
```

Then open the local Vite URL in your browser.

## Sprite assets

The current game scene uses these transparent PNG sheets:

- `public/assets/creatures/snail.png`
- `public/assets/jar/jar.png`
- `public/assets/jar effects/water.png`
- `public/assets/jar effects/fog.png`
- `public/assets/plants/moss.png`
- `public/assets/plants/fern.png`
- `public/assets/plants/flowering.png`

## Controls

- **Add to Jar**: add snails, moss, ferns, flowers, and microbes
- **Environment sliders**: humidity, lighting, soil quality, water cycle
- **Run/Pause/Reset**: control simulation time

## Tech Stack

- React
- Vite
- CSS
