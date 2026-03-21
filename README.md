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

Drop your sprites into `public/assets` using the exact file names:

- `snail-sprite.jpeg`
- `jar-sprite.jpeg`
- `water-effects.jpeg`
- `fog-effects.jpeg`

If assets are missing, the game uses fallback visuals so development can continue.

## Controls

- **Add to Jar**: add snails, moss, ferns, flowers, and microbes
- **Environment sliders**: humidity, lighting, soil quality, water cycle
- **Run/Pause/Reset**: control simulation time

## Tech Stack

- React
- Vite
- CSS
