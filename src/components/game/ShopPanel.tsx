import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { ITEMS } from '@/lib/items';

export default function ShopPanel() {
  const overlay = useGameStore(s => s.overlay);
  const setOverlay = useGameStore(s => s.setOverlay);
  const currentLocation = useGameStore(s => s.currentLocation);

  if (overlay !== 'shop') return null;

  const tradeItems = ['bread', 'cooked_meat', 'iron_ingot', 'leather', 'salt', 'wood', 'stone', 'herb'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 bg-ink/95 backdrop-blur-md overflow-auto pointer-events-auto"
      >
        <div className="max-w-2xl mx-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-gold gold-glow">Market — {currentLocation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
            <button onClick={() => setOverlay('none')} className="font-mono-game text-xs text-mist hover:text-gold transition-colors cursor-pointer">[ESC] Close</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-display text-sm text-parchment/70 uppercase tracking-wider mb-3">Buy</h3>
              <div className="space-y-1">
                {tradeItems.map(itemId => {
                  const def = ITEMS[itemId];
                  if (!def) return null;
                  return (
                    <div key={itemId} className="flex items-center justify-between border border-gold/10 p-2 hover:border-gold/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <span>{def.icon}</span>
                        <span className="font-mono-game text-[10px] text-parchment">{def.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono-game text-[10px] text-gold">{def.value}g</span>
                        <button className="px-2 py-0.5 border border-gold/20 font-mono-game text-[8px] text-gold hover:bg-gold/10 cursor-pointer">Buy</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-display text-sm text-parchment/70 uppercase tracking-wider mb-3">Sell</h3>
              <p className="font-mono-game text-[10px] text-mist/50 italic">Select items from inventory to sell.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
