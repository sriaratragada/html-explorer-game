import { CHUNK_SIZE, MAP_W, MAP_H, getContinentAt } from './mapGenerator';

export type RevealLevel = 0 | 1 | 2; // 0=unseen, 1=discovered, 2=bright

const NUM_CX = Math.ceil(MAP_W / CHUNK_SIZE);
const NUM_CY = Math.ceil(MAP_H / CHUNK_SIZE);

export interface FogMap {
  chunks: Uint8Array; // NUM_CX * NUM_CY, values 0/1/2
}

export function createFogMap(): FogMap {
  return { chunks: new Uint8Array(NUM_CX * NUM_CY) };
}

export function revealAroundPlayer(fog: FogMap, playerX: number, playerY: number, radius: number): FogMap {
  const next: FogMap = { chunks: new Uint8Array(fog.chunks) };
  const pcx = Math.floor(playerX / CHUNK_SIZE);
  const pcy = Math.floor(playerY / CHUNK_SIZE);
  const chunkRadius = Math.ceil(radius / CHUNK_SIZE);

  for (let dy = -chunkRadius; dy <= chunkRadius; dy++) {
    for (let dx = -chunkRadius; dx <= chunkRadius; dx++) {
      const cx = pcx + dx, cy = pcy + dy;
      if (cx < 0 || cx >= NUM_CX || cy < 0 || cy >= NUM_CY) continue;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const key = cy * NUM_CX + cx;

      if (dist <= chunkRadius * 0.5) {
        // Bright reveal
        const worldX = cx * CHUNK_SIZE + CHUNK_SIZE / 2;
        const worldY = cy * CHUNK_SIZE + CHUNK_SIZE / 2;
        const continent = getContinentAt(worldX, worldY);
        // Uloren stays dim (level 1) even in bright zone
        if (continent === 'uloren') {
          next.chunks[key] = Math.max(next.chunks[key], 1) as RevealLevel;
        } else {
          next.chunks[key] = 2;
        }
      } else if (dist <= chunkRadius) {
        next.chunks[key] = Math.max(next.chunks[key], 1) as RevealLevel;
      }
    }
  }
  return next;
}

export function revealLocation(fog: FogMap, x: number, y: number): FogMap {
  const next: FogMap = { chunks: new Uint8Array(fog.chunks) };
  const cx = Math.floor(x / CHUNK_SIZE);
  const cy = Math.floor(y / CHUNK_SIZE);
  // Reveal a 5×5 chunk area around the location
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const nx = cx + dx, ny = cy + dy;
      if (nx >= 0 && nx < NUM_CX && ny >= 0 && ny < NUM_CY) {
        next.chunks[ny * NUM_CX + nx] = Math.max(next.chunks[ny * NUM_CX + nx], 2) as RevealLevel;
      }
    }
  }
  return next;
}

export function getRevealLevel(fog: FogMap, cx: number, cy: number): RevealLevel {
  if (cx < 0 || cx >= NUM_CX || cy < 0 || cy >= NUM_CY) return 0;
  return fog.chunks[cy * NUM_CX + cx] as RevealLevel;
}

export function isChunkRevealed(fog: FogMap, cx: number, cy: number): boolean {
  return getRevealLevel(fog, cx, cy) > 0;
}
