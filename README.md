# 3D House Model — Ground + First Floor (ALT-II)

Live: https://theblabberingmonk.github.io/3d-house-model/

Interactive 3D house built with [Three.js](https://threejs.org/) from the hand sketches in `manual-plan/`. Every dimension lives in `js/plan.js`.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

CDN internet required on first load (Three.js 0.160.0 via unpkg). No build step.

## Features (prod)

- Ground floor: open parking (3 cars), driveway + 12ft gate, entry lobby, lift + stair core, columns, storage
- First floor ALT-II: Kitchen, Entry Lobby, Toilet 4'×8'7", Lift 4'×4', Hall 10'6"×12'5" + 7'×8' nook, W.C. 4'×4', 2× Bedrooms 10'×13'
- True openings: doors cut 0-7ft with leaves + frames, windows cut 3-7ft with glass + mullions + sills
- Furnished: beds + wardrobes, sofas + rug + TV, dining set, kitchen counters + sink + stove + fridge, WCs + basins, curtains, spinning ceiling fans
- Building: roof slab + parapet + stair headroom + lift overrun + 2 water tanks, compound wall, road + footpath, trees, streetlights
- PBR procedural textures (marble/wood/tiles/concrete/asphalt), ACES tone mapping, RoomEnvironment IBL, soft shadows
- UI: Ground / First / Both, Perspective / Top, Labels, Furniture, Spin, Day/Dusk, Sketches overlay with opacity (compares `manual-plan/sketch-first-*.jpg`)

## Files

- `index.html` — shell + toolbar + legend + sketch modal
- `js/plan.js` — plot 47'5" × 20'5", walls, rooms, stairs, columns, spots (edit here)
- `js/app.js` — scene builder
- `manual-plan/` — hand sketches + web copies `sketch-first-1/2.jpg`

## Deploy (GitHub Pages)

Push to `main`, then Settings → Pages → Deploy from branch → `main` / `/ (root)`.

## Tech

Three.js ES modules via import map, no framework, no build tools.
