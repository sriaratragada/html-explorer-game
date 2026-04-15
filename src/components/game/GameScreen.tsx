import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { SEASON_NAMES } from '@/lib/gameData';
import WorldMap from '@/components/game/WorldMap';
import HudBar from '@/components/game/HudBar';
import EventPopup from '@/components/game/EventPopup';
import OverlayPanel from '@/components/game/OverlayPanel';
import Hotbar from '@/components/game/Hotbar';

export default function GameScreen() {
  const phase     = useGameStore(s => s.phase);
  const chronicle = useGameStore(s => s.chronicle);
  const tick      = useGameStore(s => s.tick);
  const season    = useGameStore(s => s.season);
  const startGame = useGameStore(s => s.startGame);
  const lastEntry = chronicle[chronicle.length - 1] ?? null;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <WorldMap />
      <Hotbar />
      <EventPopup />
      <HudBar />
      <OverlayPanel />

      {/* Death Screen */}
      <AnimatePresence>
        {phase === 'dead' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center"
            style={{ background: 'radial-gradient(ellipse at center, hsl(0 30% 4% / 0.97) 40%, hsl(0 60% 2%) 100%)' }}
          >
            <motion.div
              className="flex flex-col items-center gap-6 px-8 text-center max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-blood to-transparent" />
              <h2 className="font-display text-2xl text-parchment/70 tracking-[0.15em] uppercase">
                The chronicle ends here
              </h2>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-blood to-transparent" />
              {lastEntry && (
                <p className="font-body text-sm italic text-mist/60 leading-relaxed">
                  &ldquo;{lastEntry.text}&rdquo;
                </p>
              )}
              <p className="font-mono text-[10px] text-mist/40 uppercase tracking-widest">
                — Tick {tick}, {SEASON_NAMES[season]} —
              </p>
              <button
                onClick={startGame}
                className="mt-4 px-8 py-3 border border-blood/30 bg-blood/5 font-display text-xs tracking-[0.2em] text-parchment/70 uppercase hover:bg-blood/15 hover:border-blood/60 transition-all duration-300 cursor-pointer"
              >
                Begin Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
