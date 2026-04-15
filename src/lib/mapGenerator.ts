import { Season } from './gameTypes';

// ── Value noise ────────────────────────────────────────────────────────────
const SEED = 42;

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
  const nx0 = n00 + sx * (n10 - n00);
  const nx1 = n01 + sx * (n11 - n01);
  return nx0 + sy * (nx1 - nx0);
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

// Numeric codes for fast Uint8Array storage
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

export const MAP_W = 6000;
export const MAP_H = 3000;
export const TILE_SIZE = 5; // kept for legacy references
export const CHUNK_SIZE = 64;
export const NUM_CHUNKS_X = Math.ceil(MAP_W / CHUNK_SIZE); // 32
export const NUM_CHUNKS_Y = Math.ceil(MAP_H / CHUNK_SIZE); // 32

// Location coordinates spread across 2000×2000
export const LOCATION_COORDS: Record<string, { x: number; y: number }> = {
  ashenford:       { x: 950,  y: 1050 },
  saltmoor:        { x: 280,  y: 630  },
  ironhold:        { x: 680,  y: 360  },
  thornwick:       { x: 1380, y: 1100 },
  graygate:        { x: 620,  y: 880  },
  dustfall:        { x: 1080, y: 480  },
  crossroads:      { x: 800,  y: 780  },
  marshend:        { x: 1620, y: 1380 },
  badlands:        { x: 1520, y: 680  },
  coldpeak:        { x: 480,  y: 180  },
  ruins_of_aether: { x: 1780, y: 940  },
  dawnhaven:       { x: 450,  y: 780  },
  vaultkeep:       { x: 760,  y: 300  },
  greenhollow:     { x: 1180, y: 900  },
  tidewatch:       { x: 130,  y: 430  },
  sundrift_port:   { x: 2250, y: 1500 },
  salt_throne:     { x: 2700, y: 800  },
  ember_crossing:  { x: 3100, y: 1200 },
  canyon_veil:     { x: 3500, y: 1800 },
  dust_oracle:     { x: 2900, y: 2300 },
  tidegate_haven:  { x: 4300, y: 1400 },
  ironvine_citadel:{ x: 4800, y: 600  },
  mossdeep:        { x: 5300, y: 1900 },
  ashflow_rim:     { x: 5700, y: 900  },
  rootspire:       { x: 5100, y: 2600 },
};

export const CONTINENTS = [
  {
    id: 'aethermoor',
    name: 'Aethermoor',
    xMin: 0, xMax: 1999, yMin: 0, yMax: 2999,
    dominantBiome: 'Temperate mixed (plains, forest, mountain)',
    loreBlurb: 'The oldest inhabited continent. Seat of the collapsed Aetherik Empire. Six factions struggle over its bones.',
  },
  {
    id: 'sundrift',
    name: 'The Sundrift Expanse',
    xMin: 2200, xMax: 3999, yMin: 0, yMax: 2999,
    dominantBiome: 'Arid savanna, salt flats, desert canyons',
    loreBlurb: 'A vast sun-scorched continent rich in rare minerals and buried Aetherik ruins. The Amber Compact finances most of the expeditions into its interior.',
  },
  {
    id: 'verdant_reach',
    name: 'The Verdant Reach',
    xMin: 4200, xMax: 5999, yMin: 0, yMax: 2999,
    dominantBiome: 'Dense rainforest, river networks, volcanic highlands',
    loreBlurb: 'Largely uncharted. The Greenwarden Covenant claims spiritual authority over it but controls none of it. Indigenous city-states trade only by sea.',
  },
] as const;

// ── Colour palettes ────────────────────────────────────────────────────────
// Index matches T.* codes  (0-14)
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

// Backward-compat helpers
export function getTileColor(tile: TileType, season: Season): string {
  return HEX_PALETTES[season][TILE_NAMES.indexOf(tile)] ?? '#333';
}
export function getRoadColor(season: Season): string {
  return HEX_PALETTES[season][T.ROAD];
}

