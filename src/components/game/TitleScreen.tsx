import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { useEffect, useRef } from 'react';

export default function TitleScreen() {
  const startGame = useGameStore(s => s.startGame);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
