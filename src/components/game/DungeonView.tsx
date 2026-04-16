import { useEffect, useRef, useState } from 'react';
import { generateDungeon, DUNGEON_W, DUNGEON_H, DUNGEON_TILE_NAMES, DungeonData, DungeonEnemy } from '@/lib/dungeonGen';
import { useGameStore } from '@/lib/gameStore';

const TILE_SIZE = 8;
const GRAVITY = 0.4;
const JUMP_FORCE = -6;
const MOVE_SPEED = 2;

const TILE_COLORS: Record<string, string> = {
  air: '#1a1a2e', stone: '#555560', ore_iron: '#8a6644', ore_gold: '#ccaa44',
  crystal: '#6688cc', exit: '#44aa44', entrance: '#4488cc',
};

const ENEMY_COLORS: Record<string, string> = {
  slime: '#44cc44', goblin: '#aa6644', bat: '#8866aa',
};

export default function DungeonView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phase = useGameStore(s => s.phase);
  const setPhase = useGameStore(s => s.setOverlay); // use backToGame to exit

  const activeCaveId = useGameStore(s => s.activeCaveId);
  const [dungeon] = useState<DungeonData>(() => generateDungeon(activeCaveId ?? 1, 'auredia'));
  const playerRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, onGround: false });
  const keysRef = useRef(new Set<string>());

  useEffect(() => {
    playerRef.current.x = dungeon.entranceX * TILE_SIZE;
    playerRef.current.y = dungeon.entranceY * TILE_SIZE;
  }, [dungeon]);

  useEffect(() => {
    if (phase !== 'dungeon') return;
    const onDown = (e: KeyboardEvent) => keysRef.current.add(e.key);
    const onUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'dungeon') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let animId: number;

    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) { animId = requestAnimationFrame(render); return; }
      const W = canvas.width, H = canvas.height;
      const p = playerRef.current;
      const keys = keysRef.current;

      // Input
      if (keys.has('a') || keys.has('ArrowLeft')) p.vx = -MOVE_SPEED;
      else if (keys.has('d') || keys.has('ArrowRight')) p.vx = MOVE_SPEED;
      else p.vx = 0;
      if ((keys.has('w') || keys.has('ArrowUp') || keys.has(' ')) && p.onGround) { p.vy = JUMP_FORCE; p.onGround = false; }

      // Gravity
      p.vy += GRAVITY;
      p.x += p.vx;
      p.y += p.vy;

      // Collision with tiles
      const tileAt = (px: number, py: number) => {
        const tx = Math.floor(px / TILE_SIZE), ty = Math.floor(py / TILE_SIZE);
        if (tx < 0 || tx >= DUNGEON_W || ty < 0 || ty >= DUNGEON_H) return 'stone';
        return DUNGEON_TILE_NAMES[dungeon.tiles[ty * DUNGEON_W + tx]] ?? 'stone';
      };

      const isSolid = (tile: string) => tile === 'stone' || tile === 'ore_iron' || tile === 'ore_gold' || tile === 'crystal';

      // Y collision
      if (p.vy > 0 && isSolid(tileAt(p.x + 3, p.y + TILE_SIZE))) {
        p.y = Math.floor(p.y / TILE_SIZE) * TILE_SIZE;
        p.vy = 0; p.onGround = true;
      }
      if (p.vy < 0 && isSolid(tileAt(p.x + 3, p.y))) {
        p.y = (Math.floor(p.y / TILE_SIZE) + 1) * TILE_SIZE;
        p.vy = 0;
      }
      // X collision
      if (p.vx > 0 && isSolid(tileAt(p.x + TILE_SIZE - 1, p.y + 3))) p.x = Math.floor(p.x / TILE_SIZE) * TILE_SIZE;
      if (p.vx < 0 && isSolid(tileAt(p.x, p.y + 3))) p.x = (Math.floor(p.x / TILE_SIZE) + 1) * TILE_SIZE;

      // Check exit
      if (tileAt(p.x + 3, p.y + 3) === 'exit') {
        useGameStore.setState({ phase: 'playing' });
        return;
      }

      // Camera
      const camX = Math.max(0, Math.min(DUNGEON_W * TILE_SIZE - W, p.x - W / 2));
      const camY = Math.max(0, Math.min(DUNGEON_H * TILE_SIZE - H, p.y - H / 2));

      // Draw
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, W, H);

      const startTx = Math.max(0, Math.floor(camX / TILE_SIZE));
      const startTy = Math.max(0, Math.floor(camY / TILE_SIZE));
      const endTx = Math.min(DUNGEON_W, Math.ceil((camX + W) / TILE_SIZE));
      const endTy = Math.min(DUNGEON_H, Math.ceil((camY + H) / TILE_SIZE));

      for (let ty = startTy; ty < endTy; ty++) {
        for (let tx = startTx; tx < endTx; tx++) {
          const tile = DUNGEON_TILE_NAMES[dungeon.tiles[ty * DUNGEON_W + tx]];
          if (tile === 'air') continue;
          ctx.fillStyle = TILE_COLORS[tile] ?? '#333';
          ctx.fillRect(tx * TILE_SIZE - camX, ty * TILE_SIZE - camY, TILE_SIZE, TILE_SIZE);
        }
      }

      // Enemies
      for (const enemy of dungeon.enemies) {
        if (enemy.hp <= 0) continue;
        const sx = enemy.x * TILE_SIZE - camX, sy = enemy.y * TILE_SIZE - camY;
        ctx.fillStyle = ENEMY_COLORS[enemy.kind] ?? '#ff0000';
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
      }

      // Player
      ctx.fillStyle = '#e8d490';
      ctx.fillRect(p.x - camX, p.y - camY, TILE_SIZE - 2, TILE_SIZE - 2);

      // HUD
      ctx.fillStyle = 'rgba(200,170,80,0.7)';
      ctx.font = '10px monospace';
      ctx.fillText('DUNGEON — WASD to move, Space to jump, ESC to exit', 10, 15);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [phase, dungeon]);

  // ESC to exit dungeon
  useEffect(() => {
    if (phase !== 'dungeon') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') useGameStore.setState({ phase: 'playing' });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase]);

  if (phase !== 'dungeon') return null;

  return (
    <div className="absolute inset-0 z-[200] bg-black">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