// ── World objects (static medieval structures) ─────────────────────────────
export type WorldObjectType =
  | 'farm' | 'barn' | 'windmill' | 'watchtower' | 'dock' | 'bridge'
  | 'campfire' | 'market_stall' | 'ruins_pillar' | 'stone_wall'
  | 'stone_circle' | 'hut' | 'well' | 'shrine' | 'gate' | 'fence';

export interface WorldObject {
  x: number; y: number;
  type: WorldObjectType;
  variant: number;
}

// ── Ambient entities (animals + non-interactive NPCs) ──────────────────────
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

// ── Map interface ──────────────────────────────────────────────────────────
export interface WorldMap {
  tiles: Uint8Array;   // flat: tiles[y * MAP_W + x] = tile code
  roads: Uint8Array;   // flat: roads[y * MAP_W + x] = 1 if road
  objects: WorldObject[];
  entities: AmbientEntity[];
}

// ── Internal helpers ───────────────────────────────────────────────────────
function setTile(tiles: Uint8Array, x: number, y: number, code: number) {
  if (x >= 0 && x < MAP_W && y >= 0 && y < MAP_H) tiles[y * MAP_W + x] = code;
}

function bresenhamLine(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const pts: [number, number][] = [];
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  for (;;) {
    pts.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx)  { err += dx; y0 += sy; }
  }
  return pts;
}

const BIOME_INFLUENCE: Record<string, { code: number; radius: number }> = {
  ashenford:       { code: T.GRASS,        radius: 55 },
  saltmoor:        { code: T.SAND,         radius: 50 },
  ironhold:        { code: T.MOUNTAIN,     radius: 55 },
  thornwick:       { code: T.DENSE_FOREST, radius: 60 },
  graygate:        { code: T.GRASS,        radius: 50 },
  dustfall:        { code: T.RUINS,        radius: 45 },
  crossroads:      { code: T.GRASS,        radius: 40 },
  marshend:        { code: T.SWAMP,        radius: 60 },
  badlands:        { code: T.HILL,         radius: 65 },
  coldpeak:        { code: T.SNOW,         radius: 55 },
  ruins_of_aether: { code: T.RUINS,        radius: 45 },
  dawnhaven:       { code: T.FARM_FIELD,   radius: 40 },
  vaultkeep:       { code: T.MOUNTAIN,     radius: 40 },
  greenhollow:     { code: T.FOREST,       radius: 50 },
  tidewatch:       { code: T.SAND,         radius: 35 },
  sundrift_port:   { code: T.SAND,         radius: 50 },
  salt_throne:     { code: T.SAND,         radius: 60 },
  ember_crossing:  { code: T.HILL,         radius: 45 },
  canyon_veil:     { code: T.HILL,         radius: 55 },
  dust_oracle:     { code: T.RUINS,        radius: 40 },
  tidegate_haven:  { code: T.FOREST,       radius: 55 },
  ironvine_citadel:{ code: T.DENSE_FOREST, radius: 65 },
  mossdeep:        { code: T.SWAMP,        radius: 55 },
  ashflow_rim:     { code: T.MOUNTAIN,     radius: 50 },
  rootspire:       { code: T.DENSE_FOREST, radius: 60 },
};

export const CONNECTIONS: [string, string][] = [
  ['ashenford', 'thornwick'],  ['ashenford', 'saltmoor'],
  ['ashenford', 'crossroads'], ['saltmoor', 'graygate'],
  ['saltmoor', 'ironhold'],    ['ironhold', 'coldpeak'],
  ['ironhold', 'crossroads'],  ['thornwick', 'marshend'],
  ['thornwick', 'ruins_of_aether'], ['graygate', 'dustfall'],
  ['graygate', 'crossroads'],  ['dustfall', 'badlands'],
  ['marshend', 'badlands'],
  ['dawnhaven', 'ashenford'], ['dawnhaven', 'saltmoor'],
  ['vaultkeep', 'ironhold'], ['vaultkeep', 'crossroads'],
  ['greenhollow', 'thornwick'], ['greenhollow', 'ashenford'],
  ['tidewatch', 'saltmoor'],
  ['saltmoor', 'sundrift_port'], ['tidewatch', 'sundrift_port'],
  ['sundrift_port', 'salt_throne'], ['salt_throne', 'ember_crossing'],
  ['ember_crossing', 'canyon_veil'], ['canyon_veil', 'dust_oracle'],
  ['sundrift_port', 'tidegate_haven'], ['tidegate_haven', 'ironvine_citadel'],
  ['ironvine_citadel', 'ashflow_rim'], ['ironvine_citadel', 'mossdeep'],
  ['mossdeep', 'rootspire'],
];

