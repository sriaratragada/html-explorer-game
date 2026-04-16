import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { ITEMS } from '@/lib/items';
import { countItem } from '@/lib/craftingSystem';

export default function ShopPanel() {
  const overlay = useGameStore(s => s.overlay);
  const setOverlay = useGameStore(s => s.setOverlay);
  const currentLocation = useGameStore(s => s.currentLocation);
  const markets = useGameStore(s => s.markets);
  const gold = useGameStore(s => s.gold);
  const inventory = useGameStore(s => s.inventory);
  const buyItemAction = useGameStore(s => s.buyItemAction);
  const sellItemAction = useGameStore(s => s.sellItemAction);

  if (overlay !== 'shop') return null;
  const market = markets[currentLocation];

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-ink/95 backdrop-blur-md overflow-auto pointer-events-auto">
        <div className="max-w-3xl mx-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-gold gold-glow">Market — {currentLocation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
            <div className="flex items-center gap-4">
              <span className="font-mono-game text-[11px] text-gold">🪙 {gold}g</span>
              <button onClick={() => setOverlay('none')} className="font-mono-game text-xs text-mist hover:text-gold transition-colors cursor-pointer">[ESC] Close</button>
            </div>
          </div>
          {!market ? (
            <p className="text-mist/50 text-sm italic text-center">No market at this location.</p>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-display text-sm text-parchment/70 uppercase tracking-wider mb-3">Buy</h3>
                <div className="space-y-1">
                  {market.items.map(mItem => {
                    const def = ITEMS[mItem.itemId];
                    if (!def) return null;
                    const scarcity = mItem.stock < 3 ? 2.0 : mItem.stock < 8 ? 1.3 : mItem.stock > 20 ? 0.7 : 1.0;
                    const price = Math.max(1, Math.round(mItem.basePrice * mItem.priceMultiplier * scarcity));
                    const canBuy = gold >= price && mItem.stock > 0;
                    return (
                      <div key={mItem.itemId} className="flex items-center justify-between border border-gold/10 p-2 hover:border-gold/30 transition-colors">
                        <div className="flex items-center gap-2">
                          <span>{def.icon}</span>
                          <span className="font-mono-game text-[10px] text-parchment">{def.name}</span>
                          <span className="font-mono-game text-[8px] text-mist/40">×{mItem.stock}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-game text-[10px] text-gold">{price}g</span>
                          <button onClick={() => canBuy && buyItemAction(mItem.itemId, 1)} disabled={!canBuy}
                            className={`px-2 py-0.5 border font-mono-game text-[8px] cursor-pointer transition-all ${canBuy ? 'border-gold/20 text-gold hover:bg-gold/10' : 'border-gold/5 text-mist/30 cursor-not-allowed'}`}>Buy</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="font-display text-sm text-parchment/70 uppercase tracking-wider mb-3">Sell</h3>
                <div className="space-y-1">
                  {inventory.slots.filter(s => s !== null).map((slot, i) => {
                    if (!slot) return null;
                    const def = ITEMS[slot.itemId];
                    if (!def) return null;
                    const sellPrice = Math.max(1, Math.floor((def.value ?? 1) * 0.6));
                    return (
                      <div key={`${slot.itemId}-${i}`} className="flex items-center justify-between border border-gold/10 p-2 hover:border-gold/30 transition-colors">
                        <div className="flex items-center gap-2">
                          <span>{def.icon}</span>
                          <span className="font-mono-game text-[10px] text-parchment">{def.name} ×{slot.qty}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-game text-[10px] text-rep-trade">{sellPrice}g</span>
                          <button onClick={() => sellItemAction(slot.itemId, 1)}
                            className="px-2 py-0.5 border border-gold/20 font-mono-game text-[8px] text-gold hover:bg-gold/10 cursor-pointer">Sell</button>
                        </div>
                      </div>
                    );
                  })}
                  {inventory.slots.every(s => s === null) && <p className="font-mono-game text-[10px] text-mist/40 italic">Nothing to sell.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
