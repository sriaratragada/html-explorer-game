import { CHUNK_SIZE, MAP_W, MAP_H, LOCATION_COORDS, getSettlementMeta } from './mapGenerator';

export type EntityKind =
  | 'boat' | 'cave_entrance' | 'resource_tree' | 'resource_rock' | 'resource_iron'
  | 'resource_herb' | 'resource_berry' | 'wolf' | 'bandit' | 'warband'
  | 'deer' | 'bear' | 'caravan' | 'army' | 'horse' | 'sheep' | 'rabbit';

export interface WorldEntity {
  id: string;
  kind: EntityKind;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  data: Record<string, unknown>;
}

// Spatial hash: key = chunkKey (cy * numChunksX + cx)
const spatialHash = new Map<number, WorldEntity[]>();
const entityById = new Map<string, WorldEntity>();
let nextId = 1;

function chunkKey(x: number, y: number): number {
  const cx = Math.floor(x / CHUNK_SIZE);
  const cy = Math.floor(y / CHUNK_SIZE);
  return cy * Math.ceil(MAP_W / CHUNK_SIZE) + cx;
}

export function spawnEntity(kind: EntityKind, x: number, y: number, data: Record<string, unknown> = {}, hp = 100): WorldEntity {
  const id = `e_${nextId++}`;
  const entity: WorldEntity = { id, kind, x, y, hp, maxHp: hp, data };
  entityById.set(id, entity);
  const key = chunkKey(x, y);
  if (!spatialHash.has(key)) spatialHash.set(key, []);
  spatialHash.get(key)!.push(entity);
  return entity;
}

export function removeEntity(id: string) {
  const entity = entityById.get(id);
  if (!entity) return;
  entityById.delete(id);
  const key = chunkKey(entity.x, entity.y);
  const arr = spatialHash.get(key);
  if (arr) {
    const idx = arr.indexOf(entity);
    if (idx !== -1) arr.splice(idx, 1);
  }
}

export function moveEntity(id: string, nx: number, ny: number) {
  const entity = entityById.get(id);
  if (!entity) return;
  const oldKey = chunkKey(entity.x, entity.y);
  const newKey = chunkKey(nx, ny);
  if (oldKey !== newKey) {
    const arr = spatialHash.get(oldKey);
    if (arr) { const idx = arr.indexOf(entity); if (idx !== -1) arr.splice(idx, 1); }
    if (!spatialHash.has(newKey)) spatialHash.set(newKey, []);
    spatialHash.get(newKey)!.push(entity);
  }
  entity.x = nx;
  entity.y = ny;
}

export function getEntitiesInChunk(cx: number, cy: number): WorldEntity[] {
  const key = cy * Math.ceil(MAP_W / CHUNK_SIZE) + cx;
  return spatialHash.get(key) ?? [];
}

export function getEntitiesNear(x: number, y: number, radius: number): WorldEntity[] {
  const results: WorldEntity[] = [];
  const minCx = Math.max(0, Math.floor((x - radius) / CHUNK_SIZE));
  const maxCx = Math.min(Math.ceil(MAP_W / CHUNK_SIZE) - 1, Math.floor((x + radius) / CHUNK_SIZE));
  const minCy = Math.max(0, Math.floor((y - radius) / CHUNK_SIZE));
  const maxCy = Math.min(Math.ceil(MAP_H / CHUNK_SIZE) - 1, Math.floor((y + radius) / CHUNK_SIZE));
  const r2 = radius * radius;
  for (let cy = minCy; cy <= maxCy; cy++) {
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (const e of getEntitiesInChunk(cx, cy)) {
        if ((e.x - x) ** 2 + (e.y - y) ** 2 <= r2) results.push(e);
      }
    }
  }
  return results;
}

export function getEntityById(id: string): WorldEntity | undefined {
  return entityById.get(id);
}

export function clearAllEntities() {
  spatialHash.clear();
  entityById.clear();
  nextId = 1;
}

// Spawn initial world entities (boats at docks, cave entrances)
export function initWorldEntities() {
  clearAllEntities();

  // Boats at ports
  for (const [locId, coord] of Object.entries(LOCATION_COORDS)) {
    const meta = getSettlementMeta(locId);
    if (meta?.type === 'port') {
      spawnEntity('boat', coord.x - 15, coord.y + 10, { docked: true, location: locId });
      spawnEntity('boat', coord.x - 10, coord.y + 12, { docked: true, location: locId });
    }
  }

  // Horses at stables near major settlements
  for (const locId of ['highmarch', 'graygate', 'korrath_citadel', 'sarnak_hold', 'brightwater', 'vell_harbor']) {
    const coord = LOCATION_COORDS[locId];
    if (coord) {
      spawnEntity('horse', coord.x + 15, coord.y + 5, { stable: locId });
      spawnEntity('horse', coord.x + 18, coord.y + 7, { stable: locId });
    }
  }

  const hash = (a: number, b: number) => {
    let h = (a * 374761393 + b * 668265263 + 42) & 0xffffffff;
    h = ((h ^ (h >> 13)) * 1274126177) & 0xffffffff;
    return (h & 0x7fffffff) / 0x7fffffff;
  };

  // Cave entrances
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(hash(i * 137, 9999) * MAP_W);
    const y = Math.floor(hash(i * 251, 8888) * MAP_H);
    if (hash(x, y) < 0.5) {
      spawnEntity('cave_entrance', x, y, { explored: false, biome: 'mountain' });
    }
  }

  // Resource nodes scattered across the world
  for (let i = 0; i < 200; i++) {
    const x = Math.floor(hash(i * 173, 3333) * MAP_W);
    const y = Math.floor(hash(i * 197, 4444) * MAP_H);
    const roll = hash(x, y + 1000);
    const kind: EntityKind = roll < 0.3 ? 'resource_tree' : roll < 0.5 ? 'resource_rock' : roll < 0.65 ? 'resource_herb' : roll < 0.8 ? 'resource_berry' : 'resource_iron';
    spawnEntity(kind, x, y, {}, 1);
  }

  // Dynamic animals (replacing static AmbientEntity)
  for (let i = 0; i < 150; i++) {
    const x = Math.floor(hash(i * 211, 5555) * MAP_W);
    const y = Math.floor(hash(i * 223, 6666) * MAP_H);
    const roll = hash(x + 7777, y);
    if (roll < 0.25) spawnEntity('deer', x, y, { behavior: 'grazing' }, 20);
    else if (roll < 0.40) spawnEntity('sheep', x, y, { behavior: 'grazing' }, 15);
    else if (roll < 0.50) spawnEntity('rabbit', x, y, { behavior: 'grazing' }, 8);
    else if (roll < 0.65) spawnEntity('wolf', x, y, { behavior: 'hunting' }, 40);
    else if (roll < 0.72) spawnEntity('bear', x, y, { behavior: 'patrol' }, 60);
    else if (roll < 0.82) spawnEntity('bandit', x, y, { behavior: 'ambush' }, 50);
  }
}

export function serializeEntities(): string {
  const all: WorldEntity[] = [];
  entityById.forEach(e => all.push(e));
  return JSON.stringify(all);
}

export function deserializeEntities(json: string) {
  clearAllEntities();
  const all: WorldEntity[] = JSON.parse(json);
  for (const e of all) {
    const entity: WorldEntity = { ...e };
    entityById.set(entity.id, entity);
    const key = chunkKey(entity.x, entity.y);
    if (!spatialHash.has(key)) spatialHash.set(key, []);
    spatialHash.get(key)!.push(entity);
    const num = parseInt(entity.id.split('_')[1]);
    if (num >= nextId) nextId = num + 1;
  }
}
