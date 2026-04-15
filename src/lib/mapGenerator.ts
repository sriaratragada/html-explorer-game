import { Season } from './gameTypes';

// ── Deterministic noise ────────────────────────────────────────────────────
export const SEED = 1337;

export function hash(x: number, y: number, s: number = SEED): number {
  let h = (x * 374761393 + y * 668265263 + s) & 0xffffffff;
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

export function fbm(x: number, y: number, octaves = 4): number {
  let v = 0, a = 1, f = 1, max = 0;
  for (let i = 0; i < octaves; i++) {
    v += smoothNoise(x * f, y * f) * a;
    max += a; a *= 0.5; f *= 2;
  }
  return v / max;
}

// ── Tile types ─────────────────────────────────────────────────────────────
export type TileType =
  | 'deep_water' | 'water' | 'sand' | 'grass' | 'forest'
  | 'dense_forest' | 'hill' | 'mountain' | 'snow' | 'swamp'
  | 'ruins' | 'road' | 'river' | 'clearing' | 'farm_field';

export const T = {
  DEEP_WATER: 0, WATER: 1, SAND: 2, GRASS: 3, FOREST: 4,
  DENSE_FOREST: 5, HILL: 6, MOUNTAIN: 7, SNOW: 8, SWAMP: 9,
  RUINS: 10, ROAD: 11, RIVER: 12, CLEARING: 13, FARM_FIELD: 14,
} as const;

export const TILE_NAMES: TileType[] = [
  'deep_water', 'water', 'sand', 'grass', 'forest',
  'dense_forest', 'hill', 'mountain', 'snow', 'swamp',
  'ruins', 'road', 'river', 'clearing', 'farm_field',
];

// ── Map dimensions ─────────────────────────────────────────────────────────
export const MAP_W = 10000;
export const MAP_H = 10000;
export const TILE_SIZE = 5;
export const CHUNK_SIZE = 64;
export const NUM_CHUNKS_X = Math.ceil(MAP_W / CHUNK_SIZE);
export const NUM_CHUNKS_Y = Math.ceil(MAP_H / CHUNK_SIZE);

// ── Continents ─────────────────────────────────────────────────────────────
export type ContinentId = 'auredia' | 'trivalen' | 'uloren';

export interface Continent {
  id: ContinentId;
  name: string;
  cx: number; cy: number; rx: number; ry: number;
  loreBlurb: string;
}

export const CONTINENTS: Continent[] = [
  { id: 'auredia',  name: 'Auredia',  cx: 2000, cy: 5000, rx: 1700, ry: 3600,
    loreBlurb: 'The Grand Kingdom of Auredia. One crown, one banner, one road web.' },
  { id: 'trivalen', name: 'Trivalen', cx: 5700, cy: 5000, rx: 1700, ry: 3700,
    loreBlurb: 'Three kingdoms tear at each other across the contested plains.' },
  { id: 'uloren',   name: 'Uloren',   cx: 9000, cy: 5000, rx: 900,  ry: 4000,
    loreBlurb: 'Mist-shrouded and unmapped. Few who walk it return with a straight story.' },
];

export function continentAt(x: number, y: number): ContinentId | null {
  for (const c of CONTINENTS) {
    const dx = (x - c.cx) / c.rx, dy = (y - c.cy) / c.ry;
    if (dx * dx + dy * dy < 1) return c.id;
  }
  return null;
}

// Landmass mask: 1 if land, 0 if sea. Uses ellipse + noise distortion.
function landMask(x: number, y: number): number {
  for (const c of CONTINENTS) {
    const dx = (x - c.cx) / c.rx, dy = (y - c.cy) / c.ry;
    const d = Math.sqrt(dx * dx + dy * dy);
    const edge = 1 + (fbm(x * 0.0008, y * 0.0008, 3) - 0.5) * 0.35;
    if (d < edge) {
      return Math.max(0, Math.min(1, (edge - d) / 0.2));
    }
  }
  return 0;
}

// ── Kingdoms & settlements ─────────────────────────────────────────────────
export type KingdomId =
  | 'auredia'        // one kingdom on Auredia
  | 'korrath' | 'vell' | 'sarnak'  // three on Trivalen
  | 'none';

export interface Kingdom {
  id: KingdomId;
  name: string;
  continent: ContinentId;
  capital: string;
  color: string;        // banner color
  secondary: string;    // secondary banner
  motto: string;
}

export const KINGDOMS: Record<KingdomId, Kingdom> = {
  auredia:  { id: 'auredia',  name: 'Kingdom of Auredia',    continent: 'auredia',  capital: 'highmarch', color: '#2a5fb0', secondary: '#e4c86a', motto: 'One crown, one realm.' },
  korrath:  { id: 'korrath',  name: 'Kingdom of Korrath',    continent: 'trivalen', capital: 'korrath_keep', color: '#6a2a2a', secondary: '#c0a050', motto: 'The mountain does not yield.' },
  vell:     { id: 'vell',     name: 'Kingdom of Vell',       continent: 'trivalen', capital: 'vell_harbor', color: '#2a7050', secondary: '#e8e0a0', motto: 'Grain feeds the sword.' },
  sarnak:   { id: 'sarnak',   name: 'Sarnak Steppe-Lords',   continent: 'trivalen', capital: 'sarnak_hold', color: '#b07028', secondary: '#2a1810', motto: 'The wind follows the horse.' },
  none:     { id: 'none',     name: 'Unclaimed',             continent: 'uloren',   capital: '', color: '#555', secondary: '#888', motto: '' },
};

export type SettlementType = 'capital' | 'castle' | 'city' | 'town' | 'village' | 'ruins' | 'port' | 'camp';

export interface Settlement {
  id: string;
  name: string;
  type: SettlementType;
  kingdom: KingdomId;
  continent: ContinentId;
  x: number; y: number;
  garrison: number;
  houseName?: string;
  description: string;
  hasMarket: boolean;
  hasBountyBoard: boolean;
  hasDock: boolean;
  hasInn: boolean;
}

export const SETTLEMENTS: Settlement[] = [
  // ═══ Auredia — The Grand Kingdom ═══════════════════════════════════════
  { id: 'highmarch',       name: 'Highmarch',              type: 'capital', kingdom: 'auredia', continent: 'auredia', x: 2000, y: 4800, garrison: 400, houseName: 'House Auren', description: 'The royal capital. Four walled districts, a cathedral, and the Sun Throne.', hasMarket: true, hasBountyBoard: true, hasDock: false, hasInn: true },
  { id: 'goldport',        name: 'Goldport',               type: 'port',    kingdom: 'auredia', continent: 'auredia', x: 700,  y: 5400, garrison: 80,  houseName: 'House Wavekeep', description: "Auredia's seaward gate. Boats depart for every coast.", hasMarket: true, hasBountyBoard: true, hasDock: true, hasInn: true },
  { id: 'rivergate',       name: 'Rivergate',              type: 'town',    kingdom: 'auredia', continent: 'auredia', x: 1600, y: 5900, garrison: 40,  description: 'A bridge-town at the Alder crossing.', hasMarket: true, hasBountyBoard: false, hasDock: true, hasInn: true },
  { id: 'oakenfield',      name: 'Oakenfield',             type: 'town',    kingdom: 'auredia', continent: 'auredia', x: 2500, y: 5500, garrison: 30,  description: 'Breadbasket town ringed by oak groves.', hasMarket: true, hasBountyBoard: false, hasDock: false, hasInn: true },
  { id: 'stonehelm',       name: 'Castle Stonehelm',       type: 'castle',  kingdom: 'auredia', continent: 'auredia', x: 1200, y: 4200, garrison: 120, houseName: 'House Stonehelm', description: 'A grey fortress guarding the western pass.', hasMarket: false, hasBountyBoard: true, hasDock: false, hasInn: false },
  { id: 'highwind',        name: 'Castle Highwind',        type: 'castle',  kingdom: 'auredia', continent: 'auredia', x: 2700, y: 4100, garrison: 110, houseName: 'House Highwind', description: 'A cliffside bastion overlooking the plains.', hasMarket: false, hasBountyBoard: true, hasDock: false, hasInn: false },
  { id: 'brightvale',      name: 'Castle Brightvale',      type: 'castle',  kingdom: 'auredia', continent: 'auredia', x: 3200, y: 5200, garrison: 100, houseName: 'House Brightvale', description: 'Sun-banners on white stone. The eastern marches.', hasMarket: false, hasBountyBoard: true, hasDock: false, hasInn: false },
  { id: 'ashenford',       name: 'Ashenford',              type: 'village', kingdom: 'auredia', continent: 'auredia', x: 2100, y: 6200, garrison: 6,   description: 'A farming village on the fertile plains.', hasMarket: true, hasBountyBoard: false, hasDock: false, hasInn: true },
  { id: 'millbrook',       name: 'Millbrook',              type: 'village', kingdom: 'auredia', continent: 'auredia', x: 1500, y: 5100, garrison: 4, description: 'Three mills turn on the river.', hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: false },
  { id: 'redleaf',         name: 'Redleaf',                type: 'village', kingdom: 'auredia', continent: 'auredia', x: 2900, y: 6000, garrison: 5, description: 'An autumn-colored hamlet under the maples.', hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: false },
  { id: 'fairhollow',      name: 'Fairhollow',             type: 'village', kingdom: 'auredia', continent: 'auredia', x: 1900, y: 3800, garrison: 4, description: 'Ringed by stone walls older than the crown.', hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: false },
  { id: 'greycrag',        name: 'Greycrag',               type: 'village', kingdom: 'auredia', continent: 'auredia', x: 900,  y: 4700, garrison: 6, description: 'A rocky village of stubborn quarriers.', hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: false },
  { id: 'thistledown',     name: 'Thistledown',            type: 'village', kingdom: 'auredia', continent: 'auredia', x: 3300, y: 4400, garrison: 3, description: 'Sheep farmers and good wool.', hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: false },
  { id: 'oldferry',        name: 'Oldferry',               type: 'village', kingdom: 'auredia', continent: 'auredia', x: 1200, y: 5800, garrison: 3, description: 'River ferry crossing. Nothing fancy.', hasMarket: false, hasBountyBoard: false, hasDock: true, hasInn: false },
  { id: 'auren_ruins',     name: 'The Drowned Spires',     type: 'ruins',   kingdom: 'auredia', continent: 'auredia', x: 700,  y: 3400, garrison: 0, description: "Tilted towers half-sunk in a marsh. Older than the kingdom.", hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: false },

  // ═══ Trivalen — The Warring Continent ═══════════════════════════════════
  // Korrath (north, mountains)
  { id: 'korrath_keep',    name: 'Korrath Keep',           type: 'capital', kingdom: 'korrath', continent: 'trivalen', x: 5700, y: 3000, garrison: 300, description: 'An iron-banded fortress carved into the grey peaks.', hasMarket: true, hasBountyBoard: true, hasDock: false, hasInn: true },
  { id: 'iron_reach',      name: 'Iron Reach',             type: 'castle',  kingdom: 'korrath', continent: 'trivalen', x: 5200, y: 3700, garrison: 80,  description: 'Frontier castle of iron-mining banners.', hasMarket: false, hasBountyBoard: true, hasDock: false, hasInn: false },
  { id: 'grimstone',       name: 'Grimstone',              type: 'castle',  kingdom: 'korrath', continent: 'trivalen', x: 6300, y: 3600, garrison: 75, description: "Korrath's eastern watch against Sarnak.", hasMarket: false, hasBountyBoard: true, hasDock: false, hasInn: false },
  { id: 'blackvein',       name: 'Blackvein',              type: 'town',    kingdom: 'korrath', continent: 'trivalen', x: 5500, y: 2400, garrison: 30, description: 'A coal and iron town.', hasMarket: true, hasBountyBoard: false, hasDock: false, hasInn: true },
  { id: 'coldhearth',      name: 'Coldhearth',             type: 'village', kingdom: 'korrath', continent: 'trivalen', x: 6000, y: 2700, garrison: 5, description: 'A tough mountain village.', hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: false },
  { id: 'grayslope',       name: 'Grayslope',              type: 'village', kingdom: 'korrath', continent: 'trivalen', x: 5100, y: 3200, garrison: 4, description: 'Goats and granite.', hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: false },

  // Vell (south, coast + grain)
  { id: 'vell_harbor',     name: 'Vell Harbor',            type: 'capital', kingdom: 'vell',    continent: 'trivalen', x: 5100, y: 6800, garrison: 280, description: 'Sea-green banners over the Vell royal port.', hasMarket: true, hasBountyBoard: true, hasDock: true, hasInn: true },
  { id: 'greenmarch',      name: 'Greenmarch',             type: 'castle',  kingdom: 'vell',    continent: 'trivalen', x: 5700, y: 6300, garrison: 90,  description: 'A grain-castle of the Vell marches.', hasMarket: false, hasBountyBoard: true, hasDock: false, hasInn: false },
  { id: 'tidestone',       name: 'Tidestone',              type: 'castle',  kingdom: 'vell',    continent: 'trivalen', x: 4600, y: 6400, garrison: 80,  description: 'Coast-watch of Vell.', hasMarket: false, hasBountyBoard: true, hasDock: true, hasInn: false },
  { id: 'wheatport',       name: 'Wheatport',              type: 'town',    kingdom: 'vell',    continent: 'trivalen', x: 5400, y: 7200, garrison: 35, description: 'Grain-barges and merchant ships.', hasMarket: true, hasBountyBoard: false, hasDock: true, hasInn: true },
  { id: 'clearwater',      name: 'Clearwater',             type: 'village', kingdom: 'vell',    continent: 'trivalen', x: 4800, y: 7000, garrison: 4, description: 'A fishing village with clear well-water.', hasMarket: false, hasBountyBoard: false, hasDock: true, hasInn: false },
  { id: 'goldfield',       name: 'Goldfield',              type: 'village', kingdom: 'vell',    continent: 'trivalen', x: 5900, y: 6900, garrison: 5, description: 'Endless wheat in high summer.', hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: false },

  // Sarnak (east, steppe + cavalry)
  { id: 'sarnak_hold',     name: 'Sarnak Hold',            type: 'capital', kingdom: 'sarnak',  continent: 'trivalen', x: 6800, y: 5000, garrison: 320, description: 'A hill-ringed cavalry capital. Horsehair banners.', hasMarket: true, hasBountyBoard: true, hasDock: false, hasInn: true },
  { id: 'windspire',       name: 'Windspire',              type: 'castle',  kingdom: 'sarnak',  continent: 'trivalen', x: 6400, y: 4300, garrison: 85, description: 'A tall watchtower on the steppe.', hasMarket: false, hasBountyBoard: true, hasDock: false, hasInn: false },
  { id: 'dustmere',        name: 'Dustmere',               type: 'castle',  kingdom: 'sarnak',  continent: 'trivalen', x: 7100, y: 5700, garrison: 75, description: 'Fortress of the southern horse-lords.', hasMarket: false, hasBountyBoard: true, hasDock: false, hasInn: false },
  { id: 'redgrass',        name: 'Redgrass',               type: 'town',    kingdom: 'sarnak',  continent: 'trivalen', x: 6700, y: 5600, garrison: 30, description: 'Horse-market town on the red steppe.', hasMarket: true, hasBountyBoard: false, hasDock: false, hasInn: true },
  { id: 'longwind',        name: 'Longwind',               type: 'village', kingdom: 'sarnak',  continent: 'trivalen', x: 7200, y: 4500, garrison: 5, description: 'A wind-swept steppe village.', hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: false },

  // Contested middle
  { id: 'ravenfall',       name: 'Ravenfall',              type: 'ruins',   kingdom: 'none',    continent: 'trivalen', x: 6000, y: 4700, garrison: 0, description: 'A burned castle, its banners torn between three crowns.', hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: false },
  { id: 'old_bridge',      name: 'The Old Bridge',         type: 'camp',    kingdom: 'none',    continent: 'trivalen', x: 5800, y: 5200, garrison: 20, description: 'A bridge camp that changes hands by the season.', hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: true },
  { id: 'battleplain',     name: 'Battleplain Barrows',    type: 'ruins',   kingdom: 'none',    continent: 'trivalen', x: 6100, y: 5400, garrison: 0, description: 'The burial mounds of three generations of war.', hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: false },

  // ═══ Uloren — The Unexplored ═══════════════════════════════════════════
  { id: 'mistward',        name: 'Mistward',               type: 'village', kingdom: 'none',    continent: 'uloren',   x: 8400, y: 4500, garrison: 3, description: 'The first village past the mist. Strangers stay one night.', hasMarket: true, hasBountyBoard: false, hasDock: true, hasInn: true },
  { id: 'quiet_harbor',    name: 'Quiet Harbor',           type: 'port',    kingdom: 'none',    continent: 'uloren',   x: 8300, y: 5800, garrison: 4, description: 'A pale-stone dock built by no one living.', hasMarket: false, hasBountyBoard: false, hasDock: true, hasInn: false },
  { id: 'thornfold',       name: 'Thornfold',              type: 'village', kingdom: 'none',    continent: 'uloren',   x: 9000, y: 3500, garrison: 2, description: 'Hemmed in by black thorns. Lanterns never go out.', hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: false },
  { id: 'mossgate',        name: 'Mossgate',               type: 'village', kingdom: 'none',    continent: 'uloren',   x: 8700, y: 6400, garrison: 3, description: 'A village that grew up through a stone archway.', hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: false },
  { id: 'silent_hold',     name: 'The Silent Hold',        type: 'village', kingdom: 'none',    continent: 'uloren',   x: 9300, y: 5000, garrison: 2, description: 'They speak only in whispers and only at noon.', hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: false },
  { id: 'stonewake',       name: 'Stonewake',              type: 'village', kingdom: 'none',    continent: 'uloren',   x: 8900, y: 7400, garrison: 2, description: 'Built among standing stones that hum at dusk.', hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: false },
  { id: 'grey_monoliths',  name: 'The Grey Monoliths',     type: 'ruins',   kingdom: 'none',    continent: 'uloren',   x: 9100, y: 4200, garrison: 0, description: 'Forty-nine stones in a spiral. The spiral turns.', hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: false },
  { id: 'hollow_tree',     name: 'The Hollow Tree',        type: 'ruins',   kingdom: 'none',    continent: 'uloren',   x: 9400, y: 6500, garrison: 0, description: 'A tree the size of a cathedral, hollow inside. Something lives in it.', hasMarket: false, hasBountyBoard: false, hasDock: false, hasInn: false },
];

// Quick lookups
export const SETTLEMENT_BY_ID: Record<string, Settlement> = Object.fromEntries(SETTLEMENTS.map(s => [s.id, s]));
export const LOCATION_COORDS: Record<string, { x: number; y: number }> = Object.fromEntries(
  SETTLEMENTS.map(s => [s.id, { x: s.x, y: s.y }])
);

// Dock coordinates for spawning boats
export const DOCK_COORDS: { x: number; y: number; id: string }[] = SETTLEMENTS.filter(s => s.hasDock).map(s => ({ x: s.x, y: s.y, id: s.id }));

// ── Roads ──────────────────────────────────────────────────────────────────
// Auredia: dense network. Trivalen: per-kingdom + some contested. Uloren: none.
export const ROAD_CONNECTIONS: [string, string][] = [
  // Auredia core network
  ['highmarch', 'goldport'], ['highmarch', 'oakenfield'], ['highmarch', 'rivergate'],
  ['highmarch', 'stonehelm'], ['highmarch', 'highwind'], ['highmarch', 'brightvale'],
  ['goldport', 'rivergate'], ['rivergate', 'oakenfield'], ['oakenfield', 'ashenford'],
  ['oakenfield', 'redleaf'], ['oakenfield', 'brightvale'], ['stonehelm', 'greycrag'],
  ['stonehelm', 'millbrook'], ['millbrook', 'highmarch'], ['highwind', 'fairhollow'],
  ['brightvale', 'thistledown'], ['rivergate', 'oldferry'], ['oldferry', 'ashenford'],
  // Korrath
  ['korrath_keep', 'iron_reach'], ['korrath_keep', 'grimstone'], ['korrath_keep', 'blackvein'],
  ['iron_reach', 'grayslope'], ['grimstone', 'coldhearth'], ['blackvein', 'coldhearth'],
  // Vell
  ['vell_harbor', 'greenmarch'], ['vell_harbor', 'tidestone'], ['vell_harbor', 'wheatport'],
  ['greenmarch', 'goldfield'], ['tidestone', 'clearwater'], ['wheatport', 'goldfield'],
  // Sarnak
  ['sarnak_hold', 'windspire'], ['sarnak_hold', 'dustmere'], ['sarnak_hold', 'redgrass'],
  ['windspire', 'longwind'], ['redgrass', 'dustmere'],
  // Contested (partial roads)
  ['iron_reach', 'old_bridge'], ['greenmarch', 'old_bridge'], ['windspire', 'old_bridge'],
];

// ── Lazy chunked tile generation ───────────────────────────────────────────
const chunkCache = new Map<number, Uint8Array>();
const MAX_CACHE = 1024;

function baseTile(x: number, y: number): number {
  const land = landMask(x, y);
  if (land <= 0) return T.DEEP_WATER;
  if (land < 0.12) return T.WATER;
  if (land < 0.18) return T.SAND;

  const cont = continentAt(x, y);
  const elev = fbm(x * 0.0012, y * 0.0012, 4);
  const moist = fbm(x * 0.0020 + 500, y * 0.0020 + 500, 3);
  const rough = fbm(x * 0.004 + 900, y * 0.004 + 300, 3);

  // Continent-specific biome biasing
  if (cont === 'auredia') {
    // Temperate: plains, oak forest, rivers, some hills
    if (elev > 0.70) return T.MOUNTAIN;
    if (elev > 0.60) return T.HILL;
    if (moist > 0.62) return T.FOREST;
    if (moist > 0.55) return T.GRASS;
    return T.GRASS;
  }
  if (cont === 'trivalen') {
    // Warring continent: mountains north, coastal south, steppe east
    const ny = y - 5000;
    if (ny < -1200 && elev > 0.55) return T.MOUNTAIN;
    if (ny < -800 && elev > 0.50) return T.HILL;
    if (ny > 1200 && moist > 0.55) return T.GRASS;
    if (x > 6600 && elev < 0.55) return T.GRASS; // steppe
    if (elev > 0.68) return T.MOUNTAIN;
    if (elev > 0.58) return T.HILL;
    if (moist > 0.60) return T.FOREST;
    return T.GRASS;
  }
  if (cont === 'uloren') {
    // Mystery: dense forest, swamp, cliffs
    if (elev > 0.72) return T.MOUNTAIN;
    if (elev > 0.60) return T.HILL;
    if (moist > 0.70 && rough > 0.55) return T.SWAMP;
    if (moist > 0.55) return T.DENSE_FOREST;
    if (moist > 0.45) return T.FOREST;
    return T.CLEARING;
  }
  return T.GRASS;
}

// Settlement stamping (fast spatial check)
interface Stamp { x: number; y: number; r: number; tile: number; }
const SETTLEMENT_STAMPS: Stamp[] = SETTLEMENTS.map(s => ({
  x: s.x, y: s.y,
  r: s.type === 'capital' ? 40 : s.type === 'city' ? 30 : s.type === 'castle' ? 22 : s.type === 'town' ? 18 : s.type === 'ruins' ? 15 : 12,
  tile: s.type === 'ruins' ? T.RUINS : T.GRASS,
}));

function stampedTile(x: number, y: number, base: number): number {
  for (const s of SETTLEMENT_STAMPS) {
    const dx = x - s.x, dy = y - s.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < s.r * s.r) {
      if (s.tile === T.RUINS) return T.RUINS;
      // inner radius = paved/cleared
      if (d2 < (s.r * 0.55) * (s.r * 0.55)) return T.ROAD;
      return s.tile;
    }
  }
  return base;
}

