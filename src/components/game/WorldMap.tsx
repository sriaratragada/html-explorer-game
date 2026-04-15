import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { LOCATIONS } from '@/lib/gameData';
import {
  generateWorldMap, getTileColor, getRoadColor,
  LOCATION_COORDS, MAP_W, MAP_H, TILE_SIZE,
  WorldMap as WorldMapData,
} from '@/lib/mapGenerator';

// Generate once
let cachedMap: WorldMapData | null = null;
function getMap() {
  if (!cachedMap) cachedMap = generateWorldMap();
  return cachedMap;
}

// Location icons (drawn as text on canvas)
const LOC_ICONS: Record<string, string> = {};
LOCATIONS.forEach(l => { LOC_ICONS[l.id] = l.icon; });

export default function WorldMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { currentLocation, visitedLocations, season, isMoving } = useGameStore();
  const travel = useGameStore(s => s.travel);

  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [camStart, setCamStart] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; biome: string } | null>(null);

  // Player animation
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number } | null>(null);
  const animRef = useRef<number>(0);

  // Center camera on current location
  useEffect(() => {
    const coord = LOCATION_COORDS[currentLocation];
    if (!coord || !containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    setCamera({
      x: coord.x * TILE_SIZE * zoom - cw / 2,
      y: coord.y * TILE_SIZE * zoom - ch / 2,
    });
    setPlayerPos({ x: coord.x, y: coord.y });
  }, [currentLocation, zoom]);

  // Get connected location IDs
  const currentLoc = LOCATIONS.find(l => l.id === currentLocation);
  const connectedIds = currentLoc?.connections || [];

  // ── Render ──
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    canvas.width = cw;
    canvas.height = ch;

    const map = getMap();
    const ts = TILE_SIZE * zoom;

    // Calculate visible tile range
    const startX = Math.max(0, Math.floor(camera.x / ts));
    const startY = Math.max(0, Math.floor(camera.y / ts));
    const endX = Math.min(MAP_W, Math.ceil((camera.x + cw) / ts));
    const endY = Math.min(MAP_H, Math.ceil((camera.y + ch) / ts));

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, cw, ch);

    // Draw tiles
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const screenX = x * ts - camera.x;
        const screenY = y * ts - camera.y;

        const key = `${x},${y}`;
        const isRoad = map.roads.has(key);
        const tile = map.tiles[y][x];
        const color = isRoad ? getRoadColor(season) : getTileColor(tile, season);

        ctx.fillStyle = color;
        ctx.fillRect(Math.floor(screenX), Math.floor(screenY), Math.ceil(ts), Math.ceil(ts));

        // Pixel grid effect at higher zoom
        if (zoom >= 1.5) {
          ctx.strokeStyle = 'rgba(0,0,0,0.1)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(Math.floor(screenX), Math.floor(screenY), Math.ceil(ts), Math.ceil(ts));
        }
      }
    }

    // Fog of war overlay for unvisited areas
    for (const [locId, coord] of Object.entries(LOCATION_COORDS)) {
      if (visitedLocations.includes(locId)) continue;
      // Dim area around unvisited locations
      const cx = coord.x * ts - camera.x;
      const cy = coord.y * ts - camera.y;
      const fogR = 12 * ts;
      ctx.fillStyle = 'rgba(5, 5, 8, 0.35)';
      ctx.beginPath();
      ctx.arc(cx, cy, fogR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw location markers
    for (const loc of LOCATIONS) {
      const coord = LOCATION_COORDS[loc.id];
      if (!coord) continue;

      const cx = coord.x * ts - camera.x;
      const cy = coord.y * ts - camera.y;

      // Skip off-screen
      if (cx < -50 || cx > cw + 50 || cy < -50 || cy > ch + 50) continue;

      const isVisited = visitedLocations.includes(loc.id);
      const isCurrent = loc.id === currentLocation;
      const isConnected = connectedIds.includes(loc.id);
      const isHov = hovered === loc.id;

      // Marker background
      const markerSize = isCurrent ? 18 * zoom : isHov ? 16 * zoom : 14 * zoom;

      // Glow for current
      if (isCurrent) {
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.003);
        ctx.shadowColor = 'hsl(43, 50%, 54%)';
        ctx.shadowBlur = 15 + pulse * 10;
      }

      // Draw marker circle
      ctx.beginPath();
      ctx.arc(cx, cy, markerSize, 0, Math.PI * 2);
      ctx.fillStyle = isCurrent
        ? 'hsl(43, 50%, 54%)'
        : isConnected
          ? isHov ? 'hsl(43, 50%, 40%)' : 'hsl(43, 30%, 25%)'
          : isVisited
            ? 'hsl(20, 15%, 18%)'
            : 'hsl(20, 10%, 12%)';
      ctx.fill();

      ctx.strokeStyle = isCurrent
        ? 'hsl(43, 60%, 65%)'
        : isConnected
          ? 'hsl(43, 40%, 45%)'
          : 'hsl(43, 20%, 25%)';
      ctx.lineWidth = isCurrent ? 2.5 : 1.5;
      ctx.stroke();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Icon
      const iconSize = Math.max(12, 14 * zoom);
      ctx.font = `${iconSize}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(loc.icon, cx, cy);

      // Label
      if (zoom >= 0.7 || isCurrent || isHov) {
        ctx.font = `bold ${Math.max(9, 10 * zoom)}px 'Cinzel', serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = isCurrent ? 'hsl(43, 50%, 70%)' : isVisited ? 'hsl(38, 40%, 75%)' : 'hsl(38, 15%, 45%)';

        // Text shadow
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(loc.name, cx, cy + markerSize + 10 * zoom);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }

      // "clickable" indicator for connected
      if (isConnected && !isCurrent) {
        const dotPulse = 0.3 + 0.7 * Math.sin(Date.now() * 0.004 + coord.x);
        ctx.beginPath();
        ctx.arc(cx + markerSize + 4, cy - markerSize + 4, 3 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 170, 80, ${dotPulse})`;
        ctx.fill();
      }
    }

    // Draw player token
    if (playerPos) {
      const px = playerPos.x * ts - camera.x;
      const py = playerPos.y * ts - camera.y;
      const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.005);

      // Outer glow
      ctx.beginPath();
      ctx.arc(px, py - 22 * zoom, 8 * zoom, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(43, 60%, 55%, ${pulse * 0.3})`;
      ctx.fill();

      // Player dot
      ctx.beginPath();
      ctx.arc(px, py - 22 * zoom, 4 * zoom, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(38, 80%, 85%)';
      ctx.fill();
      ctx.strokeStyle = 'hsl(43, 50%, 54%)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    animRef.current = requestAnimationFrame(render);
  }, [camera, zoom, season, currentLocation, visitedLocations, hovered, playerPos, connectedIds]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [render]);

  // ── Input handlers ──
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setCamStart({ ...camera });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (dragging) {
      setCamera({
        x: camStart.x - (e.clientX - dragStart.x),
        y: camStart.y - (e.clientY - dragStart.y),
      });
      return;
    }

    // Hit-test locations for hover
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left + camera.x;
    const my = e.clientY - rect.top + camera.y;
    const ts = TILE_SIZE * zoom;

    let found: string | null = null;
    for (const loc of LOCATIONS) {
      const coord = LOCATION_COORDS[loc.id];
      if (!coord) continue;
      const cx = coord.x * ts;
      const cy = coord.y * ts;
      const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
      if (dist < 20 * zoom) {
        found = loc.id;
        setTooltip({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          name: loc.name,
          biome: loc.biome,
        });
        break;
      }
    }
    if (!found) setTooltip(null);
    setHovered(found);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const wasDrag = Math.abs(e.clientX - dragStart.x) > 5 || Math.abs(e.clientY - dragStart.y) > 5;
    setDragging(false);

    if (wasDrag || isMoving) return;

    // Click on connected location to travel
    if (hovered && connectedIds.includes(hovered) && hovered !== currentLocation) {
      travel(hovered);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.min(3, Math.max(0.5, z + delta)));
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setDragging(false); setHovered(null); setTooltip(null); }}
        onWheel={handleWheel}
        className="block w-full h-full"
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-50 px-3 py-2 border border-gold/30 bg-ink/95 backdrop-blur-sm"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <p className="font-display text-xs font-semibold text-parchment">{tooltip.name}</p>
          <p className="font-mono text-[9px] text-mist">{tooltip.biome}</p>
          {connectedIds.includes(hovered!) && hovered !== currentLocation && (
            <p className="font-mono text-[9px] text-gold mt-0.5">Click to travel</p>
          )}
        </div>
      )}

      {/* Map legend */}
      <div className="absolute bottom-3 left-3 px-3 py-2 border border-gold/15 bg-ink/90 backdrop-blur-sm">
        <p className="font-mono text-[9px] text-gold uppercase tracking-wider mb-1">Map Controls</p>
        <p className="font-mono text-[8px] text-mist">Drag to pan · Scroll to zoom</p>
        <p className="font-mono text-[8px] text-mist">Click connected locations to travel</p>
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-3 right-3 px-2 py-1 border border-gold/15 bg-ink/90 backdrop-blur-sm">
        <p className="font-mono text-[9px] text-mist">{Math.round(zoom * 100)}%</p>
      </div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(5,5,8,0.6) 100%)',
      }} />
    </div>
  );
}
