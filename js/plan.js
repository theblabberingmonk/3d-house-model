// ---------------------------------------------------------------------------
// First Floor Plan — ALT-II (interpreted from hand-drawn sketch)
// Units: feet.  Origin: South-West corner of the plot.  +X = East, +Z = North.
//
// This file is the single source of truth for the model. Every wall, room
// floor and label in the 3D view is generated from the data below, so to
// correct a dimension just edit the number here and reload.
//
// Assumptions (flagged honestly — the sketch is hand-drawn):
//  - Plot 47'5" (E-W) x 20'5" (N-S), taken from the dimension strings.
//  - Room rectangles are interior faces; labelled dims kept as the "official"
//    sizes even where the sketch doesn't quite tile (e.g. the two 10'-deep
//    bedrooms are modelled at 9.46' so they fit the 20'5" depth).
//  - Wall height 10 ft; exterior 9", interior 4.5" (typical Indian construction).
//  - "SLAB AT 7'6" HT" is noted on the sketch (likely a stair landing) —
//    not modelled; stairs are a straight 16-riser flight.
//  - Door positions follow the door swings visible on the sketch.
// ---------------------------------------------------------------------------

export const PLAN = {
  plot: { w: 47 + 5 / 12, d: 20 + 5 / 12 }, // 47'5" x 20'5"
  wallHeight: 10,
  extT: 0.75, // 9" exterior walls
  intT: 4.5 / 12, // 4.5" interior walls
  slabT: 0.5,

  // Interior partition walls. gaps[] are door openings: `at` = distance in
  // feet from the wall's start point (x1,z1), `width` = opening width.
  partitions: [
    // Kitchen (SW)
    { x1: 7.75, z1: 0.75, x2: 7.75, z2: 10.25, gaps: [{ at: 4.75, width: 3 }] },
    { x1: 0.75, z1: 10.25, x2: 7.75, z2: 10.25, gaps: [] },
    // Toilet + lift core (west-central)
    { x1: 7.5, z1: 11.0, x2: 7.5, z2: 19.58, gaps: [{ at: 2, width: 2.5 }] },
    { x1: 11.5, z1: 11.0, x2: 11.5, z2: 19.58, gaps: [] },
    { x1: 7.5, z1: 11.0, x2: 11.5, z2: 11.0, gaps: [] },
    { x1: 7.5, z1: 6.75, x2: 7.5, z2: 11.0, gaps: [] },
    { x1: 11.5, z1: 6.75, x2: 11.5, z2: 11.0, gaps: [{ at: 1, width: 2.5 }] },
    { x1: 7.5, z1: 6.75, x2: 11.5, z2: 6.75, gaps: [] },
    // Hall (central) + nook
    { x1: 12.0, z1: 4.0, x2: 12.0, z2: 14.5, gaps: [{ at: 4, width: 3 }] },
    { x1: 24.42, z1: 4.0, x2: 24.42, z2: 14.5, gaps: [{ at: 4, width: 3 }] },
    { x1: 12.0, z1: 4.0, x2: 24.42, z2: 4.0, gaps: [] },
    { x1: 12.0, z1: 14.5, x2: 20.0, z2: 14.5, gaps: [] },
    { x1: 20.0, z1: 14.5, x2: 20.0, z2: 19.67, gaps: [] },
    // W.C. (east-central)
    { x1: 29.5, z1: 8.0, x2: 29.5, z2: 12.0, gaps: [{ at: 1, width: 2.5 }] },
    { x1: 33.5, z1: 8.0, x2: 33.5, z2: 12.0, gaps: [] },
    { x1: 29.5, z1: 8.0, x2: 33.5, z2: 8.0, gaps: [] },
    { x1: 29.5, z1: 12.0, x2: 33.5, z2: 12.0, gaps: [] },
    // Bedrooms (east block)
    { x1: 33.67, z1: 0.75, x2: 33.67, z2: 10.21, gaps: [{ at: 3.75, width: 3 }] },
    { x1: 33.67, z1: 10.21, x2: 46.67, z2: 10.21, gaps: [] },
    { x1: 33.67, z1: 10.21, x2: 33.67, z2: 19.67, gaps: [{ at: 3.25, width: 3 }] },
    // Stair cheek wall (north strip)
    { x1: 20.5, z1: 16.17, x2: 32.5, z2: 16.17, gaps: [] },
  ],

  // Plot perimeter walls (centred on the boundary). Main entrance on west wall.
  perimeter: [
    { x1: 0, z1: 0, x2: 47 + 5 / 12, z2: 0, gaps: [] },
    { x1: 0, z1: 20 + 5 / 12, x2: 47 + 5 / 12, z2: 20 + 5 / 12, gaps: [] },
    { x1: 0, z1: 0, x2: 0, z2: 20 + 5 / 12, gaps: [{ at: 12.25, width: 3 }] },
    { x1: 47 + 5 / 12, z1: 0, x2: 47 + 5 / 12, z2: 20 + 5 / 12, gaps: [] },
  ],

  // Room floor overlays + labels. x/z = SW corner, w/d in feet.
  rooms: [
    { name: 'Kitchen', sub: `7' × 9'6"`, x: 0.75, z: 0.75, w: 7, d: 9.5, color: '#dcfce7' },
    { name: 'Entry Lobby', sub: 'Main entrance', x: 0.75, z: 10.25, w: 6.5, d: 9.42, color: '#ffedd5' },
    { name: 'Toilet', sub: `4' × 8'7"`, x: 7.5, z: 11.0, w: 4, d: 8.58, color: '#f3e8ff' },
    { name: 'Lift', sub: `4' × 4'`, x: 7.5, z: 6.75, w: 4, d: 4, color: '#f1f5f9' },
    { name: 'Hall', sub: `10'6" × 12'5"`, x: 12.0, z: 4.0, w: 12.42, d: 10.5, color: '#fef3c7' },
    { name: 'Hall Nook', sub: `7' × 8'`, x: 12.0, z: 14.5, w: 8, d: 5.17, color: '#fef3c7' },
    { name: 'W.C.', sub: `4' × 4'`, x: 29.5, z: 8.0, w: 4, d: 4, color: '#f3e8ff' },
    { name: 'Bedroom (S)', sub: `10' × 13'`, x: 33.67, z: 0.75, w: 13, d: 9.46, color: '#dbeafe' },
    { name: 'Bedroom (N)', sub: `10' × 13'6"`, x: 33.67, z: 10.21, w: 13, d: 9.46, color: '#dbeafe' },
  ],

  // Straight staircase flight along the north strip, ascending eastward.
  stairs: { x: 20.5, z: 16.17, run: 12, width: 3.5, steps: 16, rise: 10 / 16 },
};
