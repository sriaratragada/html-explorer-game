import { Season } from './gameTypes';

// ── Simplex-like noise (value noise with smoothing) ──
const SEED = 42;

function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263 + SEED) & 0xffffffff;
  h = ((h ^ (h >> 13)) * 1274126177) & 0xffffffff;
  h = ((h ^ (h >> 16)) * 1911520717) & 0xffffffff;
  return (h & 0x7fffffff) / 0x7fffffff;
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const n00 = hash(ix, iy);
  const n10 = hash(ix + 1, iy);
  const n01 = hash(ix, iy + 1);
  const n11 = hash(ix + 1, iy + 1);
  const nx0 = n00 + sx * (n10 - n00);
  const nx1 = n01 + sx * (n11 - n01);
  return nx0 + sy * (nx1 - nx0);
}

function fbm(x: number, y: number, octaves: number = 4): number {
  let val = 0, amp = 1, freq = 1, max = 0;
  for (let i = 0; i < octaves; i++) {
    val += smoothNoise(x * freq, y * freq) * amp;
    max += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return val / max;
}

// ── Tile types ──
export type TileType = 'deep_water' | 'water' | 'sand' | 'grass' | 'forest' | 'dense_forest' | 'hill' | 'mountain' | 'snow' | 'swamp' | 'ruins' | 'road' | 'river' | 'clearing';

export const MAP_W = 800;
export const MAP_H = 800;
export const TILE_SIZE = 5;

// Location coordinates spread across 800x800
export const LOCATION_COORDS: Record<string, { x: number; y: number }> = {
  ashenford:        { x: 350, y: 400 },
  saltmoor:         { x: 120, y: 250 },
  ironhold:         { x: 280, y: 150 },
  thornwick:        { x: 550, y: 450 },
  graygate:         { x: 250, y: 350 },
  dustfall:         { x: 420, y: 200 },
  crossroads:       { x: 320, y: 300 },
  marshend:         { x: 650, y: 550 },
  badlands:         { x: 600, y: 280 },
  coldpeak:         { x: 200, y: 80 },
  ruins_of_aether:  { x: 700, y: 380 },
};

// ── Color palettes per season ──
interface BiomePalette {
  deep_water: string; water: string; sand: string; grass: string;
  forest: string; dense_forest: string; hill: string; mountain: string;
  snow: string; swamp: string; ruins: string; road: string;
  river: string; clearing: string;
}

const PALETTES: Record<Season, BiomePalette> = {
  thaw: {
    deep_water: '#1a3a5c', water: '#2a5a7c', sand: '#c4a86c', grass: '#5a7a4a',
    forest: '#3a5a2a', dense_forest: '#2a4a1a', hill: '#6a6a5a', mountain: '#5a5a5a',
    snow: '#d0d8e0', swamp: '#3a4a3a', ruins: '#5a4a3a', road: '#8a7a5a',
    river: '#3a6a8c', clearing: '#7a9a5a',
  },
  summer: {
    deep_water: '#1a3060', water: '#2a5585', sand: '#d4b87c', grass: '#4a8a3a',
    forest: '#2a6a1a', dense_forest: '#1a5a0a', hill: '#7a7a5a', mountain: '#6a6a6a',
    snow: '#e8e8f0', swamp: '#2a5a2a', ruins: '#6a5a4a', road: '#9a8a5a',
    river: '#2a5a90', clearing: '#6aaa4a',
  },
  harvest: {
    deep_water: '#1a3050', water: '#2a4a6a', sand: '#c4a05a', grass: '#8a7a3a',
    forest: '#6a5a1a', dense_forest: '#5a4a0a', hill: '#7a6a4a', mountain: '#5a5050',
    snow: '#d0c8c0', swamp: '#4a4a2a', ruins: '#5a4030', road: '#8a7040',
    river: '#2a4a70', clearing: '#9a8a3a',
  },
  dark: {
    deep_water: '#0a1a30', water: '#1a3050', sand: '#8a7a5a', grass: '#3a4a3a',
    forest: '#2a3a2a', dense_forest: '#1a2a1a', hill: '#4a4a4a', mountain: '#3a3a3a',
    snow: '#c0c8d8', swamp: '#2a2a2a', ruins: '#3a3028', road: '#5a5040',
    river: '#1a3a60', clearing: '#4a5a3a',
  },
};

// ── Bresenham line ──
function bresenhamLine(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const pts: [number, number][] = [];
  let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    pts.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
  return pts;
}

// ── Location biome influence ──
const LOCATION_BIOME_INFLUENCE: Record<string, { biome: TileType; radius: number }> = {
  ashenford:       { biome: 'grass', radius: 20 },
  saltmoor:        { biome: 'sand', radius: 18 },
  ironhold:        { biome: 'mountain', radius: 20 },
  thornwick:       { biome: 'dense_forest', radius: 22 },
  graygate:        { biome: 'grass', radius: 18 },
  dustfall:        { biome: 'ruins', radius: 16 },
  crossroads:      { biome: 'grass', radius: 14 },
  marshend:        { biome: 'swamp', radius: 22 },
  badlands:        { biome: 'hill', radius: 24 },
  coldpeak:        { biome: 'snow', radius: 20 },
  ruins_of_aether: { biome: 'ruins', radius: 16 },
};

// Connection list for roads
const CONNECTIONS: [string, string][] = [
  ['ashenford', 'thornwick'],
  ['ashenford', 'saltmoor'],
  ['ashenford', 'crossroads'],
  ['saltmoor', 'graygate'],
  ['saltmoor', 'ironhold'],
  ['ironhold', 'coldpeak'],
  ['ironhold', 'crossroads'],
  ['thornwick', 'marshend'],
  ['thornwick', 'ruins_of_aether'],
  ['graygate', 'dustfall'],
  ['graygate', 'crossroads'],
  ['dustfall', 'badlands'],
  ['marshend', 'badlands'],
];

export { CONNECTIONS };

export interface WorldMap {
  tiles: TileType[][];
  roads: Set<string>;
}

function tileKey(x: number, y: number) { return `${x},${y}`; }

export function generateWorldMap(): WorldMap {
  const tiles: TileType[][] = [];
  const roads = new Set<string>();

  // Generate base terrain
  for (let y = 0; y < MAP_H; y++) {
    tiles[y] = [];
    for (let x = 0; x < MAP_W; x++) {
      const elevation = fbm(x * 0.012, y * 0.012, 5);
      const moisture = fbm(x * 0.015 + 100, y * 0.015 + 100, 4);

      let tile: TileType;
      if (elevation < 0.28) tile = 'deep_water';
      else if (elevation < 0.35) tile = 'water';
      else if (elevation < 0.38) tile = 'sand';
      else if (elevation < 0.55) {
        if (moisture > 0.6) tile = 'forest';
        else if (moisture > 0.7) tile = 'swamp';
        else tile = 'grass';
      }
      else if (elevation < 0.65) {
        if (moisture > 0.55) tile = 'dense_forest';
        else tile = 'forest';
      }
      else if (elevation < 0.75) tile = 'hill';
      else if (elevation < 0.85) tile = 'mountain';
      else tile = 'snow';

      tiles[y][x] = tile;
    }
  }

  // Apply location biome influence zones (larger radii for 800x800)
  for (const [locId, influence] of Object.entries(LOCATION_BIOME_INFLUENCE)) {
    const coord = LOCATION_COORDS[locId];
    if (!coord) continue;
    const r = influence.radius;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > r) continue;
        const tx = coord.x + dx;
        const ty = coord.y + dy;
        if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) continue;
        const strength = 1 - dist / r;
        if (hash(tx * 7 + ty * 13, 999) < strength * 0.8) {
          tiles[ty][tx] = influence.biome;
        }
      }
    }
  }

  // Add rivers (meandering water lines)
  const riverStarts = [
    { x: 200, y: 0 },
    { x: 500, y: 0 },
    { x: 0, y: 400 },
    { x: 799, y: 300 },
  ];
  for (const start of riverStarts) {
    let rx = start.x, ry = start.y;
    for (let i = 0; i < 600; i++) {
      if (rx < 0 || rx >= MAP_W || ry < 0 || ry >= MAP_H) break;
      tiles[ry][rx] = 'river';
      if (rx + 1 < MAP_W) tiles[ry][rx + 1] = 'river';
      // Meander
      const drift = hash(rx + i * 31, ry + i * 17);
      if (drift < 0.3) rx--;
      else if (drift < 0.6) rx++;
      ry += start.y === 0 ? 1 : (start.x === 0 ? 0 : -1);
      if (start.x === 0) rx++;
      if (start.x === 799) rx--;
    }
  }

  // Add coastal water near saltmoor
  const sm = LOCATION_COORDS.saltmoor;
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < 60; x++) {
      const dist = Math.sqrt((x - sm.x) ** 2 + (y - sm.y) ** 2);
      if (x < 25 || (x < 45 && dist < 80)) {
        tiles[y][x] = x < 15 ? 'deep_water' : 'water';
      }
    }
  }

  // Scatter clearings
  for (let i = 0; i < 50; i++) {
    const cx = Math.floor(hash(i * 37, 1234) * MAP_W);
    const cy = Math.floor(hash(i * 53, 5678) * MAP_H);
    const r = 3 + Math.floor(hash(i, 9999) * 5);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const tx = cx + dx, ty = cy + dy;
        if (tx >= 0 && tx < MAP_W && ty >= 0 && ty < MAP_H) {
          if (Math.sqrt(dx * dx + dy * dy) <= r && (tiles[ty][tx] === 'forest' || tiles[ty][tx] === 'dense_forest' || tiles[ty][tx] === 'grass')) {
            tiles[ty][tx] = 'clearing';
          }
        }
      }
    }
  }

  // Generate roads between connected locations
  for (const [a, b] of CONNECTIONS) {
    const ca = LOCATION_COORDS[a];
    const cb = LOCATION_COORDS[b];
    if (!ca || !cb) continue;
    const pts = bresenhamLine(ca.x, ca.y, cb.x, cb.y);
    for (const [px, py] of pts) {
      if (px >= 0 && px < MAP_W && py >= 0 && py < MAP_H) {
        roads.add(tileKey(px, py));
        if (hash(px, py) > 0.3 && py + 1 < MAP_H) roads.add(tileKey(px, py + 1));
        if (hash(px + 1, py) > 0.5 && px + 1 < MAP_W) roads.add(tileKey(px + 1, py));
      }
    }
  }

  return { tiles, roads };
}

export function getTileColor(tile: TileType, season: Season): string {
  return PALETTES[season][tile];
}

export function getRoadColor(season: Season): string {
  return PALETTES[season].road;
}

export function isWalkable(tile: TileType): boolean {
  return tile !== 'deep_water' && tile !== 'water' && tile !== 'mountain';
}
