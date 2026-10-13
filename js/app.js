import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PLAN } from './plan.js';

/* ================= renderer / scene ================= */
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
scene.fog = new THREE.Fog(0x0d1420, 150, 380);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 900);
const CX = PLAN.plot.w / 2, CZ = PLAN.plot.d / 2;
const HOME = new THREE.Vector3(CX + 34, 34, CZ + 46);
camera.position.copy(HOME);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(CX, 6, CZ);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 8;
controls.maxDistance = 200;

/* ================= lights ================= */
scene.add(new THREE.HemisphereLight(0xdfeaff, 0x2a2f3a, 0.55));
const sun = new THREE.DirectionalLight(0xfff1dd, 2.2);
sun.position.set(CX + 38, 58, CZ - 32);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: 5, far: 200 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.03;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xbfd4ff, 0.45);
fill.position.set(CX - 42, 30, CZ + 38);
scene.add(fill);

/* ================= procedural textures ================= */
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
const rugTex = canvasTex((g, s) => {
  g.fillStyle = '#7c2d3a'; g.fillRect(0, 0, s, s);
  g.strokeStyle = '#d9b26a'; g.lineWidth = 6;
  g.strokeRect(14, 14, s - 28, s - 28);
  g.strokeStyle = 'rgba(217,178,106,0.6)'; g.lineWidth = 2;
  g.strokeRect(30, 30, s - 60, s - 60);
}, 256, 1, 1);

/* ================= materials ================= */
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
};
const FLOOR_MAT = { marble: M.marble, wood: M.wood, bath: M.bath, kitchen: M.kitchen, concrete: M.concrete, parking: M.parking, asphalt: M.asphalt };

/* ================= context ================= */
const groundPlane = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: 0x111a26, roughness: 1 }));
groundPlane.rotation.x = -Math.PI / 2; groundPlane.position.y = -0.66; groundPlane.receiveShadow = true;
scene.add(groundPlane);
const road = new THREE.Mesh(new THREE.BoxGeometry(160, 0.2, 13), M.asphalt);
road.position.set(CX, -0.5, PLAN.plot.d + 10.5); road.receiveShadow = true;
scene.add(road);
const footpath = new THREE.Mesh(new THREE.BoxGeometry(160, 0.22, 3), M.concrete);
footpath.position.set(CX, -0.5, PLAN.plot.d + 2.8); footpath.receiveShadow = true;
scene.add(footpath);
const base = new THREE.Mesh(new THREE.BoxGeometry(PLAN.plot.w + 0.6, 0.6, PLAN.plot.d + 0.6), M.slab);
base.position.set(CX, -0.3, CZ); base.receiveShadow = base.castShadow = true;
scene.add(base);

// compound wall (5ft) with north gate gap
{
  const ch = 5, ct = 0.6;
  const mk = (w, d, px, pz) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, ch, d), M.ext);
    m.position.set(px, ch / 2, pz); m.castShadow = m.receiveShadow = true; scene.add(m);
  };
  mk(PLAN.plot.w + 4, ct, CX, -2.2);
  mk(PLAN.plot.w + 4, ct, CX, PLAN.plot.d + 2.2 - 12.6 + 12.6); // placeholder replaced below
  scene.children.pop();
  // north compound in two runs leaving 12ft gate
  mk(18 - 0 + 2, ct, (0 - 2 + 18) / 2, PLAN.plot.d + 1.2);
  mk(PLAN.plot.w - 30 + 2, ct, (30 + PLAN.plot.w + 2) / 2, PLAN.plot.d + 1.2);
  mk(ct, PLAN.plot.d + 4, -2, CZ);
  mk(ct, PLAN.plot.d + 4, PLAN.plot.w + 2, CZ);
}

/* ================= groups ================= */
const groundGroup = new THREE.Group();
const firstGroup = new THREE.Group();
const furnGround = new THREE.Group();
const furnFirst = new THREE.Group();
const labelGroup = new THREE.Group();
scene.add(groundGroup, firstGroup, furnGround, furnFirst, labelGroup);

const DOOR_H = 7, WIN_SILL = 3, WIN_H = 4;

function box(parent, w, h, d, px, py, pz, mat, shadow = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(px, py, pz);
  if (shadow) { m.castShadow = true; m.receiveShadow = true; }
  parent.add(m);
  return m;
}

