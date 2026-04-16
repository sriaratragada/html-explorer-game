import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { KINGDOM_LORE } from '@/lib/worldLore';

const FACTION_COLORS: Record<string, string> = {
  auredia_crown: '#c9a84c',
  korrath: '#8a4444',
  vell: '#4488aa',
  sarnak: '#7a6a3a',
};

export default function FactionPanel() {
  const overlay = useGameStore(s => s.overlay);
  const setOverlay = useGameStore(s => s.setOverlay);
  const factions = useGameStore(s => s.factions);

  if (overlay !== 'faction') return null;

  const kingdoms = Object.entries(KINGDOM_LORE);

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
            <h2 className="font-display text-2xl text-gold gold-glow">Kingdoms & Factions</h2>
            <button onClick={() => setOverlay('none')} className="font-mono-game text-xs text-mist hover:text-gold transition-colors cursor-pointer">[ESC] Close</button>
          </div>

          <div className="space-y-4">
            {kingdoms.map(([id, lore]) => (
              <div key={id} className="border border-gold/10 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: FACTION_COLORS[id] ?? '#666' }} />
                  <span className="font-display text-sm text-parchment">{lore.name}</span>
                </div>
                <p className="font-mono-game text-[10px] text-mist/60 italic mb-1">"{lore.motto}"</p>
                <p className="font-body text-[11px] text-mist/70 leading-relaxed">{lore.description}</p>
                <p className="font-mono-game text-[9px] text-gold/50 mt-2">Ruler: {lore.ruler}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
