import { Season } from './gameTypes';

// ── Value noise ────────────────────────────────────────────────────────────
let SEED = 42;
export function setSeed(s: number) { SEED = s; chunkCache.clear(); _roadSet = null; }

function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263 + SEED) & 0xffffffff;
  h = ((h ^ (h >> 13)) * 1274126177) & 0xffffffff;
  h = ((h ^ (h >> 16)) * 1911520717) & 0xffffffff;
  return (h & 0x7fffffff) / 0x7fffffff;
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const n00 = hash(ix, iy), n10 = hash(ix + 1, iy);
  const n01 = hash(ix, iy + 1), n11 = hash(ix + 1, iy + 1);
  return n00 + sx * (n10 - n00) + sy * ((n01 + sx * (n11 - n01)) - (n00 + sx * (n10 - n00)));
}

function fbm(x: number, y: number, octaves = 5): number {
  let val = 0, amp = 1, freq = 1, max = 0;
  for (let i = 0; i < octaves; i++) {
    val += smoothNoise(x * freq, y * freq) * amp;
    max += amp; amp *= 0.5; freq *= 2;
  }
  return val / max;
}

// ── Tile types ─────────────────────────────────────────────────────────────
export type TileType =
  | 'deep_water' | 'water' | 'sand' | 'grass' | 'forest'
  | 'dense_forest' | 'hill' | 'mountain' | 'snow' | 'swamp'
  | 'ruins' | 'road' | 'river' | 'clearing' | 'farm_field';

const T = {
  DEEP_WATER: 0, WATER: 1, SAND: 2, GRASS: 3, FOREST: 4,
  DENSE_FOREST: 5, HILL: 6, MOUNTAIN: 7, SNOW: 8, SWAMP: 9,
  RUINS: 10, ROAD: 11, RIVER: 12, CLEARING: 13, FARM_FIELD: 14,
} as const;

export const TILE_NAMES: TileType[] = [
  'deep_water', 'water', 'sand', 'grass', 'forest',
  'dense_forest', 'hill', 'mountain', 'snow', 'swamp',
  'ruins', 'road', 'river', 'clearing', 'farm_field',
];

// ── Map constants ──────────────────────────────────────────────────────────
export const MAP_W = 10000;
export const MAP_H = 10000;
export const TILE_SIZE = 5;
export const CHUNK_SIZE = 64;
export const NUM_CHUNKS_X = Math.ceil(MAP_W / CHUNK_SIZE);
export const NUM_CHUNKS_Y = Math.ceil(MAP_H / CHUNK_SIZE);

// ── Continents ─────────────────────────────────────────────────────────────
export type ContinentId = 'auredia' | 'trivalen' | 'uloren';

interface ContinentDef {
  id: ContinentId;
  cx: number; cy: number;
  rx: number; ry: number;
}

const CONTINENTS: ContinentDef[] = [
  { id: 'auredia',  cx: 2100, cy: 4800, rx: 1650, ry: 3600 },
  { id: 'trivalen', cx: 6000, cy: 4800, rx: 1500, ry: 3600 },
  { id: 'uloren',   cx: 9000, cy: 5000, rx: 850,  ry: 4200 },
];

function continentStrength(x: number, y: number, c: ContinentDef): number {
  const dx = (x - c.cx) / c.rx;
  const dy = (y - c.cy) / c.ry;
  const ellipse = dx * dx + dy * dy;
  const coast = fbm(x * 0.003 + c.cx * 0.17, y * 0.003 + c.cy * 0.17, 4) * 0.35;
  return 1 - ellipse + coast;
}

export function getContinentAt(x: number, y: number): ContinentId | null {
  for (const c of CONTINENTS) {
    if (continentStrength(x, y, c) > 0.02) return c.id;
  }
  return null;
}

// ── Settlements ────────────────────────────────────────────────────────────
export interface SettlementMeta {
  continent: ContinentId;
  kingdom: string;
  type: 'village' | 'town' | 'city' | 'fortress' | 'ruins' | 'port' | 'capital' | 'wilderness' | 'inn';
  biomeCode: number;
  biomeRadius: number;
}

