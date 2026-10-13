import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PLAN } from './plan.js';

/* Plot: 20'5" (E-W) x 47'5" (N-S). Road on NORTH short side.
   Neighbour plots adjoin the long east/west walls. +Z = North. */

const container = document.getElementById('scene');
const loaderEl = document.getElementById('loader');
window.addEventListener('error', (e) => {
  if (loaderEl) loaderEl.textContent = 'Error: ' + (e.message || 'failed to load 3D');
});
window.addEventListener('unhandledrejection', (e) => {
  if (loaderEl) loaderEl.textContent = 'Error: ' + ((e.reason && e.reason.message) || 'failed to load 3D');
});

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1420);
scene.fog = new THREE.Fog(0x0d1420, 160, 420);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 900);
const CX = PLAN.plot.w / 2, CZ = PLAN.plot.d / 2;
const HOME = new THREE.Vector3(CX + 30, 32, CZ + 42);
camera.position.copy(HOME);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(CX, 6, CZ);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 8;
controls.maxDistance = 220;

/* lights */
scene.add(new THREE.HemisphereLight(0xdfeaff, 0x2a2f3a, 0.55));
const sun = new THREE.DirectionalLight(0xfff1dd, 2.2);
sun.position.set(CX + 40, 60, CZ + 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: 5, far: 220 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.03;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xbfd4ff, 0.4);
fill.position.set(CX - 35, 28, CZ - 40);
scene.add(fill);

