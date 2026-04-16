import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { RECIPES } from '@/lib/recipes';
import { ITEMS } from '@/lib/items';

export default function CraftingPanel() {
  const overlay = useGameStore(s => s.overlay);
  const setOverlay = useGameStore(s => s.setOverlay);

  if (overlay !== 'crafting') return null;

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
            <h2 className="font-display text-2xl text-gold gold-glow">Crafting</h2>
            <button onClick={() => setOverlay('none')} className="font-mono-game text-xs text-mist hover:text-gold transition-colors cursor-pointer">[ESC] Close</button>
          </div>

          <div className="space-y-2">
            {RECIPES.map(recipe => {
              const outputDef = ITEMS[recipe.output.itemId];
              return (
                <div key={recipe.id} className="border border-gold/10 p-3 flex items-center justify-between hover:border-gold/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{outputDef?.icon ?? '?'}</span>
                    <div>
                      <p className="font-display text-xs text-parchment">{recipe.name}</p>
                      <p className="font-mono-game text-[9px] text-mist/50">
                        {recipe.inputs.map(i => `${i.qty}× ${ITEMS[i.itemId]?.name ?? i.itemId}`).join(' + ')}
                      </p>
                      {recipe.workbench && <span className="font-mono-game text-[8px] text-gold/40">Requires: {recipe.workbench}</span>}
                      {recipe.skillReq && <span className="font-mono-game text-[8px] text-gold/40 ml-2">{recipe.skillReq.skill} Lv{recipe.skillReq.level}</span>}
                    </div>
                  </div>
                  <button className="px-3 py-1 border border-gold/20 font-mono-game text-[10px] text-gold hover:bg-gold/10 transition-all cursor-pointer opacity-40">
                    Craft
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