// ── Main generation ────────────────────────────────────────────────────────
export function generateWorldMap(): WorldMap {
  const tiles = new Uint8Array(MAP_W * MAP_H);
  const roads = new Uint8Array(MAP_W * MAP_H);
  const objects: WorldObject[] = [];
  const entities: AmbientEntity[] = [];

  // ── 1. Base terrain via coarse FBM (faster: compute at 1/4 res, bilinear upsample)
  const COARSE = 4;
  const cW = Math.ceil(MAP_W / COARSE) + 2;
  const cH = Math.ceil(MAP_H / COARSE) + 2;
  const elev = new Float32Array(cW * cH);
  const moist = new Float32Array(cW * cH);
  const rough = new Float32Array(cW * cH);
  for (let cy = 0; cy < cH; cy++) {
    for (let cx = 0; cx < cW; cx++) {
      const wx = cx * COARSE, wy = cy * COARSE;
      elev[cy * cW + cx]  = fbm(wx * 0.0045, wy * 0.0045, 5);
      moist[cy * cW + cx] = fbm(wx * 0.006 + 500, wy * 0.006 + 500, 4);
      rough[cy * cW + cx] = fbm(wx * 0.018 + 200, wy * 0.018 + 900, 3);
    }
  }

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const cx = x / COARSE, cy = y / COARSE;
      const ix = Math.floor(cx), iy = Math.floor(cy);
      const fx = cx - ix, fy = cy - iy;
      const i00 = iy * cW + ix, i10 = i00 + 1, i01 = i00 + cW, i11 = i01 + 1;
      const blerp = (a: Float32Array) =>
        a[i00] + fx * (a[i10] - a[i00]) + fy * ((a[i01] + fx * (a[i11] - a[i01])) - (a[i00] + fx * (a[i10] - a[i00])));
      const e = blerp(elev), m = blerp(moist), r = blerp(rough);

      let code: number;
      if      (e < 0.24) code = T.DEEP_WATER;
      else if (e < 0.30) code = T.WATER;
      else if (e < 0.34) code = T.SAND;
      else if (e < 0.50) {
        if      (m > 0.68 && r > 0.52) code = T.SWAMP;
        else if (m > 0.62)             code = T.FOREST;
        else                           code = T.GRASS;
      }
      else if (e < 0.62) {
        if      (m > 0.60) code = T.DENSE_FOREST;
        else if (r > 0.58) code = T.HILL;
        else               code = T.FOREST;
      }
      else if (e < 0.73) code = T.HILL;
      else if (e < 0.83) code = T.MOUNTAIN;
      else               code = T.SNOW;

      tiles[y * MAP_W + x] = code;
    }
  }

  // ── 2. Northern snow cap
  for (let y = 0; y < 160; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const snowLine = 80 + hash(x * 5, y) * 80;
      if (y < snowLine) {
        const t = tiles[y * MAP_W + x];
        if (t !== T.DEEP_WATER && t !== T.WATER) tiles[y * MAP_W + x] = T.SNOW;
      }
    }
  }

  // ── 3. Western coast (saltmoor)
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < 90; x++) {
      const sm = LOCATION_COORDS.saltmoor;
      const noise = hash(x * 3 + 11, y * 2 + 7) * 25;
      const coastLine = 40 + noise;
      if (x < coastLine) {
        tiles[y * MAP_W + x] = x < 25 ? T.DEEP_WATER : T.WATER;
      }
    }
  }

  // ── 4. Biome influence zones
  // Force ocean straits between continents
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 2000; x < 2200; x++) tiles[y * MAP_W + x] = T.DEEP_WATER;
    for (let x = 4000; x < 4200; x++) tiles[y * MAP_W + x] = T.DEEP_WATER;
  }

  // ── 4. Biome influence zones
  for (const [locId, inf] of Object.entries(BIOME_INFLUENCE)) {
    const c = LOCATION_COORDS[locId];
    if (!c) continue;
    for (let dy = -inf.radius; dy <= inf.radius; dy++) {
      for (let dx = -inf.radius; dx <= inf.radius; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > inf.radius) continue;
        const tx = c.x + dx, ty = c.y + dy;
        if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) continue;
        const strength = 1 - dist / inf.radius;
        if (hash(tx * 7 + ty * 13, 999) < strength * 0.88) {
          tiles[ty * MAP_W + tx] = inf.code;
        }
      }
    }
  }

  // ── 5. Rivers (8 winding rivers)
  const riverSources: { x: number; y: number; vx: number; vy: number }[] = [
    { x: 480,  y: 0,    vx: 0,  vy: 1  },
    { x: 1200, y: 0,    vx: 0,  vy: 1  },
    { x: 0,    y: 600,  vx: 1,  vy: 0  },
    { x: 0,    y: 1400, vx: 1,  vy: 0  },
    { x: 1999, y: 500,  vx: -1, vy: 0  },
    { x: 1999, y: 1200, vx: -1, vy: 0  },
    { x: 750,  y: 1999, vx: 0,  vy: -1 },
    { x: 1450, y: 1999, vx: 0,  vy: -1 },
  ];
  for (const src of riverSources) {
    let rx = src.x, ry = src.y;
    for (let i = 0; i < 1400; i++) {
      if (rx < 0 || rx >= MAP_W || ry < 0 || ry >= MAP_H) break;
      const idx = ry * MAP_W + rx;
      tiles[idx] = T.RIVER;
      // 2-tile wide
      const side = src.vy !== 0 ? 1 : 0;
      const sideY = src.vx !== 0 ? 1 : 0;
      if (rx + side < MAP_W && ry + sideY < MAP_H) tiles[(ry + sideY) * MAP_W + (rx + side)] = T.RIVER;

      const drift = hash(rx + i * 29, ry + i * 19);
      const perpX = src.vy !== 0 ? (drift < 0.3 ? -1 : drift > 0.7 ? 1 : 0) : 0;
      const perpY = src.vx !== 0 ? (drift < 0.3 ? -1 : drift > 0.7 ? 1 : 0) : 0;
      rx += src.vx + perpX;
      ry += src.vy + perpY;
    }
  }

  // ── 6. Farm fields around agricultural villages
  const farmVillages = ['ashenford', 'graygate', 'crossroads', 'thornwick'];
  for (const v of farmVillages) {
    const c = LOCATION_COORDS[v];
    if (!c) continue;
    for (let i = 0; i < 22; i++) {
      const ang = hash(i * 7 + v.charCodeAt(0), i * 13) * Math.PI * 2;
      const d = 25 + hash(i * 11, i * 17 + v.charCodeAt(1)) * 65;
      const fx = Math.round(c.x + Math.cos(ang) * d);
      const fy = Math.round(c.y + Math.sin(ang) * d);
      const fw = 5 + Math.floor(hash(i, v.charCodeAt(0)) * 10);
      const fh = 4 + Math.floor(hash(i + 100, v.charCodeAt(0)) * 7);
      for (let dy = 0; dy < fh; dy++) {
        for (let dx = 0; dx < fw; dx++) {
          const tx = fx + dx, ty = fy + dy;
          if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) continue;
          const t = tiles[ty * MAP_W + tx];
          if (t === T.GRASS || t === T.CLEARING) tiles[ty * MAP_W + tx] = T.FARM_FIELD;
        }
      }
    }
  }

  // ── 7. Clearings scattered through forests
  for (let i = 0; i < 220; i++) {
    const cx = Math.floor(hash(i * 37, 1234) * MAP_W);
    const cy = Math.floor(hash(i * 53, 5678) * MAP_H);
    const r = 5 + Math.floor(hash(i, 9999) * 9);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.sqrt(dx * dx + dy * dy) > r) continue;
        const tx = cx + dx, ty = cy + dy;
        if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) continue;
        const t = tiles[ty * MAP_W + tx];
        if (t === T.FOREST || t === T.DENSE_FOREST || t === T.GRASS) {
          tiles[ty * MAP_W + tx] = T.CLEARING;
        }
      }
    }
  }

  // ── 8. Roads
  for (const [a, b] of CONNECTIONS) {
    const ca = LOCATION_COORDS[a], cb = LOCATION_COORDS[b];
    if (!ca || !cb) continue;
    for (const [px, py] of bresenhamLine(ca.x, ca.y, cb.x, cb.y)) {
      if (px < 0 || px >= MAP_W || py < 0 || py >= MAP_H) continue;
      const tile = tiles[py * MAP_W + px];
      if (tile === T.DEEP_WATER || tile === T.WATER) continue;
      roads[py * MAP_W + px] = 1;
      if (hash(px, py) > 0.3 && py + 1 < MAP_H) {
        const southTile = tiles[(py + 1) * MAP_W + px];
        if (southTile !== T.DEEP_WATER && southTile !== T.WATER) roads[(py + 1) * MAP_W + px] = 1;
      }
      if (hash(px + 1, py) > 0.5 && px + 1 < MAP_W) {
        const eastTile = tiles[py * MAP_W + (px + 1)];
        if (eastTile !== T.DEEP_WATER && eastTile !== T.WATER) roads[py * MAP_W + (px + 1)] = 1;
      }
    }
  }

  // ── 9. World objects & ambient entities
  generateObjects(tiles, roads, objects);
  generateEntities(tiles, entities);

  return { tiles, roads, objects, entities };
}

