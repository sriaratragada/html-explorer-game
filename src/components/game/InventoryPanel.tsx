import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { ITEMS } from '@/lib/items';

export default function InventoryPanel() {
  const overlay = useGameStore(s => s.overlay);
  const setOverlay = useGameStore(s => s.setOverlay);

  if (overlay !== 'inventory') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 bg-ink/95 backdrop-blur-md overflow-auto pointer-events-auto"
      >
        <div className="max-w-3xl mx-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-gold gold-glow">Inventory</h2>
            <button onClick={() => setOverlay('none')} className="font-mono-game text-xs text-mist hover:text-gold transition-colors cursor-pointer">[ESC] Close</button>
          </div>

          <div className="mb-6">
            <h3 className="font-display text-sm text-parchment/70 uppercase tracking-wider mb-3">Equipment</h3>
            <div className="grid grid-cols-4 gap-2">
              {['mainhand', 'offhand', 'helm', 'chest', 'legs', 'boots', 'amulet'].map(slot => (
                <div key={slot} className="border border-gold/10 bg-ink/50 p-2 text-center min-h-[60px] flex flex-col items-center justify-center">
                  <span className="font-mono-game text-[8px] text-mist/40 uppercase">{slot}</span>
                  <span className="text-lg mt-1">—</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm text-parchment/70 uppercase tracking-wider mb-3">Backpack</h3>
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="border border-gold/10 bg-ink/50 w-12 h-12 flex items-center justify-center">
                  <span className="text-[8px] text-mist/20">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-[10px] text-mist/40 italic text-center">
            Inventory system ready. Items will appear here as you gather and craft.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
