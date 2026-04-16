export const DUNGEON_W = 200;
export const DUNGEON_H = 100;

export type DungeonTile = 'air' | 'stone' | 'ore_iron' | 'ore_gold' | 'crystal' | 'exit' | 'entrance';

function dungeonHash(x: number, y: number, seed: number): number {
  let h = (x * 374761393 + y * 668265263 + seed) & 0xffffffff;
  h = ((h ^ (h >> 13)) * 1274126177) & 0xffffffff;
  return (h & 0x7fffffff) / 0x7fffffff;
}

export interface DungeonEnemy {
  id: string;
  kind: 'slime' | 'goblin' | 'bat';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  vx: number;
  vy: number;
}

export interface DungeonData {
  tiles: Uint8Array; // DUNGEON_W * DUNGEON_H
  enemies: DungeonEnemy[];
  entranceX: number;
  entranceY: number;
  exitX: number;
  exitY: number;
}

const DT = {
  AIR: 0, STONE: 1, ORE_IRON: 2, ORE_GOLD: 3, CRYSTAL: 4, EXIT: 5, ENTRANCE: 6,
} as const;

export const DUNGEON_TILE_NAMES: DungeonTile[] = ['air', 'stone', 'ore_iron', 'ore_gold', 'crystal', 'exit', 'entrance'];

export function generateDungeon(caveId: number, continent: string): DungeonData {
  const seed = caveId * 12345 + continent.charCodeAt(0) * 67890;
  const tiles = new Uint8Array(DUNGEON_W * DUNGEON_H);
  tiles.fill(DT.STONE);

  // Cellular automata: start with ~45% air
  const temp = new Uint8Array(DUNGEON_W * DUNGEON_H);
  for (let y = 0; y < DUNGEON_H; y++) {
    for (let x = 0; x < DUNGEON_W; x++) {
      if (x === 0 || x === DUNGEON_W - 1 || y === 0 || y === DUNGEON_H - 1) continue;
      if (dungeonHash(x, y, seed) < 0.45) tiles[y * DUNGEON_W + x] = DT.AIR;
    }
  }

  // 4 iterations of smoothing
  for (let iter = 0; iter < 4; iter++) {
    temp.set(tiles);
    for (let y = 1; y < DUNGEON_H - 1; y++) {
      for (let x = 1; x < DUNGEON_W - 1; x++) {
        let walls = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (temp[(y + dy) * DUNGEON_W + (x + dx)] !== DT.AIR) walls++;
          }
        }
        tiles[y * DUNGEON_W + x] = walls >= 5 ? DT.STONE : DT.AIR;
      }
    }
  }

  // Place ore veins
  for (let i = 0; i < 30; i++) {
    const ox = Math.floor(dungeonHash(i * 137, seed + 1) * DUNGEON_W);
    const oy = Math.floor(dungeonHash(i * 251, seed + 2) * DUNGEON_H);
    if (tiles[oy * DUNGEON_W + ox] !== DT.STONE) continue;
    const oreType = continent === 'korrath' || dungeonHash(i, seed + 3) < 0.6 ? DT.ORE_IRON
      : dungeonHash(i, seed + 4) < 0.8 ? DT.ORE_GOLD : DT.CRYSTAL;
    // Small vein cluster
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = ox + dx, ny = oy + dy;
        if (nx > 0 && nx < DUNGEON_W - 1 && ny > 0 && ny < DUNGEON_H - 1) {
          if (tiles[ny * DUNGEON_W + nx] === DT.STONE && dungeonHash(nx + dy, ny + dx + seed) < 0.5) {
            tiles[ny * DUNGEON_W + nx] = oreType;
          }
        }
      }
    }
  }

  // Find entrance (top-left area) and exit (bottom-right area)
  let entranceX = 5, entranceY = 5;
  let exitX = DUNGEON_W - 10, exitY = DUNGEON_H - 10;
  for (let y = 3; y < 20; y++) {
    for (let x = 3; x < 30; x++) {
      if (tiles[y * DUNGEON_W + x] === DT.AIR) { entranceX = x; entranceY = y; break; }
    }
    if (tiles[entranceY * DUNGEON_W + entranceX] === DT.AIR) break;
  }
  for (let y = DUNGEON_H - 5; y > DUNGEON_H - 20; y--) {
    for (let x = DUNGEON_W - 5; x > DUNGEON_W - 40; x--) {
      if (tiles[y * DUNGEON_W + x] === DT.AIR) { exitX = x; exitY = y; break; }
    }
    if (tiles[exitY * DUNGEON_W + exitX] === DT.AIR) break;
  }

  // Carve entrance and exit platforms
  for (let dx = -2; dx <= 2; dx++) {
    tiles[entranceY * DUNGEON_W + entranceX + dx] = DT.AIR;
    tiles[(entranceY + 1) * DUNGEON_W + entranceX + dx] = DT.STONE; // floor
  }
  tiles[entranceY * DUNGEON_W + entranceX] = DT.ENTRANCE;

  for (let dx = -2; dx <= 2; dx++) {
    tiles[exitY * DUNGEON_W + exitX + dx] = DT.AIR;
    tiles[(exitY + 1) * DUNGEON_W + exitX + dx] = DT.STONE;
  }
  tiles[exitY * DUNGEON_W + exitX] = DT.EXIT;

  // Spawn enemies
  const enemies: DungeonEnemy[] = [];
  let enemyId = 0;
  for (let i = 0; i < 15; i++) {
    const ex = Math.floor(dungeonHash(i * 97 + 111, seed + 5) * DUNGEON_W);
    const ey = Math.floor(dungeonHash(i * 113 + 222, seed + 6) * DUNGEON_H);
    if (tiles[ey * DUNGEON_W + ex] !== DT.AIR) continue;
    const kindRoll = dungeonHash(i, seed + 7);
    const kind: DungeonEnemy['kind'] = kindRoll < 0.4 ? 'slime' : kindRoll < 0.75 ? 'goblin' : 'bat';
    const hp = kind === 'slime' ? 20 : kind === 'goblin' ? 35 : 15;
    enemies.push({ id: `de_${enemyId++}`, kind, x: ex, y: ey, hp, maxHp: hp, vx: 0, vy: 0 });
  }

  return { tiles, enemies, entranceX, entranceY, exitX, exitY };
}
