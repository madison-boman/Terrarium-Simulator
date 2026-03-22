# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Terrarium Simulator — a client-side React 19 + Vite 7 SPA. No backend, no database, no external services required. All game logic runs in the browser.

### Development commands

See `README.md` for full details. Key commands:

- `npm run dev` — starts Vite dev server (default port 5173)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build

### Notes

- No linter or test framework is configured in this project. There are no `lint` or `test` npm scripts.
- The dev server supports HMR; code changes in `src/` are reflected immediately in the browser.
- Use `--host 0.0.0.0` with `npm run dev` to expose the dev server on all interfaces (useful in cloud VMs).
- All sprite assets are in `public/assets/` and loaded at runtime — they do not need a build step.