const SETTLEMENTS: Record<string, { x: number; y: number } & SettlementMeta> = {
  // ── Auredia (Grand Kingdom) ──
  highmarch:     { x: 2200, y: 4500, continent: 'auredia', kingdom: 'auredia_crown', type: 'capital',  biomeCode: T.GRASS, biomeRadius: 70 },
  ashenford:     { x: 1200, y: 3500, continent: 'auredia', kingdom: 'auredia_crown', type: 'village',  biomeCode: T.GRASS, biomeRadius: 55 },
  saltmoor:      { x: 700,  y: 5500, continent: 'auredia', kingdom: 'auredia_crown', type: 'port',     biomeCode: T.SAND,  biomeRadius: 50 },
  ironhold:      { x: 1800, y: 2000, continent: 'auredia', kingdom: 'auredia_crown', type: 'fortress', biomeCode: T.MOUNTAIN, biomeRadius: 55 },
  thornwick:     { x: 2800, y: 5800, continent: 'auredia', kingdom: 'auredia_crown', type: 'village',  biomeCode: T.DENSE_FOREST, biomeRadius: 60 },
  graygate:      { x: 1600, y: 6200, continent: 'auredia', kingdom: 'auredia_crown', type: 'city',     biomeCode: T.GRASS, biomeRadius: 50 },
  crossroads:    { x: 2000, y: 3000, continent: 'auredia', kingdom: 'auredia_crown', type: 'inn',      biomeCode: T.GRASS, biomeRadius: 40 },
  coldpeak:      { x: 1000, y: 1500, continent: 'auredia', kingdom: 'auredia_crown', type: 'fortress', biomeCode: T.SNOW,  biomeRadius: 55 },
  millhaven:     { x: 2600, y: 4000, continent: 'auredia', kingdom: 'auredia_crown', type: 'village',  biomeCode: T.GRASS, biomeRadius: 45 },
  brightwater:   { x: 3200, y: 3200, continent: 'auredia', kingdom: 'auredia_crown', type: 'town',     biomeCode: T.GRASS, biomeRadius: 50 },
  oakshire:      { x: 1400, y: 7500, continent: 'auredia', kingdom: 'auredia_crown', type: 'village',  biomeCode: T.FOREST, biomeRadius: 45 },
  goldcrest:     { x: 3000, y: 6800, continent: 'auredia', kingdom: 'auredia_crown', type: 'fortress', biomeCode: T.HILL, biomeRadius: 50 },

  // ── Trivalen — Korrath (north mountains) ──
  korrath_citadel: { x: 5500, y: 2200, continent: 'trivalen', kingdom: 'korrath', type: 'capital',  biomeCode: T.MOUNTAIN, biomeRadius: 60 },
  frostmarch:      { x: 5000, y: 1500, continent: 'trivalen', kingdom: 'korrath', type: 'fortress', biomeCode: T.SNOW, biomeRadius: 50 },
  deepmine:        { x: 6200, y: 1800, continent: 'trivalen', kingdom: 'korrath', type: 'village',  biomeCode: T.HILL, biomeRadius: 45 },

  // ── Trivalen — Vell (south coast) ──
  vell_harbor:  { x: 5200, y: 7500, continent: 'trivalen', kingdom: 'vell', type: 'capital', biomeCode: T.SAND, biomeRadius: 55 },
  sunfield:     { x: 5800, y: 7000, continent: 'trivalen', kingdom: 'vell', type: 'village', biomeCode: T.GRASS, biomeRadius: 45 },
  coral_cove:   { x: 4800, y: 8000, continent: 'trivalen', kingdom: 'vell', type: 'port',    biomeCode: T.SAND, biomeRadius: 40 },

  // ── Trivalen — Sarnak (east steppe) ──
  sarnak_hold:  { x: 7000, y: 4500, continent: 'trivalen', kingdom: 'sarnak', type: 'capital',  biomeCode: T.GRASS, biomeRadius: 55 },
  windridge:    { x: 7200, y: 3000, continent: 'trivalen', kingdom: 'sarnak', type: 'fortress', biomeCode: T.HILL, biomeRadius: 50 },
  dustplain:    { x: 6800, y: 5500, continent: 'trivalen', kingdom: 'sarnak', type: 'village',  biomeCode: T.GRASS, biomeRadius: 40 },

  // ── Trivalen — contested ──
  dustfall:  { x: 6000, y: 4800, continent: 'trivalen', kingdom: 'contested', type: 'ruins',      biomeCode: T.RUINS, biomeRadius: 45 },
  marshend:  { x: 5200, y: 5200, continent: 'trivalen', kingdom: 'contested', type: 'village',    biomeCode: T.SWAMP, biomeRadius: 50 },
  badlands:  { x: 6500, y: 6000, continent: 'trivalen', kingdom: 'contested', type: 'wilderness', biomeCode: T.HILL, biomeRadius: 60 },

  // ── Uloren (unexplored) ──
  mistwood:       { x: 8600, y: 4000, continent: 'uloren', kingdom: 'unknown', type: 'village',  biomeCode: T.DENSE_FOREST, biomeRadius: 35 },
  ruins_of_aether:{ x: 9200, y: 5500, continent: 'uloren', kingdom: 'unknown', type: 'ruins',    biomeCode: T.RUINS, biomeRadius: 45 },
  shadowfen:      { x: 8400, y: 7000, continent: 'uloren', kingdom: 'unknown', type: 'village',  biomeCode: T.SWAMP, biomeRadius: 35 },
  whisper_stones: { x: 9000, y: 3000, continent: 'uloren', kingdom: 'unknown', type: 'ruins',    biomeCode: T.RUINS, biomeRadius: 40 },
  hollowpeak:     { x: 9500, y: 6500, continent: 'uloren', kingdom: 'unknown', type: 'village',  biomeCode: T.MOUNTAIN, biomeRadius: 30 },
};

