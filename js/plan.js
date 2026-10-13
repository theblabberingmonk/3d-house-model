// ---------------------------------------------------------------------------
// Building plan — Ground (garage) + First Floor (ALT-II, from hand sketch)
// Units: feet. Origin: South-West corner. +X = East, +Z = North.
//
// Plot is 20'5" (E-W, short) x 47'5" (N-S, long). It sits BETWEEN neighbour
// plots, so the LONG east/west walls are blind party walls and the road
// touches the NORTH short side only. South is the rear.
// The room layout below is the ALT-II sketch rotated to this orientation
// (mapped from the original sketch coordinates, N-flipped so the entrance
// faces the north road).
// ---------------------------------------------------------------------------

const OW = 47 + 5 / 12; // sketch long axis
const OD = 20 + 5 / 12; // sketch short axis
const W = 20 + 5 / 12; // plot E-W (short, road side)
const D = 47 + 5 / 12; // plot N-S (long, neighbours E+W)

// --- original sketch interpretation (long axis = X). Do not edit directly;
// --- everything is mapped below into plot orientation.
const OLD_PARTITIONS = [
  { x1: 7.75, z1: 0.75, x2: 7.75, z2: 10.25, gaps: [{ at: 4.75, width: 3 }] },
  { x1: 0.75, z1: 10.25, x2: 7.75, z2: 10.25, gaps: [] },
  { x1: 7.5, z1: 11.0, x2: 7.5, z2: 19.58, gaps: [{ at: 2, width: 2.5 }] },
  { x1: 11.5, z1: 11.0, x2: 11.5, z2: 19.58, gaps: [] },
  { x1: 7.5, z1: 11.0, x2: 11.5, z2: 11.0, gaps: [] },
  { x1: 7.5, z1: 6.75, x2: 7.5, z2: 11.0, gaps: [] },
  { x1: 11.5, z1: 6.75, x2: 11.5, z2: 11.0, gaps: [{ at: 1, width: 2.5 }] },
  { x1: 7.5, z1: 6.75, x2: 11.5, z2: 6.75, gaps: [] },
  { x1: 12.0, z1: 4.0, x2: 12.0, z2: 14.5, gaps: [{ at: 4, width: 3 }] },
  { x1: 24.42, z1: 4.0, x2: 24.42, z2: 14.5, gaps: [{ at: 4, width: 3 }] },
  { x1: 12.0, z1: 4.0, x2: 24.42, z2: 4.0, gaps: [] },
  { x1: 12.0, z1: 14.5, x2: 20.0, z2: 14.5, gaps: [] },
  { x1: 20.0, z1: 14.5, x2: 20.0, z2: 19.67, gaps: [] },
  { x1: 29.5, z1: 8.0, x2: 29.5, z2: 12.0, gaps: [{ at: 1, width: 2.5 }] },
  { x1: 33.5, z1: 8.0, x2: 33.5, z2: 12.0, gaps: [] },
  { x1: 29.5, z1: 8.0, x2: 33.5, z2: 8.0, gaps: [] },
  { x1: 29.5, z1: 12.0, x2: 33.5, z2: 12.0, gaps: [] },
  { x1: 33.67, z1: 0.75, x2: 33.67, z2: 10.21, gaps: [{ at: 3.75, width: 3 }] },
  { x1: 33.67, z1: 10.21, x2: 46.67, z2: 10.21, gaps: [] },
  { x1: 33.67, z1: 10.21, x2: 33.67, z2: 19.67, gaps: [{ at: 3.25, width: 3 }] },
  { x1: 20.5, z1: 16.17, x2: 32.5, z2: 16.17, gaps: [] },
];

const OLD_ROOMS = [
  { name: 'Kitchen', sub: `7' x 9'6"`, x: 0.75, z: 0.75, w: 7, d: 9.5, color: '#dcfce7', floor: 'kitchen' },
  { name: 'Entry Lobby', sub: 'Main entrance', x: 0.75, z: 10.25, w: 6.5, d: 9.42, color: '#ffedd5', floor: 'marble' },
  { name: 'Toilet', sub: `4' x 8'7"`, x: 7.5, z: 11.0, w: 4, d: 8.58, color: '#f3e8ff', floor: 'bath' },
  { name: 'Lift', sub: `4' x 4'`, x: 7.5, z: 6.75, w: 4, d: 4, color: '#f1f5f9', floor: 'concrete' },
  { name: 'Hall', sub: `10'6" x 12'5"`, x: 12.0, z: 4.0, w: 12.42, d: 10.5, color: '#fef3c7', floor: 'marble' },
  { name: 'Hall Nook', sub: `7' x 8'`, x: 12.0, z: 14.5, w: 8, d: 5.17, color: '#fef3c7', floor: 'marble' },
  { name: 'W.C.', sub: `4' x 4'`, x: 29.5, z: 8.0, w: 4, d: 4, color: '#f3e8ff', floor: 'bath' },
  { name: 'Bedroom (S)', sub: `10' x 13'`, x: 33.67, z: 0.75, w: 13, d: 9.46, color: '#dbeafe', floor: 'wood' },
  { name: 'Bedroom (N)', sub: `10' x 13'6"`, x: 33.67, z: 10.21, w: 13, d: 9.46, color: '#dbeafe', floor: 'wood' },
];

