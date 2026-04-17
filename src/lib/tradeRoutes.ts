import { TRADE_CONNECTIONS, LOCATION_COORDS, MAP_W, MAP_H } from './mapGenerator';

export interface RouteWaypoint {
  x: number;
  y: number;
}

function bresenhamLine(x0: number, y0: number, x1: number, y1: number): RouteWaypoint[] {
  const pts: RouteWaypoint[] = [];
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0;
  let y = y0;
  for (;;) {
    pts.push({ x, y });
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
  return pts;
}

export function buildRoutePolyline(fromLoc: string, toLoc: string): RouteWaypoint[] {
  const a = LOCATION_COORDS[fromLoc];
  const b = LOCATION_COORDS[toLoc];
  if (!a || !b) return [];
  return bresenhamLine(a.x, a.y, b.x, b.y).filter(p => p.x >= 0 && p.x < MAP_W && p.y >= 0 && p.y < MAP_H);
}

const CARGO_TAGS = ['salt', 'silk', 'spice', 'grain', 'iron', 'cloth', 'leather', 'wine'] as const;

function hash(seed: number, i: number): number {
  let h = (seed * 374761393 + i * 668265263) & 0xffffffff;
  h = ((h ^ (h >> 13)) * 1274126177) & 0xffffffff;
  return (h & 0x7fffffff) / 0x7fffffff;
}

export interface CaravanRunSpec {
  origin: string;
  dest: string;
  waypoints: RouteWaypoint[];
  cargo: string;
}

/** Deterministic caravan runs along declared trade edges. */
export function buildCaravanRuns(seed: number, maxRuns: number): CaravanRunSpec[] {
  const runs: CaravanRunSpec[] = [];
  const edges = TRADE_CONNECTIONS.filter(([from, to]) => LOCATION_COORDS[from] && LOCATION_COORDS[to]);
  if (edges.length === 0) return runs;
  for (let i = 0; i < maxRuns; i++) {
    const [from, to] = edges[Math.floor(hash(seed, i * 17) * edges.length)]!;
    const rev = hash(seed, i * 31 + 3) > 0.5;
    const origin = rev ? to : from;
    const dest = rev ? from : to;
    const waypoints = buildRoutePolyline(origin, dest);
    if (waypoints.length < 8) continue;
    const cargo = CARGO_TAGS[Math.floor(hash(seed, i * 59) * CARGO_TAGS.length)]!;
    runs.push({ origin, dest, waypoints, cargo });
  }
  return runs;
}
