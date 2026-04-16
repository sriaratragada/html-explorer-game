import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { PLOT_PRICES } from '@/lib/housing';

export default function BuildPanel() {
  const overlay = useGameStore(s => s.overlay);
  const setOverlay = useGameStore(s => s.setOverlay);
  const currentLocation = useGameStore(s => s.currentLocation);

  if (overlay !== 'build') return null;

  const plotPrice = PLOT_PRICES[currentLocation];
  const hasPlot = !!plotPrice;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 bg-ink/95 backdrop-blur-md overflow-auto pointer-events-auto"
      >
        <div className="max-w-lg mx-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-gold gold-glow">Housing</h2>
            <button onClick={() => setOverlay('none')} className="font-mono-game text-xs text-mist hover:text-gold transition-colors cursor-pointer">[ESC] Close</button>
          </div>

          {hasPlot ? (
            <div className="border border-gold/10 p-4 text-center">
              <p className="font-display text-sm text-parchment mb-2">Plot available in {currentLocation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              <p className="font-mono-game text-[10px] text-gold mb-4">Price: {plotPrice}g — 16×16 grid</p>
              <button className="px-6 py-2 border border-gold/20 font-mono-game text-xs text-gold hover:bg-gold/10 cursor-pointer opacity-50">
                Purchase Plot
              </button>
              <p className="font-mono-game text-[9px] text-mist/30 mt-3">Place furniture and workbenches after purchasing.</p>
            </div>
          ) : (
            <div className="border border-gold/10 p-4 text-center">
              <p className="font-body text-sm text-mist/50 italic">No plots available in this location.</p>
              <p className="font-mono-game text-[10px] text-mist/30 mt-2">Plots can be purchased in Highmarch, Vell Harbor, and Korrath Citadel.</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
