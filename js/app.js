import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PLAN } from './plan.js';

// ---------------------------------------------------------------------------
// Scene setup
// ---------------------------------------------------------------------------
const container = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101826);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const CX = PLAN.plot.w / 2;
const CZ = PLAN.plot.d / 2;
const HOME_POS = new THREE.Vector3(CX + 38, 42, CZ + 46);
camera.position.copy(HOME_POS);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(CX, 0, CZ);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.495;

// ---------------------------------------------------------------------------
// Lights
// ---------------------------------------------------------------------------
scene.add(new THREE.HemisphereLight(0xdfeaff, 0x1c2536, 0.85));
const sun = new THREE.DirectionalLight(0xfff2df, 1.6);
sun.position.set(CX + 30, 55, CZ - 25);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, far: 180 });
scene.add(sun);

// ---------------------------------------------------------------------------
// Ground + plot slab
// ---------------------------------------------------------------------------
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 400),
  new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -PLAN.slabT - 0.05;
ground.receiveShadow = true;
scene.add(ground);

const slab = new THREE.Mesh(
  new THREE.BoxGeometry(PLAN.plot.w, PLAN.slabT, PLAN.plot.d),
  new THREE.MeshStandardMaterial({ color: 0x8b93a3, roughness: 0.95 })
);
slab.position.set(CX, -PLAN.slabT / 2, CZ);
slab.receiveShadow = true;
slab.castShadow = true;
scene.add(slab);

// ---------------------------------------------------------------------------
// Walls (with door gaps)
// ---------------------------------------------------------------------------
const wallMat = new THREE.MeshStandardMaterial({ color: 0xe9dfc9, roughness: 0.9 });
const wallGroup = new THREE.Group();

function addWallRun(x1, z1, x2, z2, t, gaps = []) {
  const horiz = Math.abs(z2 - z1) < 1e-9;
  const len = horiz ? Math.abs(x2 - x1) : Math.abs(z2 - z1);
  const s0 = horiz ? Math.min(x1, x2) : Math.min(z1, z2);
  let intervals = [[0, len]];
  for (const g of [...gaps].sort((a, b) => a.at - b.at)) {
    const out = [];
    for (const [a, b] of intervals) {
      if (g.at > a + 1e-9) out.push([a, Math.min(g.at, b)]);
      if (g.at + g.width < b - 1e-9) out.push([Math.max(g.at + g.width, a), b]);
    }
    intervals = out;
  }
  for (const [a, b] of intervals) {
    const segLen = b - a;
    if (segLen <= 1e-6) continue;
    const mid = s0 + (a + b) / 2;
    const geo = horiz
      ? new THREE.BoxGeometry(segLen, PLAN.wallHeight, t)
      : new THREE.BoxGeometry(t, PLAN.wallHeight, segLen);
    const m = new THREE.Mesh(geo, wallMat);
    m.position.set(horiz ? mid : x1, PLAN.wallHeight / 2, horiz ? z1 : mid);
    m.castShadow = true;
    m.receiveShadow = true;
    wallGroup.add(m);
  }
}

for (const p of PLAN.partitions) addWallRun(p.x1, p.z1, p.x2, p.z2, PLAN.intT, p.gaps || []);
for (const p of PLAN.perimeter) addWallRun(p.x1, p.z1, p.x2, p.z2, PLAN.extT, p.gaps || []);
scene.add(wallGroup);

// ---------------------------------------------------------------------------
// Room floors + labels
// ---------------------------------------------------------------------------
const labelGroup = new THREE.Group();

function makeLabel(title, sub) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(8,14,26,0.78)';
  g.beginPath();
  if (g.roundRect) g.roundRect(8, 8, 496, 240, 36);
  else g.rect(8, 8, 496, 240);
  g.fill();
  g.textAlign = 'center';
  g.fillStyle = '#f1f5f9';
  g.font = '600 54px system-ui, -apple-system, sans-serif';
  g.fillText(title, 256, 112, 470);
  g.fillStyle = '#94a3b8';
  g.font = '400 42px system-ui, -apple-system, sans-serif';
  g.fillText(sub, 256, 182, 470);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  const sp = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
  );
  sp.scale.set(7.5, 3.75, 1);
  return sp;
}

for (const r of PLAN.rooms) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(r.w, r.d),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(r.color),
      roughness: 0.95,
      transparent: true,
      opacity: 0.92,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(r.x + r.w / 2, 0.02, r.z + r.d / 2);
  floor.receiveShadow = true;
  scene.add(floor);

  const label = makeLabel(r.name, r.sub);
  label.position.set(r.x + r.w / 2, 6.2, r.z + r.d / 2);
  labelGroup.add(label);
}
scene.add(labelGroup);

// ---------------------------------------------------------------------------
// Staircase
// ---------------------------------------------------------------------------
const st = PLAN.stairs;
const stairMat = new THREE.MeshStandardMaterial({ color: 0xb9c2d4, roughness: 0.9 });
const tread = st.run / st.steps;
for (let i = 0; i < st.steps; i++) {
  const h = st.rise * (i + 1);
  const step = new THREE.Mesh(new THREE.BoxGeometry(tread, h, st.width), stairMat);
  step.position.set(st.x + (i + 0.5) * tread, h / 2, st.z + st.width / 2);
  step.castShadow = true;
  step.receiveShadow = true;
  scene.add(step);
}

// ---------------------------------------------------------------------------
// North arrow + plot dimensions
// ---------------------------------------------------------------------------
function textSprite(text, scale = 4) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#e2e8f0';
  g.font = '600 64px system-ui, sans-serif';
  g.textAlign = 'center';
  g.fillText(text, 128, 84);
  const tex = new THREE.CanvasTexture(c);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sp.scale.set(scale, scale / 2, 1);
  return sp;
}
const north = textSprite('N ↑', 5);
north.position.set(PLAN.plot.w + 4, 3, PLAN.plot.d + 2);
scene.add(north);

const dimS = textSprite(`47'5"`, 7);
dimS.position.set(CX, 1.2, -3.2);
scene.add(dimS);
const dimW = textSprite(`20'5"`, 7);
dimW.position.set(-4.5, 1.2, CZ);
scene.add(dimW);

// ---------------------------------------------------------------------------
// UI wiring
// ---------------------------------------------------------------------------
const legend = document.getElementById('legend');
for (const r of PLAN.rooms) {
  const row = document.createElement('div');
  row.className = 'legend-row';
  const sw = document.createElement('span');
  sw.className = 'swatch';
  sw.style.background = r.color;
  const tx = document.createElement('span');
  tx.textContent = `${r.name} — ${r.sub}`;
  row.appendChild(sw);
  row.appendChild(tx);
  legend.appendChild(row);
}

let labelsOn = true;
document.getElementById('btn-labels').addEventListener('click', (e) => {
  labelsOn = !labelsOn;
  labelGroup.visible = labelsOn;
  e.target.classList.toggle('off', !labelsOn);
});
document.getElementById('btn-top').addEventListener('click', () => {
  camera.position.set(CX, 95, CZ + 0.01);
  controls.target.set(CX, 0, CZ);
});
document.getElementById('btn-persp').addEventListener('click', () => {
  camera.position.copy(HOME_POS);
  controls.target.set(CX, 0, CZ);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
