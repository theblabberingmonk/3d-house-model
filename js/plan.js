// ---------------------------------------------------------------------------
// Building plan — Ground + First Floor (ALT-II, interpreted from hand sketch)
// Units: feet. Origin: South-West corner. +X = East, +Z = North.
// ---------------------------------------------------------------------------

const W = 47 + 5 / 12; // 47'5" E-W
const D = 20 + 5 / 12; // 20'5" N-S

// First-floor partitions/rooms as interpreted before (kept verbatim).
const FIRST_PARTITIONS = [
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

const FIRST_PERIMETER = [
  { x1: 0, z1: 0, x2: W, z2: 0, gaps: [] },
  { x1: 0, z1: D, x2: W, z2: D, gaps: [] },
  { x1: 0, z1: 0, x2: 0, z2: D, gaps: [{ at: 12.25, width: 3 }] },
  { x1: W, z1: 0, x2: W, z2: D, gaps: [] },
];

const FIRST_ROOMS = [
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

// Ground floor: open parking + entry. Lift/stair core aligns with first floor.
const GROUND_PERIMETER = [
  { x1: 0, z1: 0, x2: W, z2: 0, gaps: [] }, // south
  { x1: 0, z1: D, x2: W, z2: D, gaps: [{ at: 18, width: 12 }] }, // north car gate
  { x1: 0, z1: 0, x2: 0, z2: D, gaps: [{ at: 12.25, width: 3.5 }] }, // west pedestrian
  { x1: W, z1: 0, x2: W, z2: D, gaps: [] }, // east
];

const GROUND_PARTITIONS = [
  // Lift shaft (same footprint so lift runs continuously)
  { x1: 7.5, z1: 6.75, x2: 7.5, z2: 11.0, gaps: [] },
  { x1: 11.5, z1: 6.75, x2: 11.5, z2: 11.0, gaps: [{ at: 1, width: 2.5 }] },
  { x1: 7.5, z1: 6.75, x2: 11.5, z2: 6.75, gaps: [] },
  { x1: 7.5, z1: 11.0, x2: 11.5, z2: 11.0, gaps: [] },
  // Entry lobby north wall (security / lobby enclosure)
  { x1: 0.75, z1: 10.25, x2: 7.5, z2: 10.25, gaps: [{ at: 2, width: 3 }] },
  // Stair enclosure side walls
  { x1: 20.5, z1: 12.5, x2: 20.5, z2: 19.67, gaps: [] },
  { x1: 32.5, z1: 12.5, x2: 32.5, z2: 19.67, gaps: [{ at: 1, width: 3 }] },
];

const GROUND_ROOMS = [
  { name: 'Parking', sub: '4 cars + drive', x: 11.5, z: 0.75, w: 35.17, d: 14.5, color: '#e2e8f0', floor: 'parking' },
  { name: 'Entry Lobby', sub: 'Ground entry', x: 0.75, z: 10.25, w: 6.75, d: 9.42, color: '#ffedd5', floor: 'marble' },
  { name: 'Lift', sub: `4' x 4'`, x: 7.5, z: 6.75, w: 4, d: 4, color: '#f1f5f9', floor: 'concrete' },
  { name: 'Driveway', sub: 'Gate to parking', x: 18, z: 15.25, w: 12, d: 4.42, color: '#cbd5e1', floor: 'asphalt' },
];

const COLUMNS = [];
for (const cx of [0.375, 12, 24.42, 33.67, W - 0.375]) {
  for (const cz of [0.375, D - 0.375]) {
    COLUMNS.push({ x: cx, z: cz });
  }
}
COLUMNS.push({ x: 12, z: 10.25 }, { x: 24.42, z: 10.25 }, { x: 33.67, z: 10.21 });

export const PLAN = {
  plot: { w: W, d: D },
  wallHeight: 10,
  groundHeight: 10,
  firstHeight: 10,
  extT: 0.75,
  intT: 4.5 / 12,
  slabT: 0.6,
  parapetH: 3,

  // kept for backwards compat = first floor
  partitions: FIRST_PARTITIONS,
  perimeter: FIRST_PERIMETER,
  rooms: FIRST_ROOMS,
  stairs: { x: 20.5, z: 16.17, run: 12, width: 3.5, steps: 16, rise: 10 / 16 },

  ground: {
    y0: 0,
    partitions: GROUND_PARTITIONS,
    perimeter: GROUND_PERIMETER,
    rooms: GROUND_ROOMS,
    // ground->first stair: same run, starts at ground
    stairs: { x: 20.5, z: 16.17, run: 12, width: 3.5, steps: 17, rise: 10 / 17 },
  },
  first: {
    // top of ground slab
    y0: 10.6,
    partitions: FIRST_PARTITIONS,
    perimeter: FIRST_PERIMETER,
    rooms: FIRST_ROOMS,
    stairs: { x: 20.5, z: 16.17, run: 12, width: 3.5, steps: 16, rise: 10 / 16 },
    // decorative windows on outer face (position along wall, sill 3', height 4')
    windows: [
      { wall: 'south', at: 3, width: 4 }, { wall: 'south', at: 26, width: 5 },
      { wall: 'south', at: 38, width: 5 },
      { wall: 'north', at: 8, width: 4 }, { wall: 'north', at: 36, width: 5 },
      { wall: 'east', at: 3, width: 4 }, { wall: 'east', at: 13, width: 4 },
      { wall: 'west', at: 2, width: 3 },
    ],
  },
  columns: COLUMNS,
  // simple car spots inside parking room (x,z = SW corner, angle 0 = facing north)
  parkingSpots: [
    { x: 14, z: 2, w: 8, d: 16, label: 'P1' },
    { x: 22.5, z: 2, w: 8, d: 16, label: 'P2' },
    { x: 31, z: 2, w: 8, d: 16, label: 'P3' },
  ],
};