/* True-opening wall builder: doors cut 0..DOOR_H, windows cut sill..sill+h */
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
    const fix = horiz ? (sx) => sx : (sx) => sx;
    // sill block
    if (o.sill > 0.05) {
      if (horiz) box(parent, o.width, o.sill, t, mid, yBase + o.sill / 2, z1, mat);
      else box(parent, t, o.sill, o.width, x1, yBase + o.sill / 2, mid, mat);
    }
    // lintel block
    const top = o.sill + o.oh;
    if (h - top > 0.05) {
      if (horiz) box(parent, o.width, h - top, t, mid, yBase + top + (h - top) / 2, z1, mat);
      else box(parent, t, h - top, o.width, x1, yBase + top + (h - top) / 2, mid, mat);
    }
    if (o.kind === 'door' && addLeaves) {
      const ft = 0.2;
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
      void fix;
    } else if (o.kind === 'win') {
      const y = yBase + o.sill + o.oh / 2;
      const px = horiz ? mid : x1;
      const pz = horiz ? z1 : mid;
      const g = new THREE.Group();
      g.position.set(px, y, pz);
      if (!horiz) g.rotation.y = Math.PI / 2;
      const fr = new THREE.Mesh(new THREE.BoxGeometry(o.width + 0.3, o.oh + 0.3, t + 0.12), M.winFrame);
      fr.castShadow = true; g.add(fr);
      const gl = new THREE.Mesh(new THREE.BoxGeometry(o.width, o.oh, 0.1), M.glass);
      g.add(gl);
      const mv = new THREE.Mesh(new THREE.BoxGeometry(0.12, o.oh, t + 0.18), M.winFrame);
      g.add(mv);
      const mh = new THREE.Mesh(new THREE.BoxGeometry(o.width, 0.12, t + 0.18), M.winFrame);
      g.add(mh);
      const sillM = new THREE.Mesh(new THREE.BoxGeometry(o.width + 0.7, 0.2, 0.7), M.winFrame);
      sillM.position.y = -o.oh / 2 - 0.2; g.add(sillM);
      parent.add(g);
    }
  }
}