/* procedural textures */
function canvasTex(draw, size = 256, rx = 1, ry = 1) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
const rnd = (a, b) => a + Math.random() * (b - a);
const marbleTex = canvasTex((g, s) => {
  g.fillStyle = '#ece7dc'; g.fillRect(0, 0, s, s);
  g.strokeStyle = 'rgba(160,150,135,0.35)';
  for (let i = 0; i < 14; i++) {
    g.lineWidth = rnd(0.5, 1.8); g.beginPath();
    let x = rnd(0, s), y = 0; g.moveTo(x, y);
    while (y < s) { x += rnd(-18, 18); y += rnd(10, 30); g.lineTo(x, y); }
    g.stroke();
  }
}, 256, 3, 3);
const woodTex = canvasTex((g, s) => {
  g.fillStyle = '#b98a5a'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 42; i++) {
    g.strokeStyle = `rgba(90,55,25,${rnd(0.15, 0.4)})`;
    g.lineWidth = rnd(1, 3);
    const y = rnd(0, s); g.beginPath(); g.moveTo(0, y);
    g.bezierCurveTo(s * 0.3, y + rnd(-6, 6), s * 0.7, y + rnd(-6, 6), s, y);
    g.stroke();
  }
}, 256, 2, 2);
const concreteTex = canvasTex((g, s) => {
  g.fillStyle = '#9aa0ab'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 2200; i++) {
    g.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},${rnd(0.02, 0.07)})`;
    g.fillRect(rnd(0, s), rnd(0, s), 1.5, 1.5);
  }
}, 256, 6, 4);
const asphaltTex = canvasTex((g, s) => {
  g.fillStyle = '#3c4148'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 1600; i++) {
    g.fillStyle = `rgba(255,255,255,${rnd(0.03, 0.1)})`;
    g.fillRect(rnd(0, s), rnd(0, s), 1.2, 1.2);
  }
}, 256, 5, 2);
const tileTex = canvasTex((g, s) => {
  g.fillStyle = '#dfe9ef'; g.fillRect(0, 0, s, s);
  g.strokeStyle = '#b9c7d1'; g.lineWidth = 3;
  const n = 4, st = s / n;
  for (let i = 0; i <= n; i++) {
    g.beginPath(); g.moveTo(i * st, 0); g.lineTo(i * st, s); g.stroke();
    g.beginPath(); g.moveTo(0, i * st); g.lineTo(s, i * st); g.stroke();
  }
}, 256, 3, 3);

/* materials */
const M = {
  ext: new THREE.MeshStandardMaterial({ color: 0xe9dfcb, roughness: 0.85 }),
  extAccent: new THREE.MeshStandardMaterial({ color: 0xb4542e, roughness: 0.8 }),
  int: new THREE.MeshStandardMaterial({ color: 0xf2ede2, roughness: 0.92 }),
  concrete: new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 0.95 }),
  slab: new THREE.MeshStandardMaterial({ color: 0x8f97a5, roughness: 0.9 }),
  marble: new THREE.MeshStandardMaterial({ map: marbleTex, roughness: 0.32, metalness: 0.05, envMapIntensity: 0.7 }),
  wood: new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.6, envMapIntensity: 0.5 }),
  bath: new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.3, envMapIntensity: 0.6 }),
  kitchen: new THREE.MeshStandardMaterial({ color: 0xd8e8d5, roughness: 0.5 }),
  parking: new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 0.96 }),
  asphalt: new THREE.MeshStandardMaterial({ map: asphaltTex, roughness: 1 }),
  door: new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 0.55 }),
  doorFrame: new THREE.MeshStandardMaterial({ color: 0x3a2b1d, roughness: 0.6 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.06, metalness: 0, transparent: true, opacity: 0.5, envMapIntensity: 1.2 }),
  winFrame: new THREE.MeshStandardMaterial({ color: 0xf5f7fa, roughness: 0.4 }),
  steel: new THREE.MeshStandardMaterial({ color: 0x9aa3b2, roughness: 0.35, metalness: 0.8 }),
  liftDoor: new THREE.MeshStandardMaterial({ color: 0x707a8c, roughness: 0.3, metalness: 0.85 }),
  column: new THREE.MeshStandardMaterial({ color: 0xd9d2c2, roughness: 0.85 }),
  shutter: new THREE.MeshStandardMaterial({ color: 0x5b6b82, roughness: 0.5, metalness: 0.6 }),
  skirting: new THREE.MeshStandardMaterial({ color: 0x2b3442, roughness: 0.7 }),
  stair: new THREE.MeshStandardMaterial({ color: 0xc9cfdb, roughness: 0.8 }),
  rail: new THREE.MeshStandardMaterial({ color: 0x222a36, roughness: 0.4, metalness: 0.7 }),
  white: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 }),
  ceramic: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, envMapIntensity: 0.7 }),
  fabricBlue: new THREE.MeshStandardMaterial({ color: 0x2f5d8a, roughness: 0.9 }),
  fabricGreen: new THREE.MeshStandardMaterial({ color: 0x3f6b4f, roughness: 0.9 }),
  fabricRust: new THREE.MeshStandardMaterial({ color: 0x9a5a3c, roughness: 0.9 }),
  darkWood: new THREE.MeshStandardMaterial({ color: 0x4a3220, roughness: 0.6 }),
  counter: new THREE.MeshStandardMaterial({ color: 0x3c4450, roughness: 0.35 }),
  counterTop: new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.25 }),
  tankBlack: new THREE.MeshStandardMaterial({ color: 0x16191f, roughness: 0.7 }),
  neighbour: new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.95 }),
  neighbourWin: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 }),
};
const FLOOR_MAT = { marble: M.marble, wood: M.wood, bath: M.bath, kitchen: M.kitchen, concrete: M.concrete, parking: M.parking, asphalt: M.asphalt };

/* context: ground plane, road on NORTH short side, neighbours E/W + rear S */
const W = PLAN.plot.w, D = PLAN.plot.d;
const groundPlane = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: 0x111a26, roughness: 1 }));
groundPlane.rotation.x = -Math.PI / 2; groundPlane.position.y = -0.66; groundPlane.receiveShadow = true;
scene.add(groundPlane);

function box(parent, w, h, d, px, py, pz, mat, shadow = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(px, py, pz);
  if (shadow) { m.castShadow = true; m.receiveShadow = true; }
  parent.add(m);
  return m;
}

box(scene, 120, 0.2, 13, CX, -0.5, D + 10.5, M.asphalt); // road (E-W) north
box(scene, 60, 0.22, 3, CX, -0.5, D + 2.6, M.concrete); // footpath
box(scene, W + 0.6, 0.6, D + 0.6, CX, -0.3, CZ, M.slab); // plot base

// neighbour masses (between-plot context)
box(scene, 16, 26, 44, -0.6 - 8, 13, CZ, M.neighbour); // west building
box(scene, 16, 22, 40, W + 0.6 + 8, 11, CZ, M.neighbour); // east building
box(scene, 34, 14, 12, CX, 7, -0.6 - 6, M.neighbour); // rear south block
// simple window bands on neighbours' north faces
for (const [nx, nw] of [[-8.6, 16], [W + 8.6, 16]]) {
  for (const wy of [8, 14, 20]) {
    box(scene, nw * 0.7, 2.2, 0.3, nx, wy, CZ + 20.5, M.neighbourWin, false);
  }
}
// gate pillars outside north gate
{
  const gx0 = PLAN.ground.gate.at, gx1 = gx0 + PLAN.ground.gate.width;
  box(scene, 1, 9, 1, gx0 - 0.4, 4.5, D + 0.6, M.column);
  box(scene, 1, 9, 1, gx1 + 0.4, 4.5, D + 0.6, M.column);
}

/* groups */
const groundGroup = new THREE.Group();
const firstGroup = new THREE.Group();
const furnGround = new THREE.Group();
const furnFirst = new THREE.Group();
const labelGroup = new THREE.Group();
scene.add(groundGroup, firstGroup, furnGround, furnFirst, labelGroup);

const DOOR_H = 7, WIN_SILL = 3, WIN_H = 4;

/* wall builder with true openings. gaps measured from min-coordinate end. */
function buildWall(parent, x1, z1, x2, z2, t, h, yBase, doors = [], windows = [], mat = M.int, addLeaves = true) {
  const horiz = Math.abs(z2 - z1) < 1e-9;
  const len = horiz ? Math.abs(x2 - x1) : Math.abs(z2 - z1);
  const s0 = horiz ? Math.min(x1, x2) : Math.min(z1, z2);
  const openings = [
    ...doors.map(d => ({ ...d, sill: 0, oh: d.oh || DOOR_H, kind: 'door' })),
    ...windows.map(w => ({ ...w, sill: w.sill ?? WIN_SILL, oh: w.height || w.oh || WIN_H, kind: 'win' })),
  ].sort((a, b) => a.at - b.at);
  let intervals = [[0, len]];
  for (const o of openings) {
    const out = [];
    for (const [a, b] of intervals) {
      if (o.at > a + 1e-9) out.push([a, Math.min(o.at, b)]);
      if (o.at + o.width < b - 1e-9) out.push([Math.max(o.at + o.width, a), b]);
    }
    intervals = out;
  }
  for (const [a, b] of intervals) {
    const segLen = b - a;
    if (segLen <= 1e-6) continue;
    const mid = s0 + (a + b) / 2;
    if (horiz) box(parent, segLen, h, t, mid, yBase + h / 2, z1, mat);
    else box(parent, t, h, segLen, x1, yBase + h / 2, mid, mat);
  }
  for (const o of openings) {
    const mid = s0 + o.at + o.width / 2;
    if (o.sill > 0.05) {
      if (horiz) box(parent, o.width, o.sill, t, mid, yBase + o.sill / 2, z1, mat);
      else box(parent, t, o.sill, o.width, x1, yBase + o.sill / 2, mid, mat);
    }
    const top = o.sill + o.oh;
    if (h - top > 0.05) {
      if (horiz) box(parent, o.width, h - top, t, mid, yBase + top + (h - top) / 2, z1, mat);
      else box(parent, t, h - top, o.width, x1, yBase + top + (h - top) / 2, mid, mat);
    }
    if (o.kind === 'door' && addLeaves) {
      if (horiz) {
        box(parent, o.width + 0.3, 0.2, t + 0.18, mid, yBase + o.oh + 0.05, z1, M.doorFrame);
        box(parent, 0.2, o.oh, t + 0.18, mid - o.width / 2, yBase + o.oh / 2, z1, M.doorFrame);
        box(parent, 0.2, o.oh, t + 0.18, mid + o.width / 2, yBase + o.oh / 2, z1, M.doorFrame);
        const leaf = box(parent, o.width * 0.9, o.oh - 0.25, 0.14, mid - 0.2, yBase + o.oh / 2, z1 + 0.5, M.door);
        leaf.rotation.y = 0.55;
      } else {
        box(parent, t + 0.18, 0.2, o.width + 0.3, x1, yBase + o.oh + 0.05, mid, M.doorFrame);
        box(parent, t + 0.18, o.oh, 0.2, x1, yBase + o.oh / 2, mid - o.width / 2, M.doorFrame);
        box(parent, t + 0.18, o.oh, 0.2, x1, yBase + o.oh / 2, mid + o.width / 2, M.doorFrame);
        const leaf = box(parent, 0.14, o.oh - 0.25, o.width * 0.9, x1 + 0.5, yBase + o.oh / 2, mid, M.door);
        leaf.rotation.y = 0.55;
      }
    } else if (o.kind === 'win') {
      const y = yBase + o.sill + o.oh / 2;
      const g = new THREE.Group();
      g.position.set(horiz ? mid : x1, y, horiz ? z1 : mid);
      if (!horiz) g.rotation.y = Math.PI / 2;
      const fr = new THREE.Mesh(new THREE.BoxGeometry(o.width + 0.3, o.oh + 0.3, t + 0.12), M.winFrame);
      fr.castShadow = true; g.add(fr);
      g.add(new THREE.Mesh(new THREE.BoxGeometry(o.width, o.oh, 0.1), M.glass));
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.12, o.oh, t + 0.18), M.winFrame));
      const mh = new THREE.Mesh(new THREE.BoxGeometry(o.width, 0.12, t + 0.18), M.winFrame);
      g.add(mh);
      const sillM = new THREE.Mesh(new THREE.BoxGeometry(o.width + 0.7, 0.2, 0.7), M.winFrame);
      sillM.position.y = -o.oh / 2 - 0.2; g.add(sillM);
      parent.add(g);
    }
  }
}

function addRoomFloor(parent, r, y0) {
  const f = new THREE.Mesh(new THREE.PlaneGeometry(r.w, r.d), FLOOR_MAT[r.floor] || M.marble);
  f.rotation.x = -Math.PI / 2;
  f.position.set(r.x + r.w / 2, y0 + 0.03, r.z + r.d / 2);
  f.receiveShadow = true;
  parent.add(f);
  const sk = 0.35, th = 0.08;
  box(parent, r.w, sk, th, r.x + r.w / 2, y0 + sk / 2, r.z + th / 2, M.skirting, false);
  box(parent, r.w, sk, th, r.x + r.w / 2, y0 + sk / 2, r.z + r.d - th / 2, M.skirting, false);
  box(parent, th, sk, r.d, r.x + th / 2, y0 + sk / 2, r.z + r.d / 2, M.skirting, false);
  box(parent, th, sk, r.d, r.x + r.w - th / 2, y0 + sk / 2, r.z + r.d / 2, M.skirting, false);
}

function makeLabel(title, sub) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(6,12,22,0.82)';
  g.beginPath();
  if (g.roundRect) g.roundRect(8, 8, 496, 240, 36); else g.rect(8, 8, 496, 240);
  g.fill();
  g.strokeStyle = 'rgba(148,163,184,0.5)'; g.lineWidth = 3; g.stroke();
  g.textAlign = 'center';
  g.fillStyle = '#f1f5f9'; g.font = '600 52px system-ui,sans-serif';
  g.fillText(title, 256, 112, 470);
  g.fillStyle = '#94a3b8'; g.font = '400 40px system-ui,sans-serif';
  g.fillText(sub, 256, 180, 470);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sp.scale.set(7.2, 3.6, 1);
  return sp;
}

/* stairs: dir 'x' ascends +X, '-z' ascends -Z (southward) */
function addStairs(parent, st, y0) {
  const tread = st.run / st.steps;
  const dir = st.dir || 'x';
  for (let i = 0; i < st.steps; i++) {
    const h = st.rise * (i + 1);
    if (dir === 'x') {
      box(parent, tread + 0.06, h, st.width, st.x + (i + 0.5) * tread, y0 + h / 2, st.z + st.width / 2, M.stair);
    } else {
      const z = dir === '-z' ? st.z + st.run - (i + 0.5) * tread : st.z + (i + 0.5) * tread;
      box(parent, st.width, h, tread + 0.06, st.x + st.width / 2, y0 + h / 2, z, M.stair);
    }
  }
  const railH = 3, total = st.rise * st.steps;
  if (dir === 'x') {
    const rail = box(parent, st.run, 0.15, 0.15, st.x + st.run / 2, y0 + total + railH * 0.4, st.z + 0.15, M.rail);
    rail.rotation.z = Math.atan2(total, st.run);
    for (let i = 0; i <= 4; i++) {
      box(parent, 0.12, railH, 0.12, st.x + (st.run * i) / 4, y0 + (total * i) / 4 + railH / 2, st.z + 0.15, M.rail);
    }
  } else {
    const rail = box(parent, 0.15, 0.15, st.run, st.x + 0.15, y0 + total + railH * 0.4, st.z + st.run / 2, M.rail);
    rail.rotation.x = (dir === '-z' ? 1 : -1) * Math.atan2(total, st.run);
    for (let i = 0; i <= 4; i++) {
      const f = i / 4;
      const z = dir === '-z' ? st.z + st.run * (1 - f) : st.z + st.run * f;
      box(parent, 0.12, railH, 0.12, st.x + 0.15, y0 + total * f + railH / 2, z, M.rail);
    }
  }
}

/* essential furniture only (no clutter) */
function makeBed(w = 6, l = 7.5, fabric = M.fabricBlue) {
  const g = new THREE.Group();
  const add = (bw, bh, bd, px, py, pz, mt) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mt);
    m.position.set(px, py, pz); m.castShadow = m.receiveShadow = true; g.add(m);
  };
  add(w, 1.2, l, 0, 0.6, 0, M.darkWood);
  add(w - 0.3, 0.8, l - 0.3, 0, 1.5, 0, M.white);
  add(w - 0.3, 0.35, l * 0.55, 0, 1.9, -l * 0.18, fabric);
  add(w, 3.2, 0.4, 0, 1.6, -l / 2, M.darkWood);
  return g;
}
function makeWardrobe(w = 6, h = 7, d = 2) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.darkWood);
  body.position.y = h / 2; body.castShadow = body.receiveShadow = true; g.add(body);
  return g;
}
function makeSofa(w = 7, mat = M.fabricGreen) {
  const g = new THREE.Group();
  const add = (bw, bh, bd, px, py, pz) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mat);
    m.position.set(px, py, pz); m.castShadow = m.receiveShadow = true; g.add(m);
  };
  add(w, 1.4, 2.8, 0, 0.9, 0);
  add(w, 2.2, 0.8, 0, 2, -1.2);
  add(0.8, 2.2, 2.8, -w / 2, 1.6, 0);
  add(0.8, 2.2, 2.8, w / 2, 1.6, 0);
  return g;
}
function makeTable(w = 4, l = 6) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.25, l), M.darkWood);
  top.position.y = 2.4; top.castShadow = true; g.add(top);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.4, 0.25), M.darkWood);
    leg.position.set(sx * (w / 2 - 0.3), 1.2, sz * (l / 2 - 0.3)); g.add(leg);
  }
  return g;
}
function makeWC() {
  const g = new THREE.Group();
  const tank = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.6), M.ceramic);
  tank.position.set(0, 2.6, -1.2); tank.castShadow = true; g.add(tank);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 2.2), M.ceramic);
  seat.position.set(0, 0.9, 0); seat.castShadow = true; g.add(seat);
  return g;
}
function makeBasin() {
  const g = new THREE.Group();
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 2, 12), M.ceramic);
  ped.position.y = 1; ped.castShadow = true; g.add(ped);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.5, 0.7, 16), M.ceramic);
  bowl.position.y = 2.3; bowl.castShadow = true; g.add(bowl);
  return g;
}

function winsFor(list, wall) {
  return (list || []).filter(w => w.wall === wall).map(w => ({ at: w.at, width: w.width, sill: 3, height: 4 }));
}

/* ================= ground: open garage ================= */
{
  const y0 = PLAN.ground.y0;
  for (const p of PLAN.ground.perimeter) {
    const isGate = (p.gaps || []).some(g => (g.oh || 0) >= 8);
    if (isGate) {
      buildWall(groundGroup, p.x1, p.z1, p.x2, p.z2, PLAN.extT, PLAN.groundHeight, y0,
        [{ at: PLAN.ground.gate.at, width: PLAN.ground.gate.width, oh: 8.5 }], [], M.ext, false);
      const gx = PLAN.ground.gate.at + PLAN.ground.gate.width / 2;
      const gate = new THREE.Mesh(new THREE.BoxGeometry(PLAN.ground.gate.width, 8.5, 0.25), M.shutter);
      gate.position.set(gx, y0 + 4.25, D); gate.castShadow = true; groundGroup.add(gate);
      box(groundGroup, PLAN.ground.gate.width + 0.6, 0.5, 0.9, gx, y0 + 8.7, D, M.steel);
    } else {
      buildWall(groundGroup, p.x1, p.z1, p.x2, p.z2, PLAN.extT, PLAN.groundHeight, y0, p.gaps || [], [], M.ext, true);
    }
  }
  for (const p of PLAN.ground.partitions)
    buildWall(groundGroup, p.x1, p.z1, p.x2, p.z2, PLAN.intT, PLAN.groundHeight, y0, p.gaps || [], [], M.int, true);
  for (const r of PLAN.ground.rooms) addRoomFloor(groundGroup, r, y0);
  for (const c of PLAN.columns) box(groundGroup, 0.9, PLAN.groundHeight, 0.9, c.x, y0 + PLAN.groundHeight / 2, c.z, M.column);
  addStairs(groundGroup, PLAN.ground.stairs, y0);
  box(groundGroup, 3.6, 7, 3.6, 8.875, y0 + 3.5, 37.9, M.liftDoor); // lift cabin

  // painted bay outlines only — garage stays empty
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  for (const s of PLAN.parkingSpots) {
    const mk = (w, d, px, pz) => {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(w, d), lineMat);
      l.rotation.x = -Math.PI / 2; l.position.set(px, y0 + 0.05, pz); groundGroup.add(l);
    };
    mk(s.w, 0.15, s.x + s.w / 2, s.z);
    mk(s.w, 0.15, s.x + s.w / 2, s.z + s.d);
    mk(0.15, s.d, s.x, s.z + s.d / 2);
    mk(0.15, s.d, s.x + s.w, s.z + s.d / 2);
  }
  const bulb = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.15, 20),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff3d6, emissiveIntensity: 2 }));
  bulb.position.set(CX, y0 + PLAN.groundHeight - 0.25, CZ);
  groundGroup.add(bulb);
  const parkLight = new THREE.PointLight(0xffe9c4, 50, 50, 1.8);
  parkLight.position.set(CX, y0 + 8.5, CZ);
  groundGroup.add(parkLight);

  const lbl = makeLabel('Garage', 'Open parking');
  lbl.position.set(CX, y0 + 7.6, 24);
  lbl.userData.floor = 'ground';
  labelGroup.add(lbl);
}

/* ================= first floor ================= */
const FIRST_Y = PLAN.first.y0;
{
  box(firstGroup, W + 0.4, PLAN.slabT, D + 0.4, CX, FIRST_Y - PLAN.slabT / 2, CZ, M.slab);
  box(firstGroup, W + 0.55, 2, 0.2, CX, FIRST_Y + 1, 0, M.extAccent, false);
  box(firstGroup, W + 0.55, 2, 0.2, CX, FIRST_Y + 1, D, M.extAccent, false);

  const per = PLAN.first.perimeter, wl = PLAN.first.windows;
  const byWall = (i, name) => {
    const p = per[i];
    const doors = p.gaps || [];
    buildWall(firstGroup, p.x1, p.z1, p.x2, p.z2, PLAN.extT, PLAN.firstHeight, FIRST_Y, doors, winsFor(wl, name), M.ext, true);
  };
  byWall(0, 'south');
  byWall(1, 'north');
  byWall(2, 'west');
  byWall(3, 'east');
  for (const p of PLAN.first.partitions)
    buildWall(firstGroup, p.x1, p.z1, p.x2, p.z2, PLAN.intT, PLAN.firstHeight, FIRST_Y, p.gaps || [], [], M.int, true);
  for (const r of PLAN.first.rooms) addRoomFloor(firstGroup, r, FIRST_Y);
  addStairs(firstGroup, PLAN.first.stairs, FIRST_Y);
  box(firstGroup, 3.6, 7, 3.6, 8.875, FIRST_Y + 3.5, 37.9, M.liftDoor);

  // parapet + stair headroom + lift overrun + tanks
  const ph = PLAN.parapetH, pt = PLAN.extT, topY = FIRST_Y + PLAN.firstHeight;
  box(firstGroup, W, ph, pt, CX, topY + ph / 2, 0, M.ext);
  box(firstGroup, W, ph, pt, CX, topY + ph / 2, D, M.ext);
  box(firstGroup, pt, ph, D, 0, topY + ph / 2, CZ, M.ext);
  box(firstGroup, pt, ph, D, W, topY + ph / 2, CZ, M.ext);
  box(firstGroup, 4.5, 8, 13, 17.9, topY + 4, 20.9, M.ext);
  box(firstGroup, 5, 9, 5, 8.875, topY + 4.5, 37.9, M.ext);
  for (const [tx, tz] of [[17, 18], [17, 23]]) {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 3, 18), M.tankBlack);
    tank.position.set(tx, topY + 9.5, tz); tank.castShadow = true; firstGroup.add(tank);
  }

  const hall = new THREE.PointLight(0xfff0d6, 45, 32, 1.8);
  hall.position.set(9, FIRST_Y + 8.5, 29);
  firstGroup.add(hall);
  const bedL = new THREE.PointLight(0xdbeafe, 28, 24, 1.8);
  bedL.position.set(10, FIRST_Y + 8.5, 7);
  firstGroup.add(bedL);

  // essential furniture only
  {
    const b1 = makeBed(6, 7.5, M.fabricBlue);
    b1.position.set(5.4, FIRST_Y, 5); furnFirst.add(b1);
    const w1 = makeWardrobe(6, 7, 2); w1.position.set(3.75, FIRST_Y, 12.4); furnFirst.add(w1);
    const b2 = makeBed(6, 7.5, M.fabricRust);
    b2.position.set(15, FIRST_Y, 5); furnFirst.add(b2);
    const w2 = makeWardrobe(6, 7, 2); w2.position.set(16.4, FIRST_Y, 12.4); furnFirst.add(w2);
  }
  {
    const s1 = makeSofa(7, M.fabricGreen); s1.position.set(8, FIRST_Y, 26); furnFirst.add(s1);
    const s2 = makeSofa(5, M.fabricBlue); s2.position.set(8.5, FIRST_Y, 32.5); s2.rotation.y = Math.PI; furnFirst.add(s2);
    const dt = makeTable(4, 6); dt.position.set(17, FIRST_Y, 31.4); furnFirst.add(dt);
  }
  { // kitchen (origin 0.75, 39.67): counters west + south-east of door, fridge NE
    const ox = 0.75, oz = 39.67;
    box(furnFirst, 2, 2.8, 7, ox + 1, FIRST_Y + 1.4, oz + 3.5, M.counter);
    box(furnFirst, 2.1, 0.2, 7, ox + 1, FIRST_Y + 2.9, oz + 3.5, M.counterTop);
    box(furnFirst, 0.9, 0.3, 1.2, ox + 1, FIRST_Y + 3, oz + 5, M.steel); // sink on west counter
    box(furnFirst, 3.6, 2.8, 2, ox + 2.7, FIRST_Y + 1.4, oz + 1, M.counter); // clear of door x5.5..8.5
    box(furnFirst, 3.6, 0.2, 2.1, ox + 2.7, FIRST_Y + 2.9, oz + 1, M.counterTop);
    box(furnFirst, 1.6, 0.15, 1.6, ox + 2.7, FIRST_Y + 3, oz + 1, new THREE.MeshStandardMaterial({ color: 0x111111 })); // stove
    box(furnFirst, 2.4, 6, 2.2, ox + 8, FIRST_Y + 3, oz + 5.6, M.white); // fridge
  }
  {
    const wc = makeWC(); wc.position.set(10, FIRST_Y, 16); wc.rotation.y = Math.PI; furnFirst.add(wc);
    const wc2 = makeWC(); wc2.position.set(13, FIRST_Y, 38.6); wc2.rotation.y = Math.PI; furnFirst.add(wc2);
    const b = makeBasin(); b.position.set(17.5, FIRST_Y, 37.5); furnFirst.add(b);
  }

  for (const r of PLAN.first.rooms) {
    const lb = makeLabel(r.name, r.sub);
    lb.position.set(r.x + r.w / 2, FIRST_Y + 7.8, r.z + r.d / 2);
    lb.userData.floor = 'first';
    labelGroup.add(lb);
  }
}

/* dims + north arrow */
function textSprite(text, scale = 4) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#e2e8f0'; g.font = '600 60px system-ui,sans-serif'; g.textAlign = 'center';
  g.fillText(text, 128, 84);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sp.scale.set(scale, scale / 2, 1);
  return sp;
}
const northArrow = textSprite('N ↑', 5);
northArrow.position.set(W + 4, 3, D + 3);
scene.add(northArrow);
const dimX = textSprite(`20'5"`, 7); dimX.position.set(CX, 1.2, -3.4); scene.add(dimX);
const dimZ = textSprite(`47'5"`, 7); dimZ.position.set(-4.2, 1.2, CZ); scene.add(dimZ);