// Precomputed road bitmap along connection lines (thin corridor stored in a Set).
const ROAD_TILES: Set<number> = (() => {
  const s = new Set<number>();
  const addLine = (x0: number, y0: number, x1: number, y1: number) => {
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let x = x0, y = y0;
    for (let i = 0; i < 20000; i++) {
      s.add(y * MAP_W + x);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 < dx)  { err += dx; y += sy; }
    }
  };
  for (const [a, b] of ROAD_CONNECTIONS) {
    const ca = LOCATION_COORDS[a], cb = LOCATION_COORDS[b];
    if (!ca || !cb) continue;
    addLine(ca.x, ca.y, cb.x, cb.y);
  }
  return s;
})();

export function isRoadTile(x: number, y: number): boolean {
  return ROAD_TILES.has(y * MAP_W + x);
}

export function getTile(x: number, y: number): number {
  if (x < 0 || x >= MAP_W || y < 0 || y >= MAP_H) return T.DEEP_WATER;
  // Road overlay (only on land)
  const base = baseTile(x, y);
  const stamped = stampedTile(x, y, base);
  if (stamped === T.DEEP_WATER || stamped === T.WATER) return stamped;
  if (ROAD_TILES.has(y * MAP_W + x)) return T.ROAD;
  return stamped;
}