// Map (x,z) -> (z, D-x): 90 deg rotation + N-S flip so entrance faces north road.
// Gaps are measured from the wall's minimum-coordinate end (see buildWall).
function TWall(w) {
  const A = { x: w.z1, z: D - w.x1 };
  const B = { x: w.z2, z: D - w.x2 };
  const len = Math.hypot(B.x - A.x, B.z - A.z);
  const newHoriz = Math.abs(A.z - B.z) < 1e-9;
  const aIsMin = newHoriz ? A.x <= B.x : A.z <= B.z;
  const gaps = (w.gaps || []).map((g) =>
    aIsMin ? { at: g.at, width: g.width } : { at: len - g.at - g.width, width: g.width },
  );
  return { x1: A.x, z1: A.z, x2: B.x, z2: B.z, gaps };
}

function TRoom(r) {
  return { ...r, x: r.z, z: D - r.x - r.w, w: r.d, d: r.w };
}

const FIRST_PARTITIONS = OLD_PARTITIONS.map(TWall);
const FIRST_ROOMS = OLD_ROOMS.map(TRoom);

// Staircase: old run along +X becomes run along Z, ascending southward (-Z).
const OLD_STAIRS = { x: 20.5, z: 16.17, run: 12, width: 3.5, steps: 17, rise: 10 / 17 };
const STAIRS = {
  x: OLD_STAIRS.z,
  z: D - OLD_STAIRS.x - OLD_STAIRS.run,
  run: OLD_STAIRS.run,
  width: OLD_STAIRS.width,
  steps: 17,
  rise: 10 / 17,
  dir: '-z',
};

// First-floor perimeter: blind party walls E/W, rear S solid, road-facing N
// carries the main entrance (mapped from sketch position).
const FIRST_PERIMETER = [
  { x1: 0, z1: 0, x2: W, z2: 0, gaps: [] }, // south (rear)
  { x1: 0, z1: D, x2: W, z2: D, gaps: [{ at: 12.25, width: 3 }] }, // north (road)
  { x1: 0, z1: 0, x2: 0, z2: D, gaps: [] }, // west (neighbour)
  { x1: W, z1: 0, x2: W, z2: D, gaps: [] }, // east (neighbour)
];

// Windows only on road (N) + rear (S) faces. Party walls E/W are blind.
const FIRST_WINDOWS = [
  { wall: 'north', at: 2, width: 3 },
  { wall: 'north', at: 16.5, width: 3 },
  { wall: 'south', at: 2.5, width: 4 },
  { wall: 'south', at: 13, width: 4 },
];

// Ground floor: completely open garage. Only the lift shaft + staircase run
// down; everything else is clear for cars.
const LIFT_OLD = [
  { x1: 7.5, z1: 6.75, x2: 7.5, z2: 11.0, gaps: [] },
  { x1: 11.5, z1: 6.75, x2: 11.5, z2: 11.0, gaps: [{ at: 1, width: 2.5 }] },
  { x1: 7.5, z1: 6.75, x2: 11.5, z2: 6.75, gaps: [] },
  { x1: 7.5, z1: 11.0, x2: 11.5, z2: 11.0, gaps: [] },
];
const GATE_W = 10;
const GATE_AT = (W - GATE_W) / 2;
const GROUND_PERIMETER = [
  { x1: 0, z1: 0, x2: W, z2: 0, gaps: [] }, // south (rear)
  { x1: 0, z1: D, x2: W, z2: D, gaps: [{ at: GATE_AT, width: GATE_W, oh: 8.5 }] }, // north gate
  { x1: 0, z1: 0, x2: 0, z2: D, gaps: [] }, // west (neighbour)
  { x1: W, z1: 0, x2: W, z2: D, gaps: [] }, // east (neighbour)
];

const GROUND_PARTITIONS = LIFT_OLD.map(TWall);

const GROUND_ROOMS = [
  { name: 'Garage', sub: 'Open parking', x: 0.75, z: 0.75, w: W - 1.5, d: D - 1.5, color: '#e2e8f0', floor: 'parking' },
  { name: 'Lift', sub: `4' x 4'`, x: 6.75, z: D - 11.5, w: 4, d: 4, color: '#f1f5f9', floor: 'concrete' },
];

const COLUMNS = [];
for (const cx of [0.375, W / 2, W - 0.375]) {
  for (const cz of [0.375, 16, 32, D - 0.375]) {
    COLUMNS.push({ x: cx, z: cz });
  }
}

export const PLAN = {
  plot: { w: W, d: D },
  roadSide: 'north',
  wallHeight: 10,
  groundHeight: 10,
  firstHeight: 10,
  extT: 0.75,
  intT: 4.5 / 12,
  slabT: 0.6,
  parapetH: 3,

  partitions: FIRST_PARTITIONS,
  perimeter: FIRST_PERIMETER,
  rooms: FIRST_ROOMS,
  stairs: STAIRS,

  ground: {
    y0: 0,
    partitions: GROUND_PARTITIONS,
    perimeter: GROUND_PERIMETER,
    rooms: GROUND_ROOMS,
    stairs: { ...STAIRS },
    gate: { at: GATE_AT, width: GATE_W },
  },
  first: {
    y0: 10.6,
    partitions: FIRST_PARTITIONS,
    perimeter: FIRST_PERIMETER,
    rooms: FIRST_ROOMS,
    stairs: { ...STAIRS },
    windows: FIRST_WINDOWS,
  },
  columns: COLUMNS,
  // painted bay outlines only (garage stays empty)
  parkingSpots: [
    { x: 1.5, z: 3, w: 8, d: 16, label: 'P1' },
    { x: 1.5, z: 20, w: 8, d: 16, label: 'P2' },
  ],
};