function addRoomFloor(parent, r, y0) {
  const mat = FLOOR_MAT[r.floor] || M.marble;
  const f = new THREE.Mesh(new THREE.PlaneGeometry(r.w, r.d), mat);
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

const fans = [];
function addStairs(parent, st, y0, withRail = true) {
  const tread = st.run / st.steps;
  for (let i = 0; i < st.steps; i++) {
    const h = st.rise * (i + 1);
    box(parent, tread + 0.06, h, st.width, st.x + (i + 0.5) * tread, y0 + h / 2, st.z + st.width / 2, M.stair);
  }
  if (withRail) {
    const railH = 3;
    const rail = box(parent, st.run, 0.15, 0.15, st.x + st.run / 2, y0 + st.rise * st.steps + railH * 0.4, st.z + 0.15, M.rail);
    rail.rotation.z = Math.atan2(st.rise * st.steps, st.run);
    for (let i = 0; i <= 4; i++) {
      box(parent, 0.12, railH, 0.12, st.x + (st.run * i) / 4, y0 + (st.rise * st.steps * i) / 4 + railH / 2, st.z + 0.15, M.rail);
    }
  }
}

/* ================= furniture builders ================= */
function makeBed(w = 6, l = 7, fabric = M.fabricBlue) {
  const g = new THREE.Group();
  const add = (bw, bh, bd, px, py, pz, mt) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mt);
    m.position.set(px, py, pz); m.castShadow = m.receiveShadow = true; g.add(m); return m;
  };
  add(w, 1.2, l, 0, 0.6, 0, M.darkWood);
  add(w - 0.3, 0.8, l - 0.3, 0, 1.5, 0, M.white);
  add(w - 0.3, 0.35, l * 0.55, 0, 1.9, -l * 0.18, fabric);
  add(w, 3.2, 0.4, 0, 1.6, -l / 2, M.darkWood);
  add(w * 0.4, 0.5, 1.1, -w * 0.24, 2.05, -l / 2 + 1.1, M.white);
  add(w * 0.4, 0.5, 1.1, w * 0.24, 2.05, -l / 2 + 1.1, M.white);
  return g;
}
function makeWardrobe(w = 6, h = 7, d = 2) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.darkWood);
  body.position.y = h / 2; body.castShadow = body.receiveShadow = true; g.add(body);
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.08, h - 0.4, 0.06), M.steel);
  line.position.set(0, h / 2, d / 2 + 0.02); g.add(line);
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
  for (let i = 0; i < 4; i++) {
    const ch = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), M.fabricRust);
    const a = (i / 4) * Math.PI * 2;
    ch.position.set(Math.cos(a) * (w / 2 + 1.2), 0.7, Math.sin(a) * (l / 2 + 1.2));
    ch.castShadow = true; g.add(ch);
  }
  return g;
}
function makeKitchen(y0) {
  const g = new THREE.Group();
  const add = (bw, bh, bd, px, py, pz, mt) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mt);
    m.position.set(px, py, pz); m.castShadow = m.receiveShadow = true; g.add(m); return m;
  };
  // counters along south + west inside 7x9.5 kitchen at (0.75,0.75)
  add(6.6, 2.8, 2, 0.75 + 3.5, y0 + 1.4, 0.75 + 1, M.counter);
  add(6.6, 0.2, 2.1, 0.75 + 3.5, y0 + 2.9, 0.75 + 1, M.counterTop);
  add(2, 2.8, 7, 0.75 + 1, y0 + 1.4, 0.75 + 4.6, M.counter);
  add(0.9, 0.3, 1.2, 0.75 + 3.5, y0 + 3, 0.75 + 1, M.steel); // sink
  add(2, 0.15, 2, 0.75 + 5, y0 + 3, 0.75 + 1, new THREE.MeshStandardMaterial({ color: 0x111111 })); // stove
  add(2.4, 6, 2.2, 0.75 + 5.6, y0 + 3, 0.75 + 8, M.white); // fridge
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
function makeFan() {
  const g = new THREE.Group();
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8), M.steel);
  rod.position.y = -0.75; g.add(rod);
  const blades = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.06, 0.5), M.darkWood);
    b.position.x = 1.8;
    const holder = new THREE.Group();
    holder.rotation.y = (i / 3) * Math.PI * 2;
    holder.add(b); blades.add(holder);
  }
  blades.position.y = -1.5;
  g.add(blades);
  fans.push(blades);
  return g;
}
function makeCar(color) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.4, envMapIntensity: 1 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.6, 13), bodyMat);
  body.position.y = 1.6; body.castShadow = true; g.add(body);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.5, 6.5), new THREE.MeshPhysicalMaterial({ color: 0x1c2733, roughness: 0.1 }));
  cab.position.set(0, 3.1, -0.5); cab.castShadow = true; g.add(cab);
  const wg = new THREE.CylinderGeometry(1.05, 1.05, 0.8, 18);
  wg.rotateZ(Math.PI / 2);
  const wm = new THREE.MeshStandardMaterial({ color: 0x14181f, roughness: 0.8 });
  for (const [x, z] of [[-2.9, 4.2], [2.9, 4.2], [-2.9, -4.2], [2.9, -4.2]]) {
    const w = new THREE.Mesh(wg, wm);
    w.position.set(x, 1.05, z); w.castShadow = true; g.add(w);
  }
  const hl = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.4, 0.2),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff6c9, emissiveIntensity: 2 }));
  hl.position.set(0, 1.7, 6.55); g.add(hl);
  return g;
}
function makeTV() {
  const g = new THREE.Group();
  const cons = new THREE.Mesh(new THREE.BoxGeometry(5, 1.4, 1.4), M.darkWood);
  cons.position.y = 0.7; cons.castShadow = true; g.add(cons);
  const scr = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.6, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x3b82f6, emissiveIntensity: 0.7 }));
  scr.position.y = 2.8; g.add(scr);
  return g;
}
function makeRug(w, d) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.95 }));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  return m;
}

/* window lookup per wall */
function winsFor(list, wall) {
  return (list || []).filter(w => w.wall === wall).map(w => ({ at: w.at, width: w.width, sill: 3, height: 4 }));
}

