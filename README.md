# 3D House Model

An interactive 3D model of a first-floor house plan (ALT-II), built with
[Three.js](https://threejs.org/). The plan was interpreted from a hand-drawn
sketch — every dimension lives in one data file so it stays easy to correct.

## Run it locally

Any static server works (needed so the ES modules load):

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Internet access is required on first load — Three.js is pulled from a CDN
(unpkg, pinned to v0.160.0). No build step, no dependencies to install.

## How it works

- `index.html` — page shell, overlay UI (title, view buttons, legend, notes).
- `js/plan.js` — **the plan itself**: plot size, wall segments with door gaps,
  room rectangles, staircase. Edit numbers here; the model rebuilds from it.
- `js/app.js` — Three.js scene: extruded walls, colour-coded room floors,
  labels, staircase, lighting, orbit controls.

Controls: drag to orbit, scroll to zoom, right-drag to pan. Buttons switch
between perspective/top view and toggle room labels.

## The plan (ALT-II, interpreted)

Plot 47'5" (E-W) × 20'5" (N-S). Rooms: Kitchen, Entry Lobby, Toilet 4'×8'7",
Lift 4'×4', Hall 10'6"×12'5" (+ 7'×8' nook), W.C. 4'×4', two Bedrooms 10'×13'.
Walls 10 ft high (9" exterior / 4.5" interior).

Known approximations — see the header of `js/plan.js` for the full list:
room positions are interpreted from a hand sketch, and the two 10'-deep
bedrooms are modelled at 9.46' so they fit the 20'5" plot depth.

## Tech

Three.js (ES modules via CDN import map), no framework, no build tools.