export function getChunk(cx: number, cy: number): Uint8Array {
  const key = cy * NUM_CHUNKS_X + cx;
  const cached = chunkCache.get(key);
  if (cached) return cached;
  const buf = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);
  const bx = cx * CHUNK_SIZE, by = cy * CHUNK_SIZE;
  for (let ly = 0; ly < CHUNK_SIZE; ly++) {
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      buf[ly * CHUNK_SIZE + lx] = getTile(bx + lx, by + ly);
    }
  }
  if (chunkCache.size >= MAX_CACHE) {
    // drop first entry
    const first = chunkCache.keys().next().value;
    if (first !== undefined) chunkCache.delete(first);
  }
  chunkCache.set(key, buf);
  return buf;
}

export function invalidateChunks() { chunkCache.clear(); }

// ── Walkability ────────────────────────────────────────────────────────────
export function isWalkableCode(code: number): boolean {
  return code !== T.DEEP_WATER && code !== T.WATER && code !== T.MOUNTAIN;
}
export function isWaterCode(code: number): boolean {
  return code === T.DEEP_WATER || code === T.WATER;
}
export function isWalkable(tile: TileType): boolean {
  return tile !== 'deep_water' && tile !== 'water' && tile !== 'mountain';
}
export function tileCodeToType(code: number): TileType {
  return TILE_NAMES[code] ?? 'grass';
}