export const LOCATION_COORDS: Record<string, { x: number; y: number }> =
  Object.fromEntries(Object.entries(SETTLEMENTS).map(([id, s]) => [id, { x: s.x, y: s.y }]));

export function getSettlementMeta(id: string): SettlementMeta | undefined {
  const s = SETTLEMENTS[id];
  return s ? { continent: s.continent, kingdom: s.kingdom, type: s.type, biomeCode: s.biomeCode, biomeRadius: s.biomeRadius } : undefined;
}

// ── Road connections ───────────────────────────────────────────────────────
const CONNECTIONS: [string, string][] = [
  // Auredia (dense network)
  ['highmarch','ashenford'], ['highmarch','millhaven'], ['highmarch','graygate'], ['highmarch','brightwater'],
  ['ashenford','crossroads'], ['ashenford','saltmoor'],
  ['saltmoor','graygate'], ['saltmoor','oakshire'],
  ['ironhold','crossroads'], ['ironhold','coldpeak'], ['ironhold','brightwater'],
  ['thornwick','graygate'], ['thornwick','goldcrest'],
  ['graygate','oakshire'], ['graygate','goldcrest'],
  ['crossroads','millhaven'], ['brightwater','millhaven'],
  // Trivalen — Korrath
  ['korrath_citadel','frostmarch'], ['korrath_citadel','deepmine'], ['korrath_citadel','dustfall'],
  // Trivalen — Vell
  ['vell_harbor','sunfield'], ['vell_harbor','coral_cove'], ['sunfield','badlands'],
  // Trivalen — Sarnak
  ['sarnak_hold','windridge'], ['sarnak_hold','dustplain'], ['dustplain','dustfall'],
  // Trivalen — contested
  ['dustfall','marshend'], ['marshend','badlands'], ['marshend','sunfield'],
  // Uloren has NO roads
];

// ── Colour palettes ────────────────────────────────────────────────────────
const HEX_PALETTES: Record<Season, string[]> = {
  thaw: [
    '#1a3a5c','#2a5a7c','#c4a86c','#5a7a4a',
    '#3a5a2a','#2a4a1a','#6a6a5a','#5a5a5a',
    '#d0d8e0','#3a4a3a','#5a4a3a','#8a7a5a',
    '#3a6a8c','#7a9a5a','#b8a060',
  ],
  summer: [
    '#1a3060','#2a5585','#d4b87c','#4a8a3a',
    '#2a6a1a','#1a5a0a','#7a7a5a','#6a6a6a',
    '#e8e8f0','#2a5a2a','#6a5a4a','#9a8a5a',
    '#2a5a90','#6aaa4a','#c8b070',
  ],
  harvest: [
    '#1a3050','#2a4a6a','#c4a05a','#8a7a3a',
    '#6a5a1a','#5a4a0a','#7a6a4a','#5a5050',
    '#d0c8c0','#4a4a2a','#5a4030','#8a7040',
    '#2a4a70','#9a8a3a','#a08030',
  ],
  dark: [
    '#0a1a30','#1a3050','#8a7a5a','#3a4a3a',
    '#2a3a2a','#1a2a1a','#4a4a4a','#3a3a3a',
    '#c0c8d8','#2a2a2a','#3a3028','#5a5040',
    '#1a3a60','#4a5a3a','#6a5830',
  ],
};

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

export const PARSED_PALETTES: Record<Season, [number, number, number][]> =
  (Object.keys(HEX_PALETTES) as Season[]).reduce((acc, s) => {
    acc[s] = HEX_PALETTES[s].map(hexToRgb);
    return acc;
  }, {} as Record<Season, [number, number, number][]>);

export function getTileColor(tile: TileType, season: Season): string {
  return HEX_PALETTES[season][TILE_NAMES.indexOf(tile)] ?? '#333';
}

// ── World objects ──────────────────────────────────────────────────────────
export type WorldObjectType =
  | 'farm' | 'barn' | 'windmill' | 'watchtower' | 'dock' | 'bridge'
  | 'campfire' | 'market_stall' | 'ruins_pillar' | 'stone_wall'
  | 'stone_circle' | 'hut' | 'well' | 'shrine' | 'gate' | 'fence';