/* ================= build ground ================= */
{
  const y0 = PLAN.ground.y0;
  const gp = PLAN.ground.perimeter;
  // south solid, north with 12ft gate (8ft high shutter), west/east
  for (const p of gp) {
    const isGate = (p.gaps || []).some(g => g.width >= 10);
    if (isGate) {
      buildWall(groundGroup, p.x1, p.z1, p.x2, p.z2, PLAN.extT, PLAN.groundHeight, y0,
        [{ at: 18, width: 12, oh: 8 }], [], M.ext, false);
      const gate = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 0.25), M.shutter);
      gate.position.set(24, y0 + 4, PLAN.plot.d); gate.castShadow = true; groundGroup.add(gate);
      box(groundGroup, 12.6, 0.5, 0.9, 24, y0 + 8.3, PLAN.plot.d, M.steel);
    } else {
      buildWall(groundGroup, p.x1, p.z1, p.x2, p.z2, PLAN.extT, PLAN.groundHeight, y0, p.gaps || [], [], M.ext, true);
    }
  }
  for (const p of PLAN.ground.partitions)
    buildWall(groundGroup, p.x1, p.z1, p.x2, p.z2, PLAN.intT, PLAN.groundHeight, y0, p.gaps || [], [], M.int, true);
  for (const r of PLAN.ground.rooms) addRoomFloor(groundGroup, r, y0);
  for (const c of PLAN.columns) box(groundGroup, 0.9, PLAN.groundHeight, 0.9, c.x, y0 + PLAN.groundHeight / 2, c.z, M.column);
  addStairs(groundGroup, PLAN.ground.stairs, y0, true);
  // lift cabin
  box(groundGroup, 3.6, 7, 3.6, 9.5, y0 + 3.5, 8.75, M.liftDoor);
  // parking lines
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  for (const s of PLAN.parkingSpots) {
    const mk = (w, d, px, pz) => {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(w, d), lineMat);
      l.rotation.x = -Math.PI / 2; l.position.set(px, y0 + 0.05, pz); groundGroup.add(l);
    };
    mk(s.w, 0.15, s.x + s.w / 2, s.z);
    mk(0.15, s.d, s.x, s.z + s.d / 2);
    mk(0.15, s.d, s.x + s.w, s.z + s.d / 2);
  }
  const bulbMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff3d6, emissiveIntensity: 2.2 });
  for (const [bx, bz] of [[9.5, 8.8], [24, 8], [38, 8]]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.15, 20), bulbMat);
    b.position.set(bx, y0 + PLAN.groundHeight - 0.25, bz); groundGroup.add(b);
  }
  const parkLight = new THREE.PointLight(0xffe9c4, 60, 45, 1.8);
  parkLight.position.set(25, y0 + 8.5, 8); groundGroup.add(parkLight);

  // cars + bike boxes + entry bench
  const carCols = [0xb91c1c, 0x1d4ed8, 0xe5e7eb];
  PLAN.parkingSpots.forEach((s, i) => {
    const car = makeCar(carCols[i % carCols.length]);
    car.position.set(s.x + s.w / 2, 0.05, s.z + s.d / 2 + 1);
    car.rotation.y = Math.PI;
    furnGround.add(car);
  });
  box(furnGround, 3, 1.6, 2, 13.5, y0 + 0.8, 17.5, M.darkWood); // storage
  box(furnGround, 5, 0.25, 2, 4, y0 + 1.3, 15, M.darkWood); // bench
  const lbl = makeLabel('Parking', 'Ground floor');
  lbl.position.set(29, y0 + 7.6, 8); lbl.userData.floor = 'ground'; labelGroup.add(lbl);
  const lbl2 = makeLabel('Entry', 'Ground lobby');
  lbl2.position.set(4, y0 + 7.2, 15); lbl2.userData.floor = 'ground'; labelGroup.add(lbl2);
}

