import { useRef, useEffect } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { MAP_W, MAP_H, LOCATION_COORDS, getContinentAt } from '@/lib/mapGenerator';
import { LOCATIONS } from '@/lib/gameData';

const MM_SIZE = 180;

const CONTINENT_COLORS: Record<string, string> = {
  auredia: '#3a5a2a',
  trivalen: '#5a4a3a',
  uloren: '#2a3a4a',
};

export default function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerX = useGameStore(s => s.playerX);
  const playerY = useGameStore(s => s.playerY);
  const visitedLocations = useGameStore(s => s.visitedLocations);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, MM_SIZE, MM_SIZE);

    // Draw continent outlines (sampled at low resolution)
    const step = 80;
    for (let wy = 0; wy < MAP_H; wy += step) {
      for (let wx = 0; wx < MAP_W; wx += step) {
        const continent = getContinentAt(wx, wy);
        if (continent) {
          const sx = (wx / MAP_W) * MM_SIZE;
          const sy = (wy / MAP_H) * MM_SIZE;
          const sw = (step / MAP_W) * MM_SIZE;
          const sh = (step / MAP_H) * MM_SIZE;
          ctx.fillStyle = CONTINENT_COLORS[continent] ?? '#333';
          ctx.fillRect(sx, sy, sw + 1, sh + 1);
        }
      }
    }

    // Draw visited locations
    for (const loc of LOCATIONS) {
      const coord = LOCATION_COORDS[loc.id];
      if (!coord) continue;
      const sx = (coord.x / MAP_W) * MM_SIZE;
      const sy = (coord.y / MAP_H) * MM_SIZE;
      const visited = visitedLocations.includes(loc.id);
      ctx.fillStyle = visited ? '#c9a84c' : 'rgba(100,100,100,0.3)';
      ctx.beginPath();
      ctx.arc(sx, sy, visited ? 2.5 : 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw player dot
    const px = (playerX / MAP_W) * MM_SIZE;
    const py = (playerY / MAP_H) * MM_SIZE;
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.5;
    ctx.stroke();

  }, [playerX, playerY, visitedLocations]);

  return (
    <div className="absolute top-3 right-3 z-30 pointer-events-auto">
      <canvas
        ref={canvasRef}
        width={MM_SIZE}
        height={MM_SIZE}
        className="border border-gold/20 bg-ink/80 backdrop-blur-sm opacity-80 hover:opacity-100 transition-opacity"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
