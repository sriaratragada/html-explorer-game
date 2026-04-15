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
  let val = 0;
  let amp = 1;
  let freq = 1;
  let max = 0;
  for (let i = 0; i < octaves; i++) {
    val += smoothNoise(x * freq, y * freq) * amp;
    max += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return val / max;
}

// ── Tile types ──
export type TileType = 'deep_water' | 'water' | 'sand' | 'grass' | 'forest' | 'dense_forest' | 'hill' | 'mountain' | 'snow' | 'swamp' | 'ruins' | 'road';

export const MAP_W = 200;
export const MAP_H = 150;
export const TILE_SIZE = 5;

// Location map coordinates (hand-placed to match world layout)
export const LOCATION_COORDS: Record<string, { x: number; y: number }> = {
  ashenford:        { x: 80,  y: 75 },
  saltmoor:         { x: 35,  y: 45 },
  ironhold:         { x: 60,  y: 30 },
  thornwick:        { x: 120, y: 85 },
  graygate:         { x: 55,  y: 60 },
  dustfall:         { x: 90,  y: 40 },
  crossroads:       { x: 70,  y: 55 },
  marshend:         { x: 150, y: 100 },
  badlands:         { x: 135, y: 55 },
  coldpeak:         { x: 45,  y: 15 },
  ruins_of_aether:  { x: 160, y: 75 },
};

// ── Color palettes per season ──
interface BiomePalette {
  deep_water: string;
  water: string;
  sand: string;
  grass: string;
  forest: string;
  dense_forest: string;
  hill: string;
  mountain: string;
  snow: string;
  swamp: string;
  ruins: string;
  road: string;
}

const PALETTES: Record<Season, BiomePalette> = {
  thaw: {
    deep_water: '#1a3a5c',
    water: '#2a5a7c',
    sand: '#c4a86c',
    grass: '#5a7a4a',
    forest: '#3a5a2a',
    dense_forest: '#2a4a1a',
    hill: '#6a6a5a',
    mountain: '#5a5a5a',
    snow: '#d0d8e0',
    swamp: '#3a4a3a',
    ruins: '#5a4a3a',
    road: '#8a7a5a',
  },
  summer: {
    deep_water: '#1a3060',
    water: '#2a5585',
    sand: '#d4b87c',
    grass: '#4a8a3a',
    forest: '#2a6a1a',
    dense_forest: '#1a5a0a',
    hill: '#7a7a5a',
    mountain: '#6a6a6a',
    snow: '#e8e8f0',
    swamp: '#2a5a2a',
    ruins: '#6a5a4a',
    road: '#9a8a5a',
  },
  harvest: {
    deep_water: '#1a3050',
    water: '#2a4a6a',
    sand: '#c4a05a',
    grass: '#8a7a3a',
    forest: '#6a5a1a',
    dense_forest: '#5a4a0a',
    hill: '#7a6a4a',
    mountain: '#5a5050',
    snow: '#d0c8c0',
    swamp: '#4a4a2a',
    ruins: '#5a4030',
    road: '#8a7040',
  },
  dark: {
    deep_water: '#0a1a30',
    water: '#1a3050',
    sand: '#8a7a5a',
    grass: '#3a4a3a',
    forest: '#2a3a2a',
    dense_forest: '#1a2a1a',
    hill: '#4a4a4a',
    mountain: '#3a3a3a',
    snow: '#c0c8d8',
    swamp: '#2a2a2a',
    ruins: '#3a3028',
    road: '#5a5040',
  },
};

// ── Road / path generation (Bresenham line) ──
function bresenhamLine(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const pts: [number, number][] = [];
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
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

// ── Biome influence zones around locations ──
const LOCATION_BIOME_INFLUENCE: Record<string, { biome: TileType; radius: number }> = {
  ashenford:       { biome: 'grass', radius: 8 },
  saltmoor:        { biome: 'sand', radius: 6 },
  ironhold:        { biome: 'mountain', radius: 7 },
  thornwick:       { biome: 'dense_forest', radius: 8 },
  graygate:        { biome: 'grass', radius: 6 },
  dustfall:        { biome: 'ruins', radius: 6 },
  crossroads:      { biome: 'grass', radius: 5 },
  marshend:        { biome: 'swamp', radius: 8 },
  badlands:        { biome: 'hill', radius: 8 },
  coldpeak:        { biome: 'snow', radius: 7 },
  ruins_of_aether: { biome: 'ruins', radius: 6 },
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
      const elevation = fbm(x * 0.03, y * 0.03, 5);
      const moisture = fbm(x * 0.04 + 100, y * 0.04 + 100, 4);

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

  // Apply location biome influence zones
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
        // Stronger influence near center
        const strength = 1 - dist / r;
        if (Math.random() < strength * 0.8) {
          tiles[ty][tx] = influence.biome;
        }
      }
    }
  }

  // Add coastal water near saltmoor
  const sm = LOCATION_COORDS.saltmoor;
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < 20; x++) {
      const dist = Math.sqrt((x - sm.x) ** 2 + (y - sm.y) ** 2);
      if (x < 8 || (x < 15 && dist < 25)) {
        tiles[y][x] = x < 5 ? 'deep_water' : 'water';
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
        // Make road 2 tiles wide in places
        if (hash(px, py) > 0.4 && py + 1 < MAP_H) roads.add(tileKey(px, py + 1));
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
