import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameStore, getMap } from '@/lib/gameStore';
import { MAP_W, MAP_H, TILE_SIZE, LOCATION_COORDS, getTileColor, getRoadColor } from '@/lib/mapGenerator';
import { LOCATIONS } from '@/lib/gameData';

const LOC_ICONS: Record<string, string> = {
  ashenford: '🏘️', saltmoor: '🏙️', ironhold: '🏰', thornwick: '🌲',
  graygate: '🏛️', dustfall: '🗿', crossroads: '🍺', marshend: '🌿',
  badlands: '💀', coldpeak: '⛰️', ruins_of_aether: '✨',
};

export default function WorldMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  const playerX = useGameStore(s => s.playerX);
  const playerY = useGameStore(s => s.playerY);
  const season = useGameStore(s => s.season);
  const visitedLocations = useGameStore(s => s.visitedLocations);
  const nearestLocation = useGameStore(s => s.nearestLocation);
  const movePlayer = useGameStore(s => s.movePlayer);

  const [zoom, setZoom] = useState(6);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });
  const keysRef = useRef<Set<string>>(new Set());

  // Handle resize
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setCanvasSize({ w: containerRef.current.clientWidth, h: containerRef.current.clientHeight });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Keyboard input
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        keysRef.current.add(e.key);
      }
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // Movement tick
  useEffect(() => {
    const interval = setInterval(() => {
      const keys = keysRef.current;
      let dx = 0, dy = 0;
      if (keys.has('w') || keys.has('ArrowUp')) dy = -1;
      if (keys.has('s') || keys.has('ArrowDown')) dy = 1;
      if (keys.has('a') || keys.has('ArrowLeft')) dx = -1;
      if (keys.has('d') || keys.has('ArrowRight')) dx = 1;
      if (dx !== 0 || dy !== 0) movePlayer(dx, dy);
    }, 80);
    return () => clearInterval(interval);
  }, [movePlayer]);

  // Render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const map = getMap();

    const viewW = canvasSize.w;
    const viewH = canvasSize.h;
    canvas.width = viewW;
    canvas.height = viewH;

    const tilePixels = zoom;
    const tilesX = Math.ceil(viewW / tilePixels) + 2;
    const tilesY = Math.ceil(viewH / tilePixels) + 2;
    const camX = playerX - Math.floor(tilesX / 2);
    const camY = playerY - Math.floor(tilesY / 2);

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, viewW, viewH);

    // Draw tiles
    for (let ty = 0; ty < tilesY; ty++) {
      for (let tx = 0; tx < tilesX; tx++) {
        const wx = camX + tx;
        const wy = camY + ty;
        if (wx < 0 || wx >= MAP_W || wy < 0 || wy >= MAP_H) continue;
        const tile = map.tiles[wy][wx];
        const isRoad = map.roads.has(`${wx},${wy}`);
        ctx.fillStyle = isRoad ? getRoadColor(season) : getTileColor(tile, season);
        ctx.fillRect(tx * tilePixels, ty * tilePixels, tilePixels, tilePixels);
      }
    }

    // Fog of war
    if (zoom < 12) {
      const fogRadius = 40;
      for (let ty = 0; ty < tilesY; ty++) {
        for (let tx = 0; tx < tilesX; tx++) {
          const wx = camX + tx;
          const wy = camY + ty;
          let minDist = Infinity;
          for (const locId of visitedLocations) {
            const coord = LOCATION_COORDS[locId];
            if (!coord) continue;
            minDist = Math.min(minDist, Math.sqrt((wx - coord.x) ** 2 + (wy - coord.y) ** 2));
          }
          minDist = Math.min(minDist, Math.sqrt((wx - playerX) ** 2 + (wy - playerY) ** 2));
          if (minDist > fogRadius * 0.5) {
            const fogAlpha = Math.min(0.7, (minDist - fogRadius * 0.5) / (fogRadius * 0.5));
            ctx.fillStyle = `rgba(5, 5, 10, ${fogAlpha})`;
            ctx.fillRect(tx * tilePixels, ty * tilePixels, tilePixels, tilePixels);
          }
        }
      }
    }

    // Location markers
    for (const loc of LOCATIONS) {
      const coord = LOCATION_COORDS[loc.id];
      if (!coord) continue;
      const sx = (coord.x - camX) * tilePixels;
      const sy = (coord.y - camY) * tilePixels;
      if (sx < -40 || sx > viewW + 40 || sy < -40 || sy > viewH + 40) continue;

      const isNear = nearestLocation === loc.id;
      const isVisited = visitedLocations.includes(loc.id);
      const markerR = isNear ? 12 : 8;

      ctx.beginPath();
      ctx.arc(sx, sy, markerR, 0, Math.PI * 2);
      ctx.fillStyle = isNear ? 'rgba(200,170,80,0.9)' : isVisited ? 'rgba(160,140,80,0.6)' : 'rgba(100,100,100,0.4)';
      ctx.fill();
      ctx.strokeStyle = isNear ? '#c8aa50' : isVisited ? '#a08c50' : '#666';
      ctx.lineWidth = isNear ? 2 : 1;
      ctx.stroke();

      ctx.font = `${isNear ? 16 : 12}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(LOC_ICONS[loc.id] || '📍', sx, sy);

      if (isNear || isVisited || zoom > 4) {
        ctx.font = `${isNear ? 11 : 9}px "Courier Prime", monospace`;
        ctx.fillStyle = isNear ? '#c8aa50' : '#888';
        ctx.textAlign = 'center';
        ctx.fillText(loc.name, sx, sy + markerR + 12);
      }
    }

    // Player token
    const psx = (playerX - camX) * tilePixels;
    const psy = (playerY - camY) * tilePixels;
    const pulse = Math.sin(Date.now() / 300) * 2 + 6;

    ctx.beginPath();
    ctx.arc(psx, psy, pulse + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200,170,80,0.15)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(psx, psy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#c8aa50';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Off-screen landmark indicators
    for (const loc of LOCATIONS) {
      const coord = LOCATION_COORDS[loc.id];
      if (!coord) continue;
      const lsx = (coord.x - camX) * tilePixels;
      const lsy = (coord.y - camY) * tilePixels;
      const dist = Math.sqrt((coord.x - playerX) ** 2 + (coord.y - playerY) ** 2);
      if (dist > 200 || dist < 20) continue;
      if (lsx > 30 && lsx < viewW - 30 && lsy > 30 && lsy < viewH - 30) continue;

      const angle = Math.atan2(coord.y - playerY, coord.x - playerX);
      const edgeX = Math.max(20, Math.min(viewW - 20, psx + Math.cos(angle) * (viewW / 2 - 30)));
      const edgeY = Math.max(20, Math.min(viewH - 20, psy + Math.sin(angle) * (viewH / 2 - 30)));

      ctx.save();
      ctx.translate(edgeX, edgeY);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-4, -4);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.fillStyle = visitedLocations.includes(loc.id) ? 'rgba(200,170,80,0.6)' : 'rgba(150,150,150,0.4)';
      ctx.fill();
      ctx.restore();

      ctx.font = '8px "Courier Prime", monospace';
      ctx.fillStyle = 'rgba(200,170,80,0.5)';
      ctx.textAlign = 'center';
      ctx.fillText(`${loc.name} (${Math.round(dist)})`, edgeX, edgeY + 14);
    }

    animRef.current = requestAnimationFrame(render);
  }, [canvasSize, playerX, playerY, season, visitedLocations, nearestLocation, zoom]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [render]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(3, Math.min(15, z + (e.deltaY > 0 ? -0.5 : 0.5))));
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-background">
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        className="w-full h-full cursor-crosshair"
        style={{ imageRendering: 'pixelated' }}
      />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(5,5,10,0.6) 100%)',
      }} />
      <div className="absolute top-3 right-3 font-mono-game text-[10px] text-mist opacity-50">
        {zoom.toFixed(1)}x
      </div>
    </div>
  );
}