// ── Object placement ───────────────────────────────────────────────────────
function generateObjects(tiles: Uint8Array, roads: Uint8Array, out: WorldObject[]) {
  const push = (x: number, y: number, type: WorldObjectType, variant = 0) => {
    if (x >= 0 && x < MAP_W && y >= 0 && y < MAP_H) out.push({ x, y, type, variant });
  };

  // Farms & barns around agricultural villages
  for (const v of ['ashenford', 'graygate', 'crossroads'] as const) {
    const c = LOCATION_COORDS[v];
    if (!c) continue;
    for (let i = 0; i < 14; i++) {
      const ang = hash(i + v.length * 3, i * 7) * Math.PI * 2;
      const d = 18 + hash(i * 3, i * 11 + v.charCodeAt(0)) * 55;
      const ox = Math.round(c.x + Math.cos(ang) * d);
      const oy = Math.round(c.y + Math.sin(ang) * d);
      const t = tiles[oy * MAP_W + ox] ?? T.GRASS;
      if (t === T.GRASS || t === T.FARM_FIELD || t === T.CLEARING) {
        push(ox, oy, hash(i, v.charCodeAt(0)) > 0.6 ? 'barn' : 'farm', i % 4);
      }
    }
  }

  // Huts & wells at every settlement
  for (const [id, c] of Object.entries(LOCATION_COORDS)) {
    push(c.x + 2, c.y + 2, 'well', 0);

    if (['ashenford', 'crossroads', 'thornwick', 'marshend'].includes(id)) {
      for (let i = 0; i < 10; i++) {
        const ang = hash(i * 9, id.charCodeAt(0)) * Math.PI * 2;
        const d = 8 + hash(i, id.charCodeAt(1)) * 28;
        push(Math.round(c.x + Math.cos(ang) * d), Math.round(c.y + Math.sin(ang) * d), 'hut', i % 4);
      }
      // Fence ring around village
      for (let i = 0; i < 20; i++) {
        const ang = (i / 20) * Math.PI * 2;
        push(Math.round(c.x + Math.cos(ang) * 35), Math.round(c.y + Math.sin(ang) * 35), 'fence', i % 2);
      }
    }

    // Market stalls at trade cities
    if (['graygate', 'saltmoor'].includes(id)) {
      for (let i = 0; i < 8; i++) {
        const ang = hash(i * 5, id.charCodeAt(0)) * Math.PI * 2;
        const d = 6 + hash(i * 7, id.charCodeAt(1)) * 18;
        push(Math.round(c.x + Math.cos(ang) * d), Math.round(c.y + Math.sin(ang) * d), 'market_stall', i % 4);
      }
    }

    // Ruins at dustfall & ruins_of_aether
    if (['dustfall', 'ruins_of_aether'].includes(id)) {
      for (let i = 0; i < 20; i++) {
        const ang = hash(i * 11, id.charCodeAt(0)) * Math.PI * 2;
        const d = 6 + hash(i * 13, id.charCodeAt(1)) * 40;
        push(Math.round(c.x + Math.cos(ang) * d), Math.round(c.y + Math.sin(ang) * d), 'ruins_pillar', i % 4);
      }
      // Stone circle
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2;
        push(Math.round(c.x + Math.cos(ang) * 14), Math.round(c.y + Math.sin(ang) * 14), 'stone_circle', i % 2);
      }
      push(c.x, c.y - 6, 'shrine', 0);
    }

    // Watchtowers + stone walls at fortresses
    if (['ironhold', 'coldpeak'].includes(id)) {
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
        push(Math.round(c.x + Math.cos(ang) * 22), Math.round(c.y + Math.sin(ang) * 22), 'watchtower', i % 2);
      }
      for (let i = 0; i < 28; i++) {
        const ang = (i / 28) * Math.PI * 2;
        push(Math.round(c.x + Math.cos(ang) * 17), Math.round(c.y + Math.sin(ang) * 17), 'stone_wall', i % 4);
      }
      push(c.x, c.y + 18, 'gate', id === 'coldpeak' ? 1 : 0);
    }

    // Docks at coastal saltmoor
    if (id === 'saltmoor') {
      for (let i = 0; i < 6; i++) {
        push(c.x - 18 + i * 5, c.y + 6 + i * 2, 'dock', i % 3);
      }
    }

    // Shrine at arcane locations
    if (['coldpeak', 'ruins_of_aether'].includes(id)) {
      push(c.x + 8, c.y - 8, 'shrine', 1);
    }
  }

  // Windmills on hills near villages
  for (const v of ['ashenford', 'graygate'] as const) {
    const c = LOCATION_COORDS[v];
    if (!c) continue;
    for (let i = 0; i < 4; i++) {
      const ang = hash(i * 17, v.charCodeAt(0) + 60) * Math.PI * 2;
      const d = 35 + hash(i * 23, v.charCodeAt(1)) * 70;
      push(Math.round(c.x + Math.cos(ang) * d), Math.round(c.y + Math.sin(ang) * d), 'windmill', i % 2);
    }
  }

  // Campfires along roads
  for (let i = 0; i < 50; i++) {
    const cx = Math.floor(hash(i * 97, 4321) * MAP_W);
    const cy = Math.floor(hash(i * 113, 8765) * MAP_H);
    if (cx < MAP_W && cy < MAP_H && roads[cy * MAP_W + cx] === 1) {
      push(cx, cy, 'campfire', 0);
    }
  }
}

