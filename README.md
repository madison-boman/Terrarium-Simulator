# Terrarium Simulator

A browser-based digital terrarium game where players tune organisms, plants, and
environmental conditions, then run accelerated ecosystem simulation to maximize
survival and score.

## Features

- Adjustable ecosystem setup:
  - Organisms: insects, snails, microbes
  - Plants: moss, ferns, flowering plants
  - Environment: lighting, humidity, soil composition, water cycle
- Fast-forward simulation loop with nonlinear ecosystem interactions
- Live dashboard:
  - Day counter
  - Health, balance, and score
  - Plant biomass, organism pressure, mold overgrowth meters
- Timeline feed showing random ecological events and stability warnings
- Win/lose outcomes based on collapse conditions or full-year survival

## How to Run

This project is dependency-free and runs directly in the browser.

1. Open `index.html` in a browser.
2. Adjust sliders in the builder panel.
3. Click **Run Simulation**.
4. Use **Pause** or **Reset** as needed.

## Simulation Logic (High Level)

- Plants grow based on fit between current and ideal light/humidity/soil/water.
- Organisms consume plant resources and are affected by crowding and mold.
- Microbes improve nutrient recycling but can contribute to pressure if overgrown.
- Mold increases with persistent high moisture and detritus.
- Balance and health are recomputed each day and used to drive score and collapse.

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