/* ================= build first ================= */
const FIRST_Y = PLAN.first.y0;
{
  box(firstGroup, PLAN.plot.w + 0.4, PLAN.slabT, PLAN.plot.d + 0.4, CX, FIRST_Y - PLAN.slabT / 2, CZ, M.slab);
  // accent band on exterior (thin strips, not solid fill)
  box(firstGroup, PLAN.plot.w + 0.55, 2, 0.2, CX, FIRST_Y + 1, 0, M.extAccent, false);
  box(firstGroup, PLAN.plot.w + 0.55, 2, 0.2, CX, FIRST_Y + 1, PLAN.plot.d, M.extAccent, false);
  box(firstGroup, 0.2, 2, PLAN.plot.d + 0.55, 0, FIRST_Y + 1, CZ, M.extAccent, false);
  box(firstGroup, 0.2, 2, PLAN.plot.d + 0.55, PLAN.plot.w, FIRST_Y + 1, CZ, M.extAccent, false);
  // perimeter with TRUE window cutouts
  const per = PLAN.first.perimeter;
  const wl = PLAN.first.windows;
  buildWall(firstGroup, per[0].x1, per[0].z1, per[0].x2, per[0].z2, PLAN.extT, PLAN.firstHeight, FIRST_Y, [], winsFor(wl, 'south'), M.ext, true);
  buildWall(firstGroup, per[1].x1, per[1].z1, per[1].x2, per[1].z2, PLAN.extT, PLAN.firstHeight, FIRST_Y, [], winsFor(wl, 'north'), M.ext, true);
  buildWall(firstGroup, per[2].x1, per[2].z1, per[2].x2, per[2].z2, PLAN.extT, PLAN.firstHeight, FIRST_Y, per[2].gaps || [], winsFor(wl, 'west'), M.ext, true);
  buildWall(firstGroup, per[3].x1, per[3].z1, per[3].x2, per[3].z2, PLAN.extT, PLAN.firstHeight, FIRST_Y, [], winsFor(wl, 'east'), M.ext, true);
  for (const p of PLAN.first.partitions)
    buildWall(firstGroup, p.x1, p.z1, p.x2, p.z2, PLAN.intT, PLAN.firstHeight, FIRST_Y, p.gaps || [], [], M.int, true);
  for (const r of PLAN.first.rooms) addRoomFloor(firstGroup, r, FIRST_Y);
  addStairs(firstGroup, PLAN.first.stairs, FIRST_Y, true);
  box(firstGroup, 3.6, 7, 3.6, 9.5, FIRST_Y + 3.5, 8.75, M.liftDoor);

  // parapet + roof slab + bulkheads + tanks
  const ph = PLAN.parapetH, pt = PLAN.extT, topY = FIRST_Y + PLAN.firstHeight;
  box(firstGroup, PLAN.plot.w, ph, pt, CX, topY + ph / 2, 0, M.ext);
  box(firstGroup, PLAN.plot.w, ph, pt, CX, topY + ph / 2, PLAN.plot.d, M.ext);
  box(firstGroup, pt, ph, PLAN.plot.d, 0, topY + ph / 2, CZ, M.ext);
  box(firstGroup, pt, ph, PLAN.plot.d, PLAN.plot.w, topY + ph / 2, CZ, M.ext);
  // stair headroom + lift overrun
  box(firstGroup, 13, 8, 5, 26.5, topY + 4, 17.9, M.ext);
  box(firstGroup, 5, 9, 5, 9.5, topY + 4.5, 8.75, M.ext);
  for (const [tx, tz] of [[36, 5], [40, 5]]) {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 3, 18), M.tankBlack);
    tank.position.set(tx, topY + 1.5, tz); tank.castShadow = true; firstGroup.add(tank);
  }

  const hall = new THREE.PointLight(0xfff0d6, 50, 32, 1.8);
  hall.position.set(18, FIRST_Y + 8.5, 9); firstGroup.add(hall);
  const bedL = new THREE.PointLight(0xdbeafe, 30, 26, 1.8);
  bedL.position.set(40, FIRST_Y + 8.5, 5); firstGroup.add(bedL);

  // ---- furnished interiors ----
  // Bedroom S (33.67,0.75,13x9.46)
  {
    const bed = makeBed(6, 7.5, M.fabricBlue);
    bed.position.set(42, FIRST_Y, 4.6); bed.rotation.y = Math.PI / 2; furnFirst.add(bed);
    const w1 = makeWardrobe(6, 7, 2); w1.position.set(36, FIRST_Y, 1.8); furnFirst.add(w1);
    box(furnFirst, 1.6, 1.6, 1.6, 38.2, FIRST_Y + 0.8, 1.8, M.darkWood);
    const fan = makeFan(); fan.position.set(40, FIRST_Y + 10, 5.5); furnFirst.add(fan);
  }
  // Bedroom N
  {
    const bed = makeBed(6, 7.5, M.fabricRust);
    bed.position.set(42, FIRST_Y, 15); bed.rotation.y = Math.PI / 2; furnFirst.add(bed);
    const w1 = makeWardrobe(6, 7, 2); w1.position.set(36, FIRST_Y, 18.5); furnFirst.add(w1);
    const fan = makeFan(); fan.position.set(40, FIRST_Y + 10, 15); furnFirst.add(fan);
  }
  // Hall + nook: sofas, rug, TV, dining
  {
    const rug = makeRug(9, 7); rug.position.set(18, FIRST_Y + 0.05, 9); furnFirst.add(rug);
    const s1 = makeSofa(7, M.fabricGreen); s1.position.set(15.5, FIRST_Y, 6.5); furnFirst.add(s1);
    const s2 = makeSofa(5, M.fabricBlue); s2.position.set(21.5, FIRST_Y, 11.5); s2.rotation.y = Math.PI; furnFirst.add(s2);
    const tv = makeTV(); tv.position.set(18, FIRST_Y, 4.6); furnFirst.add(tv);
    const dt = makeTable(4, 6); dt.position.set(15.5, FIRST_Y, 17); furnFirst.add(dt);
    const fan = makeFan(); fan.position.set(18, FIRST_Y + 10, 9); furnFirst.add(fan);
  }
  // Kitchen
  {
    const k = makeKitchen(FIRST_Y); furnFirst.add(k);
  }
  // Toilet + WC
  {
    const wc = makeWC(); wc.position.set(9.5, FIRST_Y, 17.5); wc.rotation.y = Math.PI; furnFirst.add(wc);
    const b = makeBasin(); b.position.set(9.5, FIRST_Y, 12.2); furnFirst.add(b);
    const wc2 = makeWC(); wc2.position.set(31.5, FIRST_Y, 10.8); wc2.rotation.y = Math.PI; furnFirst.add(wc2);
  }
  // curtains on south windows (simple)
  const curtM = new THREE.MeshStandardMaterial({ color: 0xf3e8c9, roughness: 0.95 });
  for (const wx of [5, 28.5, 40.5]) {
    box(furnFirst, 1.2, 4.5, 0.3, wx - 1.6, FIRST_Y + 5, 0.6, curtM, false);
    box(furnFirst, 1.2, 4.5, 0.3, wx + 4 - 0.9 + 1.6 - 1.6, FIRST_Y + 5, 0.6, curtM, false);
  }

  for (const r of PLAN.first.rooms) {
    const lb = makeLabel(r.name, r.sub);
    lb.position.set(r.x + r.w / 2, FIRST_Y + 7.8, r.z + r.d / 2);
    lb.userData.floor = 'first';
    labelGroup.add(lb);
  }
}