export interface WorldObject {
  x: number; y: number;
  type: WorldObjectType;
  variant: number;
}

export type AmbientEntityType =
  | 'deer' | 'sheep' | 'wolf' | 'eagle' | 'rabbit' | 'fish'
  | 'villager' | 'fisherman' | 'guard' | 'merchant' | 'traveler' | 'crow';

export interface AmbientEntity {
  x: number; y: number;
  type: AmbientEntityType;
  speed: number;
  phase: number;
  radius: number;
}

// ── Chunk data ─────────────────────────────────────────────────────────────
export interface ChunkData {
  tiles: Uint8Array;
  roads: Uint8Array;
  objects: WorldObject[];
  entities: AmbientEntity[];
}

// ── LRU Cache ──────────────────────────────────────────────────────────────
class LRUCache<K, V> {
  private map = new Map<K, V>();
  constructor(private max: number) {}
  get(key: K): V | undefined { const v = this.map.get(key); if (v !== undefined) { this.map.delete(key); this.map.set(key, v); } return v; }
  set(key: K, val: V) { this.map.delete(key); this.map.set(key, val); if (this.map.size > this.max) { const first = this.map.keys().next().value; if (first !== undefined) this.map.delete(first); } }
  clear() { this.map.clear(); }
}

const chunkCache = new LRUCache<number, ChunkData>(1024);

// ── Road precomputation ────────────────────────────────────────────────────
let _roadSet: Set<number> | null = null;

function bresenhamLine(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const pts: [number, number][] = [];
  let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx - dy;
  for (;;) {
    pts.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx)  { err += dx; y0 += sy; }
  }
  return pts;
}

function ensureRoads(): Set<number> {
  if (_roadSet) return _roadSet;
  _roadSet = new Set<number>();
  for (const [a, b] of CONNECTIONS) {
    const ca = LOCATION_COORDS[a], cb = LOCATION_COORDS[b];
    if (!ca || !cb) continue;
    for (const [px, py] of bresenhamLine(ca.x, ca.y, cb.x, cb.y)) {
      if (px < 0 || px >= MAP_W || py < 0 || py >= MAP_H) continue;
      _roadSet.add(py * MAP_W + px);
      if (hash(px, py) > 0.3 && py + 1 < MAP_H) _roadSet.add((py + 1) * MAP_W + px);
      if (hash(px + 1, py) > 0.5 && px + 1 < MAP_W) _roadSet.add(py * MAP_W + (px + 1));
    }
  }
  return _roadSet;
}

// ── Tile computation ───────────────────────────────────────────────────────
function computeTile(x: number, y: number): number {
  let bestStr = -Infinity;
  let bestContinent: ContinentId | null = null;
  for (const c of CONTINENTS) {
    const s = continentStrength(x, y, c);
    if (s > bestStr) { bestStr = s; bestContinent = c.id; }
  }

  // Ocean
  if (bestStr < -0.08) return T.DEEP_WATER;
  if (bestStr < 0.02) return T.WATER;
  if (bestStr < 0.06) return T.SAND;

  // Land biome via noise
  const e = fbm(x * 0.004, y * 0.004, 5);
  const m = fbm(x * 0.005 + 500, y * 0.005 + 500, 4);
  const r = fbm(x * 0.015 + 200, y * 0.015 + 900, 3);

  // Continent-specific biome weighting
  if (bestContinent === 'auredia') {
    // Temperate: more grass and forest
    if (e < 0.30) return T.GRASS;
    if (e < 0.48) return m > 0.62 ? T.FOREST : T.GRASS;
    if (e < 0.58) return m > 0.55 ? T.DENSE_FOREST : (r > 0.55 ? T.HILL : T.FOREST);
    if (e < 0.68) return T.HILL;
    if (e < 0.78) return T.MOUNTAIN;
    return T.SNOW;
  }

  if (bestContinent === 'trivalen') {
    // Northern part = mountains (Korrath), south = grassland (Vell), east = steppe (Sarnak)
    const relY = (y - 1000) / 7500;
    if (relY < 0.35) {
      // Korrath territory: mountains & snow
      if (e < 0.32) return m > 0.55 ? T.FOREST : T.GRASS;
      if (e < 0.50) return T.HILL;
      if (e < 0.65) return T.MOUNTAIN;
      return T.SNOW;
    }
    if (relY > 0.75) {
      // Vell territory: coastal grasslands
      if (e < 0.35) return T.GRASS;
      if (e < 0.50) return m > 0.60 ? T.FOREST : T.GRASS;
      if (e < 0.62) return r > 0.55 ? T.HILL : T.FOREST;
      return T.HILL;
    }
    // Contested middle / Sarnak steppe
    if (m > 0.68 && r > 0.52) return T.SWAMP;
    if (e < 0.35) return T.GRASS;
    if (e < 0.52) return m > 0.58 ? T.FOREST : T.GRASS;
    if (e < 0.65) return r > 0.56 ? T.HILL : T.FOREST;
    return T.MOUNTAIN;
  }

  if (bestContinent === 'uloren') {
    // Dense and mysterious: lots of dense forest, mountains, some swamp
    if (m > 0.65 && r > 0.50) return T.SWAMP;
    if (e < 0.32) return T.DENSE_FOREST;
    if (e < 0.50) return m > 0.45 ? T.DENSE_FOREST : T.FOREST;
    if (e < 0.65) return T.HILL;
    if (e < 0.78) return T.MOUNTAIN;
    return T.SNOW;
  }

  // Fallback (small islands)
  if (e < 0.40) return m > 0.55 ? T.FOREST : T.GRASS;
  if (e < 0.55) return T.HILL;
  return T.MOUNTAIN;
}