/* UI */
const legend = document.getElementById('legend');
legend.innerHTML = '';
for (const r of PLAN.first.rooms) {
  const row = document.createElement('div');
  row.className = 'legend-row';
  const sw = document.createElement('span');
  sw.className = 'swatch'; sw.style.background = r.color;
  const tx = document.createElement('span');
  tx.textContent = `${r.name} — ${r.sub}`;
  row.appendChild(sw); row.appendChild(tx);
  legend.appendChild(row);
}

let labelsOn = true, furnOn = true, mode = 'both';
function applyMode() {
  groundGroup.visible = mode === 'ground' || mode === 'both';
  firstGroup.visible = mode === 'first' || mode === 'both';
  furnGround.visible = furnOn && (mode === 'ground' || mode === 'both');
  furnFirst.visible = furnOn && (mode === 'first' || mode === 'both');
  for (const l of labelGroup.children) {
    if (!labelsOn) { l.visible = false; continue; }
    l.visible = mode === 'both' ? true : l.userData.floor === mode;
  }
  document.querySelectorAll('[data-floor]').forEach(b => b.classList.toggle('active', b.dataset.floor === mode));
}
document.querySelectorAll('[data-floor]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.floor; applyMode(); }));
document.getElementById('btn-labels').addEventListener('click', (e) => { labelsOn = !labelsOn; applyMode(); e.target.classList.toggle('off', !labelsOn); });
document.getElementById('btn-furn').addEventListener('click', (e) => { furnOn = !furnOn; applyMode(); e.target.classList.toggle('off', !furnOn); });
document.getElementById('btn-top').addEventListener('click', () => { camera.position.set(CX, 110, CZ + 0.01); controls.target.set(CX, 0, CZ); });
document.getElementById('btn-persp').addEventListener('click', () => { camera.position.copy(HOME); controls.target.set(CX, 6, CZ); });
document.getElementById('btn-spin').addEventListener('click', (e) => {
  controls.autoRotate = !controls.autoRotate; controls.autoRotateSpeed = 0.9;
  e.target.classList.toggle('off', !controls.autoRotate);
});
document.getElementById('btn-day').addEventListener('click', (e) => {
  const dusk = sun.intensity > 1.5;
  if (dusk) {
    sun.intensity = 0.65; sun.color.set(0xff9a5c);
    scene.background.set(0x1a2333); scene.fog.color.set(0x1a2333);
    renderer.toneMappingExposure = 0.95;
  } else {
    sun.intensity = 2.2; sun.color.set(0xfff1dd);
    scene.background.set(0x0d1420); scene.fog.color.set(0x0d1420);
    renderer.toneMappingExposure = 1.05;
  }
  e.target.textContent = dusk ? 'Day' : 'Dusk';
});
const sketchModal = document.getElementById('sketch-modal');
document.getElementById('btn-sketch').addEventListener('click', () => sketchModal.classList.toggle('open'));
document.getElementById('sketch-close').addEventListener('click', () => sketchModal.classList.remove('open'));
const sketchImg = document.getElementById('sketch-img');
document.querySelectorAll('[data-sketch]').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('[data-sketch]').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  sketchImg.src = b.dataset.sketch;
}));
document.getElementById('sketch-opacity').addEventListener('input', (e) => { sketchImg.style.opacity = e.target.value; });
applyMode();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let firstFrame = true;
renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
  if (firstFrame) {
    firstFrame = false;
    if (loaderEl) loaderEl.style.display = 'none';
  }
});
