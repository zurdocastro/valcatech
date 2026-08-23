// Geometry for the hero's operations graph. Kept separate from the component so
// it can be tested without pulling GSAP into the test environment.

export const VB = { x: 12, y: 46, w: 576, h: 424 };
export const CORE = { x: 300, y: 258, w: 156, h: 60 };
export const NODE = { w: 128, h: 48 };

// Six systems, three per side. The shape is the argument: whatever a business
// already runs on, we sit in the middle and wire it together.
export const POS = [
  { x: 88, y: 84 },
  { x: 512, y: 84 },
  { x: 88, y: 258 },
  { x: 512, y: 258 },
  { x: 88, y: 432 },
  { x: 512, y: 432 },
];

/** Which face of a node and of the core an edge should leave from. */
export function ports(nx: number, ny: number) {
  const fromRight = nx > CORE.x;
  return {
    fromRight,
    sx: nx + (fromRight ? -NODE.w / 2 : NODE.w / 2),
    sy: ny,
    ex: CORE.x + (fromRight ? CORE.w / 2 : -CORE.w / 2),
    ey: CORE.y,
  };
}

/**
 * Node-editor connector: control points leave each endpoint horizontally, which
 * is what makes the curve read as wiring rather than as decoration.
 */
export function edgePath(nx: number, ny: number) {
  const { fromRight, sx, sy, ex, ey } = ports(nx, ny);
  const k = Math.max(44, Math.abs(ex - sx) * 0.55);
  const c1x = sx + (fromRight ? -k : k);
  const c2x = ex + (fromRight ? k : -k);
  return `M ${sx} ${sy} C ${c1x} ${sy}, ${c2x} ${ey}, ${ex} ${ey}`;
}