// ── Settlement biome influence ─────────────────────────────────────────────
function applySettlementInfluence(x: number, y: number, base: number, nearSettlements: [string, typeof SETTLEMENTS[string]][]): number {
  for (const [, s] of nearSettlements) {
    const dx = x - s.x, dy = y - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > s.biomeRadius) continue;
    const strength = 1 - dist / s.biomeRadius;
    if (hash(x * 7 + y * 13, 999) < strength * 0.88) return s.biomeCode;
  }
  return base;
}

// ── River check (deterministic per-tile) ───────────────────────────────────
function isRiver(x: number, y: number): boolean {
  // Several major rivers per continent, computed deterministically
  for (const c of CONTINENTS) {
    const numRivers = c.id === 'uloren' ? 3 : 5;
    for (let i = 0; i < numRivers; i++) {
      const seedX = hash(i * 7 + c.cx, c.cy) * c.rx * 2 + (c.cx - c.rx);
      const seedY = hash(i * 13, c.cy + i) * c.ry * 2 + (c.cy - c.ry);
      let rx = seedX, ry = seedY;
      for (let step = 0; step < 2000; step++) {
        if (Math.abs(rx - x) < 2 && Math.abs(ry - y) < 2) return true;
        const drift = hash(Math.floor(rx) + step * 29, Math.floor(ry) + step * 19);
        rx += (drift < 0.4 ? -1 : drift > 0.6 ? 1 : 0);
        ry += 1;
        if (ry > c.cy + c.ry) break;
      }
    }
  }
  return false;
}

// ── Farm field check ───────────────────────────────────────────────────────
function isFarmField(x: number, y: number, nearSettlements: [string, typeof SETTLEMENTS[string]][]): boolean {
  for (const [id, s] of nearSettlements) {
    if (s.type !== 'village' && s.type !== 'capital' && s.type !== 'inn' && s.type !== 'town') continue;
    const dx = x - s.x, dy = y - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 25 || dist > 90) continue;
    // Farm patches are hash-determined
    if (hash(Math.floor(x / 8) * 31 + id.charCodeAt(0), Math.floor(y / 8) * 37) < 0.12) return true;
  }
  return false;
}

// ── Chunk generation ───────────────────────────────────────────────────────
function generateChunk(cx: number, cy: number): ChunkData {
  const tiles = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);
  const roads = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);
  const objects: WorldObject[] = [];
  const entities: AmbientEntity[] = [];

  const ox = cx * CHUNK_SIZE, oy = cy * CHUNK_SIZE;
  const roadSet = ensureRoads();

  // Find nearby settlements (within biome influence radius + CHUNK_SIZE)
  const nearby: [string, typeof SETTLEMENTS[string]][] = [];
  for (const [id, s] of Object.entries(SETTLEMENTS)) {
    if (Math.abs(s.x - (ox + 32)) < s.biomeRadius + CHUNK_SIZE &&
        Math.abs(s.y - (oy + 32)) < s.biomeRadius + CHUNK_SIZE) {
      nearby.push([id, s]);
    }
  }

  // ── Tiles ──
  for (let ty = 0; ty < CHUNK_SIZE; ty++) {
    for (let tx = 0; tx < CHUNK_SIZE; tx++) {
      const wx = ox + tx, wy = oy + ty;
      if (wx >= MAP_W || wy >= MAP_H) continue;

      let code = computeTile(wx, wy);
      code = applySettlementInfluence(wx, wy, code, nearby);

      // Farm fields near agricultural settlements
      if ((code === T.GRASS || code === T.CLEARING) && isFarmField(wx, wy, nearby)) {
        code = T.FARM_FIELD;
      }

      // Clearings in forests
      if ((code === T.FOREST || code === T.DENSE_FOREST) && hash(Math.floor(wx / 12), Math.floor(wy / 12) + 5555) < 0.03) {
        code = T.CLEARING;
      }

      tiles[ty * CHUNK_SIZE + tx] = code;
    }
  }

  // ── Roads ──
  for (let ty = 0; ty < CHUNK_SIZE; ty++) {
    for (let tx = 0; tx < CHUNK_SIZE; tx++) {
      const wx = ox + tx, wy = oy + ty;
      if (roadSet.has(wy * MAP_W + wx)) roads[ty * CHUNK_SIZE + tx] = 1;
    }
  }

  // ── Objects ──
  generateChunkObjects(cx, cy, tiles, roads, nearby, objects);

  // ── Entities ──
  generateChunkEntities(cx, cy, tiles, nearby, entities);

  return { tiles, roads, objects, entities };
}