/* ================= street props ================= */
{
  const trunkM = new THREE.MeshStandardMaterial({ color: 0x6b4a2f, roughness: 0.9 });
  const leafM = new THREE.MeshStandardMaterial({ color: 0x2f7d3a, roughness: 0.8 });
  for (const [tx, tz] of [[-7, -5], [PLAN.plot.w + 7, 3], [-7, 16]]) {
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 7, 10), trunkM);
    tr.position.set(tx, 3.5, tz); tr.castShadow = true; scene.add(tr);
    const lv = new THREE.Mesh(new THREE.IcosahedronGeometry(4.4, 1), leafM);
    lv.position.set(tx, 9.8, tz); lv.castShadow = true; scene.add(lv);
  }
  // streetlights
  for (const lx of [10, 38]) {
    box(scene, 0.4, 14, 0.4, lx, 7, PLAN.plot.d + 16, M.rail);
    const head = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2c4, emissiveIntensity: 1.6 }));
    head.position.set(lx, 14, PLAN.plot.d + 15); scene.add(head);
  }
  // gate posts
  for (const gx of [17.4, 30.6]) box(scene, 1, 9, 1, gx, 4.5, PLAN.plot.d + 1.2, M.column);
}

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
northArrow.position.set(PLAN.plot.w + 5, 3, PLAN.plot.d + 3);
scene.add(northArrow);
const dimS = textSprite(`47'5"`, 7); dimS.position.set(CX, 1.2, -4.2); scene.add(dimS);
const dimW = textSprite(`20'5"`, 7); dimW.position.set(-5.4, 1.2, CZ); scene.add(dimW);

/* ================= UI ================= */
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
document.getElementById('btn-top').addEventListener('click', () => { camera.position.set(CX, 105, CZ + 0.01); controls.target.set(CX, 0, CZ); });
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
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();
  for (const f of fans) f.rotation.y += dt * 6;
  controls.update();
  renderer.render(scene, camera);
  if (firstFrame) {
    firstFrame = false;
    if (loaderEl) loaderEl.style.display = 'none';
  }
});
