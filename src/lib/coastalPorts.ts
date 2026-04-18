import {
  sampleBaseTerrainCode,
  MAP_W,
  MAP_H,
  getContinentAt,
  getSettlementMeta,
  LOCATION_COORDS,
  getWorldSeed,
  type ContinentId,
} from './mapGenerator';

const T = { SAND: 2, WATER: 1, DEEP_WATER: 0 } as const;

export interface CoastalPortMarker {
  x: number;
  y: number;
  continent: ContinentId;
}

let cachedSeed = -1;
let cachedMarkers: CoastalPortMarker[] = [];

function landNeighborCodes(code: number): boolean {
  return (
    code !== T.DEEP_WATER &&
    code !== T.WATER &&
    code !== T.SAND &&
    code !== T.RIVER
  );
}

function waterNeighborCodes(code: number): boolean {
  return code === T.DEEP_WATER || code === T.WATER;
}

/** True if (x,y) is beach sand touching both land and sea (base terrain). */
function isCoastalSandCandidate(x: number, y: number): boolean {
  if (x < 2 || x >= MAP_W - 2 || y < 2 || y >= MAP_H - 2) return false;
  const center = sampleBaseTerrainCode(x, y);
  if (center !== T.SAND) return false;
  let hasLand = false;
  let hasWater = false;
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (dx === 0 && dy === 0) continue;
      const c = sampleBaseTerrainCode(x + dx, y + dy);
      if (landNeighborCodes(c)) hasLand = true;
      if (waterNeighborCodes(c)) hasWater = true;
      if (hasLand && hasWater) return true;
    }
  }
  return false;
}

function minDistToSettlements(x: number, y: number): number {
  let dMin = Infinity;
  for (const [id, c] of Object.entries(LOCATION_COORDS)) {
    const meta = getSettlementMeta(id);
    const pad = (meta?.biomeRadius ?? 45) + 80;
    const d = Math.hypot(x - c.x, y - c.y) - pad;
    dMin = Math.min(dMin, d);
  }
  return dMin;
}

function hash2(a: number, b: number, salt: number): number {
  let h = (a * 374761393 + b * 668265263 + salt + getWorldSeed() * 1009) & 0xffffffff;
  h = ((h ^ (h >> 13)) * 1274126177) & 0xffffffff;
  h = ((h ^ (h >> 16)) * 1911520717) & 0xffffffff;
  return (h & 0x7fffffff) / 0x7fffffff;
}

function discoverForContinent(continent: ContinentId, targetCount: number, minSpacing: number): CoastalPortMarker[] {
  const candidates: { x: number; y: number; score: number }[] = [];
  const stride = 26;
  for (let y = stride; y < MAP_H - stride; y += stride) {
    for (let x = stride; x < MAP_W - stride; x += stride) {
      if (getContinentAt(x, y) !== continent) continue;
      if (!isCoastalSandCandidate(x, y)) continue;
      const md = minDistToSettlements(x, y);
      if (md < 0) continue;
      const score = md + hash2(x, y, 90210) * 40;
      candidates.push({ x, y, score });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  const chosen: CoastalPortMarker[] = [];
  for (const c of candidates) {
    if (chosen.length >= targetCount) break;
    if (chosen.some(p => Math.hypot(p.x - c.x, p.y - c.y) < minSpacing)) continue;
    chosen.push({ x: c.x, y: c.y, continent });
  }
  return chosen;
}

function recomputeMarkers(): CoastalPortMarker[] {
  const per: Record<ContinentId, number> = { auredia: 8, trivalen: 8, uloren: 5 };
  const minSpacing = 420;
  const out: CoastalPortMarker[] = [];
  for (const cont of ['auredia', 'trivalen', 'uloren'] as ContinentId[]) {
    out.push(...discoverForContinent(cont, per[cont], minSpacing));
  }
  return out;
}

/** Landmark-only coastal sites (not in LOCATIONS). Lazily recomputed when world seed changes. */
export function getCoastalPortMarkers(): CoastalPortMarker[] {
  const s = getWorldSeed();
  if (s !== cachedSeed) {
    cachedSeed = s;
    cachedMarkers = recomputeMarkers();
  }
  return cachedMarkers;
}
