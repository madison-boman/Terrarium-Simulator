# Sprite assets

Current runtime asset paths:

- `creatures/snail.png` (4x4 sprite sheet rows: moving, turning, idle, dead)
- `jar/jar.png` (2-frame sprite sheet: sealed jar, open jar)
- `jar effects/water.png` (water/humidity effect sheet)
- `jar effects/fog.png` (humidity haze effect sheet)
- `plants/moss.png`
- `plants/fern.png`
- `plants/flowering.png`

The React app loads these at runtime and will automatically switch from fallback
graphics to your provided sprites.