// ── Object generation per chunk ────────────────────────────────────────────
function generateChunkObjects(
  cx: number, cy: number,
  tiles: Uint8Array, roads: Uint8Array,
  nearby: [string, typeof SETTLEMENTS[string]][],
  out: WorldObject[],
) {
  const ox = cx * CHUNK_SIZE, oy = cy * CHUNK_SIZE;
  const inChunk = (x: number, y: number) => x >= ox && x < ox + CHUNK_SIZE && y >= oy && y < oy + CHUNK_SIZE;

  for (const [id, s] of nearby) {
    const sc = { x: s.x, y: s.y };

    // Wells at every settlement
    if (inChunk(sc.x + 2, sc.y + 2)) out.push({ x: sc.x + 2, y: sc.y + 2, type: 'well', variant: 0 });

    // Huts and fences for villages/towns/capitals
    if (['village', 'town', 'capital', 'inn'].includes(s.type)) {
      for (let i = 0; i < 10; i++) {
        const ang = hash(i * 9, id.charCodeAt(0)) * Math.PI * 2;
        const d = 8 + hash(i, id.charCodeAt(1)) * 28;
        const hx = Math.round(sc.x + Math.cos(ang) * d);
        const hy = Math.round(sc.y + Math.sin(ang) * d);
        if (inChunk(hx, hy)) out.push({ x: hx, y: hy, type: 'hut', variant: i % 4 });
      }
      for (let i = 0; i < 20; i++) {
        const ang = (i / 20) * Math.PI * 2;
        const fx = Math.round(sc.x + Math.cos(ang) * 35);
        const fy = Math.round(sc.y + Math.sin(ang) * 35);
        if (inChunk(fx, fy)) out.push({ x: fx, y: fy, type: 'fence', variant: i % 2 });
      }
    }

    // Farms around agricultural settlements
    if (['village', 'capital', 'inn', 'town'].includes(s.type)) {
      for (let i = 0; i < 10; i++) {
        const ang = hash(i + id.length * 3, i * 7) * Math.PI * 2;
        const d = 18 + hash(i * 3, i * 11 + id.charCodeAt(0)) * 55;
        const fx = Math.round(sc.x + Math.cos(ang) * d);
        const fy = Math.round(sc.y + Math.sin(ang) * d);
        if (!inChunk(fx, fy)) continue;
        const li = (fy - oy) * CHUNK_SIZE + (fx - ox);
        const t = tiles[li] ?? T.GRASS;
        if (t === T.GRASS || t === T.FARM_FIELD || t === T.CLEARING) {
          out.push({ x: fx, y: fy, type: hash(i, id.charCodeAt(0)) > 0.6 ? 'barn' : 'farm', variant: i % 4 });
        }
      }
    }

    // Market stalls at trade cities/ports
    if (['city', 'port', 'capital'].includes(s.type)) {
      for (let i = 0; i < 8; i++) {
        const ang = hash(i * 5, id.charCodeAt(0)) * Math.PI * 2;
        const d = 6 + hash(i * 7, id.charCodeAt(1)) * 18;
        const mx = Math.round(sc.x + Math.cos(ang) * d);
        const my = Math.round(sc.y + Math.sin(ang) * d);
        if (inChunk(mx, my)) out.push({ x: mx, y: my, type: 'market_stall', variant: i % 4 });
      }
    }

    // Watchtowers and walls at fortresses/capitals
    if (['fortress', 'capital'].includes(s.type)) {
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const wx = Math.round(sc.x + Math.cos(ang) * 22);
        const wy = Math.round(sc.y + Math.sin(ang) * 22);
        if (inChunk(wx, wy)) out.push({ x: wx, y: wy, type: 'watchtower', variant: i % 2 });
      }
      for (let i = 0; i < 28; i++) {
        const ang = (i / 28) * Math.PI * 2;
        const wx = Math.round(sc.x + Math.cos(ang) * 17);
        const wy = Math.round(sc.y + Math.sin(ang) * 17);
        if (inChunk(wx, wy)) out.push({ x: wx, y: wy, type: 'stone_wall', variant: i % 4 });
      }
      if (inChunk(sc.x, sc.y + 18)) out.push({ x: sc.x, y: sc.y + 18, type: 'gate', variant: 0 });
    }

    // Ruins at ruin sites
    if (s.type === 'ruins') {
      for (let i = 0; i < 20; i++) {
        const ang = hash(i * 11, id.charCodeAt(0)) * Math.PI * 2;
        const d = 6 + hash(i * 13, id.charCodeAt(1)) * 40;
        const rx = Math.round(sc.x + Math.cos(ang) * d);
        const ry = Math.round(sc.y + Math.sin(ang) * d);
        if (inChunk(rx, ry)) out.push({ x: rx, y: ry, type: 'ruins_pillar', variant: i % 4 });
      }
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2;
        const rx = Math.round(sc.x + Math.cos(ang) * 14);
        const ry = Math.round(sc.y + Math.sin(ang) * 14);
        if (inChunk(rx, ry)) out.push({ x: rx, y: ry, type: 'stone_circle', variant: i % 2 });
      }
      if (inChunk(sc.x, sc.y - 6)) out.push({ x: sc.x, y: sc.y - 6, type: 'shrine', variant: 0 });
    }

    // Docks at ports
    if (s.type === 'port') {
      for (let i = 0; i < 6; i++) {
        const dx = sc.x - 18 + i * 5, dy = sc.y + 6 + i * 2;
        if (inChunk(dx, dy)) out.push({ x: dx, y: dy, type: 'dock', variant: i % 3 });
      }
    }

    // Windmills near villages
    if (['village', 'town'].includes(s.type)) {
      for (let i = 0; i < 3; i++) {
        const ang = hash(i * 17, id.charCodeAt(0) + 60) * Math.PI * 2;
        const d = 35 + hash(i * 23, id.charCodeAt(1)) * 70;
        const wx = Math.round(sc.x + Math.cos(ang) * d);
        const wy = Math.round(sc.y + Math.sin(ang) * d);
        if (inChunk(wx, wy)) out.push({ x: wx, y: wy, type: 'windmill', variant: i % 2 });
      }
    }
  }

  // Campfires along roads
  for (let ty = 0; ty < CHUNK_SIZE; ty += 3) {
    for (let tx = 0; tx < CHUNK_SIZE; tx += 3) {
      if (roads[ty * CHUNK_SIZE + tx] === 1 && hash((ox + tx) * 97, (oy + ty) * 113) < 0.004) {
        out.push({ x: ox + tx, y: oy + ty, type: 'campfire', variant: 0 });
      }
    }
  }
}

