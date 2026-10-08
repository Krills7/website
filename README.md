# David Brimhall — DB-OS

A from-scratch portfolio for David Brimhall, built as a CRT terminal ("DB-OS").

Every visual on the site is generated at runtime on the Canvas API — no animation
libraries, no 3D libraries, no assets beyond fonts.

## What's inside

| Piece | Where | What it does |
| --- | --- | --- |
| Recycled particle cloud | `src/engine/dashField.js`, `src/components/ParticleLayer.jsx` | One pool of ~1,250 glowing dashes lives on a fixed canvas behind the whole site. Sections register "particle zones" and the same pool flows between them as you scroll or change pages. |
| Target builders | `src/engine/targets.js` | Text rasterization (scanline dashes with CSS-like word wrap), networks, waves, grids, wire globes, radial pulses. |
| Wireframe 3D engine | `src/engine/wire3d.js` | CPU-built 3D line geometry, pinhole camera, batched glow/core rendering, marching dashes, projected labels. Drives the workflow diagram. |
| Workflow visual | `src/components/WorkflowVisual.jsx` | The pinned, scroll-scrubbed diagram at the bottom of `/profile`: three scenes (explore → build → operate) that light up and morph with scroll progress. |
| CRT overlay | `src/components/CRTOverlay.jsx` | Scanlines, aperture grille, vignette, raster sweep, noise, flicker. Toggle with the header button or `Shift+C`. |
| Boot sequence | `src/components/BootScreen.jsx` | Terminal POST screen, once per session, skippable with any key. |
| Fiber map | `public/phoenix_fiber_map_v4_standalone.html`, `src/components/FiberMapFrame.jsx` | The self-contained Leaflet tool, embedded in an isolated iframe and restyled with a terminal window frame. |

Reduce motion is respected everywhere (`prefers-reduced-motion`): the boot screen
is skipped, the particle field renders statically, and the workflow diagram only
redraws on scroll.

## Pages

- `/` — hero, `whoami`, selected work, stack, recent log
- `/profile` — profile, four disciplines, full `git log` history, workflow visual
- `/work` — project index
- `/fiber-map` — Phoenix Fiber Build Map (Leaflet, 3,500+ permits)
- `/visual` — particle lab: morph the cloud, push it with the cursor, click to fire a ring

## Development

```bash
npm install
npm run dev      # http://localhost:5173/website/
npm run build    # production build to dist/
npm run preview  # serve the production build
npm run lint
```

The site is served from the `/website/` base path (see `vite.config.js` and the
`basename` in `src/App.jsx`), matching GitHub Pages project hosting.

## Deployment

`.github/workflows/deploy.yml` builds `main`, copies `index.html` to `404.html`
for SPA deep links, and publishes `dist/` to GitHub Pages.

## Content

All copy, roles, timeline entries, projects, and workflow phases live in
`src/data/profile.js`. The resume file served by the download buttons is
`public/DavidBrimhallRESUME2026.docx`.