// ── Colour palettes ────────────────────────────────────────────────────────
const HEX_PALETTES: Record<Season, string[]> = {
  thaw: [
    '#1a3a5c','#2a5a7c','#c4a86c','#5a7a4a',
    '#3a5a2a','#2a4a1a','#6a6a5a','#5a5a5a',
    '#d0d8e0','#3a4a3a','#5a4a3a','#a89060',
    '#3a6a8c','#7a9a5a','#b8a060',
  ],
  summer: [
    '#1a3060','#2a5585','#d4b87c','#4a8a3a',
    '#2a6a1a','#1a5a0a','#7a7a5a','#6a6a6a',
    '#e8e8f0','#2a5a2a','#6a5a4a','#b89060',
    '#2a5a90','#6aaa4a','#c8b070',
  ],
  harvest: [
    '#1a3050','#2a4a6a','#c4a05a','#8a7a3a',
    '#6a5a1a','#5a4a0a','#7a6a4a','#5a5050',
    '#d0c8c0','#4a4a2a','#5a4030','#a87840',
    '#2a4a70','#9a8a3a','#a08030',
  ],
  dark: [
    '#0a1a30','#1a3050','#8a7a5a','#3a4a3a',
    '#2a3a2a','#1a2a1a','#4a4a4a','#3a3a3a',
    '#c0c8d8','#2a2a2a','#3a3028','#6a5430',
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
export function getRoadColor(season: Season): string {
  return HEX_PALETTES[season][T.ROAD];
}

// ── Legacy compatibility ───────────────────────────────────────────────────
// Some older code calls generateWorldMap(); return a light facade.
export interface WorldMap {
  getTile: (x: number, y: number) => number;
  getChunk: (cx: number, cy: number) => Uint8Array;
  invalidate: () => void;
}

export function generateWorldMap(): WorldMap {
  return { getTile, getChunk, invalidate: invalidateChunks };
}