// ── Entity generation per chunk ────────────────────────────────────────────
function generateChunkEntities(
  cx: number, cy: number,
  tiles: Uint8Array,
  nearby: [string, typeof SETTLEMENTS[string]][],
  out: AmbientEntity[],
) {
  const ox = cx * CHUNK_SIZE, oy = cy * CHUNK_SIZE;

  // Wildlife based on biome (sample every 4th tile for density control)
  for (let ty = 0; ty < CHUNK_SIZE; ty += 4) {
    for (let tx = 0; tx < CHUNK_SIZE; tx += 4) {
      const wx = ox + tx, wy = oy + ty;
      const code = tiles[ty * CHUNK_SIZE + tx];
      const h = hash(wx * 37 + wy * 53, 7777);
      const h2 = hash(wx * 41, wy * 59);

      if ((code === T.FOREST || code === T.CLEARING) && h < 0.06)
        out.push({ x: wx, y: wy, type: 'deer', speed: 0.25 + h2 * 0.3, phase: h2 * Math.PI * 2, radius: 10 });
      else if (code === T.DENSE_FOREST && h < 0.03)
        out.push({ x: wx, y: wy, type: 'wolf', speed: 0.4 + h2 * 0.4, phase: h2 * Math.PI * 2, radius: 14 });
      else if ((code === T.GRASS || code === T.FARM_FIELD) && h < 0.04)
        out.push({ x: wx, y: wy, type: 'sheep', speed: 0.08 + h2 * 0.14, phase: h2 * Math.PI * 2, radius: 6 });
      else if ((code === T.CLEARING || code === T.GRASS) && h > 0.93)
        out.push({ x: wx, y: wy, type: 'rabbit', speed: 0.7 + h2 * 0.5, phase: h2 * Math.PI * 2, radius: 5 });
      else if ((code === T.MOUNTAIN || code === T.SNOW || code === T.HILL) && h < 0.015)
        out.push({ x: wx, y: wy, type: 'eagle', speed: 0.5 + h2 * 0.4, phase: h2 * Math.PI * 2, radius: 24 });
      else if ((code === T.RIVER || code === T.WATER) && h < 0.04)
        out.push({ x: wx, y: wy, type: 'fish', speed: 0.3 + h2 * 0.3, phase: h2 * Math.PI * 2, radius: 7 });
      else if ((code === T.FOREST || code === T.HILL) && h > 0.96)
        out.push({ x: wx, y: wy, type: 'crow', speed: 0.6 + h2 * 0.4, phase: h2 * Math.PI * 2, radius: 18 });
      else if ((code === T.SAND || code === T.RIVER) && h < 0.02)
        out.push({ x: wx, y: wy, type: 'fisherman', speed: 0.03 + h2 * 0.04, phase: h2 * Math.PI * 2, radius: 4 });
    }
  }

  // Settlement entities (villagers, guards, merchants)
  for (const [id, s] of nearby) {
    const inChunk = (x: number, y: number) => x >= ox && x < ox + CHUNK_SIZE && y >= oy && y < oy + CHUNK_SIZE;

    if (['village', 'town', 'city', 'capital', 'inn', 'port'].includes(s.type)) {
      for (let i = 0; i < 10; i++) {
        const vx = s.x + Math.round((hash(i * 3, id.charCodeAt(0)) - 0.5) * 40);
        const vy = s.y + Math.round((hash(i * 7, id.charCodeAt(1)) - 0.5) * 40);
        if (!inChunk(vx, vy)) continue;
        out.push({
          x: vx, y: vy, type: 'villager',
          speed: 0.12 + hash(i, id.charCodeAt(0) + 50) * 0.18,
          phase: hash(i * 11, id.charCodeAt(0)) * Math.PI * 2, radius: 12,
        });
      }
    }

    if (['fortress', 'capital'].includes(s.type)) {
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const gx = Math.round(s.x + Math.cos(ang) * 20);
        const gy = Math.round(s.y + Math.sin(ang) * 20);
        if (!inChunk(gx, gy)) continue;
        out.push({ x: gx, y: gy, type: 'guard', speed: 0.18, phase: ang, radius: 6 });
      }
    }
  }

  // Merchants/travelers on roads
  for (let ty = 0; ty < CHUNK_SIZE; ty += 8) {
    for (let tx = 0; tx < CHUNK_SIZE; tx += 8) {
      const wx = ox + tx, wy = oy + ty;
      const localIdx = ty * CHUNK_SIZE + tx;
      if (tiles[localIdx] === T.ROAD || (wx < MAP_W && wy < MAP_H && ensureRoads().has(wy * MAP_W + wx))) {
        if (hash(wx * 101, wy * 103) < 0.005) {
          out.push({
            x: wx, y: wy,
            type: hash(wx, wy * 2929) > 0.5 ? 'merchant' : 'traveler',
            speed: 0.10 + hash(wx, wy * 3030) * 0.22,
            phase: hash(wx * 103, wy * 3131) * Math.PI * 2, radius: 35,
          });
        }
      }
    }
  }
}