// ── Entity placement ───────────────────────────────────────────────────────
function generateEntities(tiles: Uint8Array, out: AmbientEntity[]) {
  const spawn = (x: number, y: number, type: AmbientEntityType, speed: number, phase: number, radius: number) => {
    if (x >= 0 && x < MAP_W && y >= 0 && y < MAP_H) out.push({ x, y, type, speed, phase, radius });
  };

  const sample = (n: number, seed1: number, seed2: number, validCodes: number[],
                  type: AmbientEntityType, speed: [number, number], radius: number) => {
    for (let i = 0; i < n; i++) {
      const x = Math.floor(hash(i * seed1, 100 + seed2) * MAP_W);
      const y = Math.floor(hash(i * seed2, 200 + seed1) * MAP_H);
      if (x >= MAP_W || y >= MAP_H) continue;
      if (validCodes.includes(tiles[y * MAP_W + x])) {
        spawn(x, y, type,
          speed[0] + hash(i, seed1 + seed2) * (speed[1] - speed[0]),
          hash(i * 17, seed1) * Math.PI * 2,
          radius);
      }
    }
  };

  sample(100, 7,  11,  [T.FOREST, T.CLEARING],       'deer',     [0.25, 0.55], 10);
  sample(40,  19, 23,  [T.DENSE_FOREST],              'wolf',     [0.40, 0.80], 14);
  sample(80,  31, 37,  [T.GRASS, T.FARM_FIELD, T.CLEARING], 'sheep', [0.08, 0.22], 6);
  sample(60,  43, 47,  [T.CLEARING, T.GRASS],         'rabbit',   [0.70, 1.20], 5);
  sample(20,  59, 61,  [T.MOUNTAIN, T.SNOW, T.HILL],  'eagle',    [0.50, 0.90], 24);
  sample(55,  71, 73,  [T.RIVER, T.WATER],            'fish',     [0.30, 0.60], 7);
  sample(30,  83, 89,  [T.FOREST, T.CLEARING, T.HILL],'crow',     [0.60, 1.00], 18);

  // Villagers at settlements
  for (const v of ['ashenford', 'graygate', 'crossroads', 'thornwick', 'marshend', 'saltmoor']) {
    const c = LOCATION_COORDS[v];
    if (!c) continue;
    for (let i = 0; i < 10; i++) {
      spawn(
        c.x + Math.round((hash(i * 3, v.charCodeAt(0)) - 0.5) * 40),
        c.y + Math.round((hash(i * 7, v.charCodeAt(1)) - 0.5) * 40),
        'villager', 0.12 + hash(i, v.charCodeAt(0) + 50) * 0.18,
        hash(i * 11, v.charCodeAt(0)) * Math.PI * 2, 12,
      );
    }
  }

  // Fishermen near water
  sample(25, 83, 97, [T.SAND, T.RIVER], 'fisherman', [0.03, 0.07], 4);

  // Guards at fortresses
  for (const f of ['ironhold', 'coldpeak']) {
    const c = LOCATION_COORDS[f];
    if (!c) continue;
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      spawn(Math.round(c.x + Math.cos(ang) * 20), Math.round(c.y + Math.sin(ang) * 20),
        'guard', 0.18, ang, 6);
    }
  }

  // Merchants & travelers on roads
  for (let i = 0; i < 30; i++) {
    const [a, b] = CONNECTIONS[i % CONNECTIONS.length];
    const ca = LOCATION_COORDS[a], cb = LOCATION_COORDS[b];
    if (!ca || !cb) continue;
    const t = hash(i * 101, 2828);
    spawn(
      Math.round(ca.x + (cb.x - ca.x) * t),
      Math.round(ca.y + (cb.y - ca.y) * t),
      hash(i, 2929) > 0.5 ? 'merchant' : 'traveler',
      0.10 + hash(i, 3030) * 0.22,
      hash(i * 103, 3131) * Math.PI * 2, 35,
    );
  }
}

// ── Walkability ────────────────────────────────────────────────────────────
export function isWalkable(tile: TileType): boolean {
  return tile !== 'deep_water' && tile !== 'water' && tile !== 'mountain';
}

export function isWalkableCode(code: number): boolean {
  return code !== T.DEEP_WATER && code !== T.WATER && code !== T.MOUNTAIN;
}

export function tileCodeToType(code: number): TileType {
  return TILE_NAMES[code] ?? 'grass';
}
