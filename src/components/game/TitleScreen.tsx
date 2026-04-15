import { motion } from 'framer-motion';
import { getMap, useGameStore } from '@/lib/gameStore';
import { useEffect, useRef } from 'react';
import { LOCATIONS } from '@/lib/gameData';
import { LOCATION_COORDS, MAP_H, MAP_W, PARSED_PALETTES } from '@/lib/mapGenerator';

export default function TitleScreen() {
  const startGame = useGameStore(s => s.startGame);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldMapRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    let animId: number;
    const stars: { x: number; y: number; r: number; speed: number; o: number }[] = [];

    function resize() {
      c.width = c.offsetWidth;
      c.height = c.offsetHeight;
      stars.length = 0;
      for (let i = 0; i < 80; i++) {
        stars.push({
          x: Math.random() * c.width,
          y: Math.random() * c.height,
          r: Math.random() * 1.5 + 0.3,
          speed: Math.random() * 0.3 + 0.05,
          o: Math.random() * 0.6 + 0.1,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.strokeStyle = 'rgba(201,168,76,0.06)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.globalAlpha = (1 - d / 100) * 0.2;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${s.o})`;
        ctx.fill();
        s.y -= s.speed;
        if (s.y < -2) { s.y = c.height + 2; s.x = Math.random() * c.width; }
      });
      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  useEffect(() => {
    const mapCanvas = worldMapRef.current;
    if (!mapCanvas) return;
    const ctx = mapCanvas.getContext('2d');
    if (!ctx) return;

    const world = getMap();
    const width = 900;
    const height = 450;
    mapCanvas.width = width;
    mapCanvas.height = height;

    const img = ctx.createImageData(width, height);
    const d = img.data;
    const pal = PARSED_PALETTES.thaw;
    for (let py = 0; py < height; py++) {
      const wy = Math.floor((py / height) * MAP_H);
      for (let px = 0; px < width; px++) {
        const wx = Math.floor((px / width) * MAP_W);
        const idx = wy * MAP_W + wx;
        const code = world.roads[idx] === 1 ? 11 : world.tiles[idx];
        const [r, g, b] = pal[code] ?? [30, 30, 30];
        const i = (py * width + px) * 4;
        d[i] = r;
        d[i + 1] = g;
        d[i + 2] = b;
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    const typeColor: Record<string, string> = {
      village: '#c6ad68',
      town: '#d3b878',
      city: '#e4c987',
      castle: '#f0d89a',
    };

    for (const loc of LOCATIONS) {
      const c = LOCATION_COORDS[loc.id];
      if (!c) continue;
      const x = (c.x / MAP_W) * width;
      const y = (c.y / MAP_H) * height;
      const r = loc.type === 'city' ? 4 : loc.type === 'town' ? 3.2 : loc.type === 'castle' ? 3.6 : 2.8;

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = typeColor[loc.type] ?? '#8c8c8c';
      ctx.fill();
      ctx.strokeStyle = 'rgba(20, 12, 8, 0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden bg-ink">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />
      
      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <motion.p
          className="font-mono text-[11px] tracking-[0.4em] text-gold uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          An Emergent Narrative RPG
        </motion.p>

        <motion.h1
          className="font-display text-[clamp(64px,14vw,160px)] font-black leading-[0.9] text-parchment gold-glow"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Chronicle
        </motion.h1>

        <motion.p
          className="font-body text-[clamp(16px,2.5vw,20px)] italic text-mist max-w-[500px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          An open-world RPG where the world doesn't care about you. Not yet.
        </motion.p>

        <motion.div
          className="w-[min(92vw,960px)] mt-2 rounded-sm border border-gold/30 bg-ink/65 p-3 shadow-[0_0_50px_rgba(0,0,0,0.55)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <p className="mb-2 font-mono text-[10px] tracking-[0.3em] text-gold/80 uppercase">
            Realm Atlas
          </p>
          <canvas
            ref={worldMapRef}
            className="w-full h-[clamp(210px,34vh,390px)] border border-gold/20 bg-[#0f0f0f]"
            style={{ imageRendering: 'pixelated' }}
          />
        </motion.div>

        <motion.div
          className="w-[120px] h-px bg-gradient-to-r from-transparent via-gold to-transparent my-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        />

        <motion.p
          className="font-display text-[11px] tracking-[0.2em] text-gold uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          No Classes · Living World · AI Memory · Emergent Narrative
        </motion.p>

        <motion.button
          onClick={startGame}
          className="mt-8 px-10 py-4 border border-gold-dark bg-gold/5 font-display text-sm tracking-[0.2em] text-gold uppercase
            hover:bg-gold/15 hover:border-gold transition-all duration-300 cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Begin Your Chronicle
        </motion.button>
      </motion.div>

      <motion.div
        className="absolute bottom-10 flex flex-col items-center gap-2 opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 2 }}
      >
        <span className="font-mono text-[10px] tracking-[0.3em] text-mist uppercase">
          Your story awaits
        </span>
        <div className="w-px h-10 bg-gradient-to-b from-gold to-transparent animate-pulse-gold" />
      </motion.div>
    </div>
  );
}