// ── Public API ─────────────────────────────────────────────────────────────
export function getChunkData(cx: number, cy: number): ChunkData {
  const key = cy * NUM_CHUNKS_X + cx;
  let data = chunkCache.get(key);
  if (!data) {
    data = generateChunk(cx, cy);
    chunkCache.set(key, data);
  }
  return data;
}

export function getTileAt(x: number, y: number): number {
  if (x < 0 || x >= MAP_W || y < 0 || y >= MAP_H) return T.DEEP_WATER;
  const cx = Math.floor(x / CHUNK_SIZE), cy = Math.floor(y / CHUNK_SIZE);
  const chunk = getChunkData(cx, cy);
  const lx = x - cx * CHUNK_SIZE, ly = y - cy * CHUNK_SIZE;
  const roadSet = ensureRoads();
  if (roadSet.has(y * MAP_W + x)) return T.ROAD;
  return chunk.tiles[ly * CHUNK_SIZE + lx];
}

export function getRoadAt(x: number, y: number): boolean {
  return ensureRoads().has(y * MAP_W + x);
}

export function isWalkable(tile: TileType): boolean {
  return tile !== 'deep_water' && tile !== 'water' && tile !== 'mountain';
}

export function isWalkableCode(code: number): boolean {
  return code !== T.DEEP_WATER && code !== T.WATER && code !== T.MOUNTAIN;
}

export function tileCodeToType(code: number): TileType {
  return TILE_NAMES[code] ?? 'grass';
}

// Legacy compat — no longer creates a full map; returns stub so old imports don't break
export interface WorldMapLegacy { tiles: null; roads: null; objects: never[]; entities: never[]; }
export function generateWorldMap(): WorldMapLegacy {
  return { tiles: null, roads: null, objects: [], entities: [] };
}
