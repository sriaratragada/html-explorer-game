import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';

export default function QuestLog() {
  const overlay = useGameStore(s => s.overlay);
  const setOverlay = useGameStore(s => s.setOverlay);

  if (overlay !== 'quests') return null;

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
            <h2 className="font-display text-2xl text-gold gold-glow">Quest Log</h2>
            <button onClick={() => setOverlay('none')} className="font-mono-game text-xs text-mist hover:text-gold transition-colors cursor-pointer">[ESC] Close</button>
          </div>

          <div className="space-y-4">
            <div className="border border-gold/10 p-4 text-center">
              <p className="font-body text-sm text-mist/50 italic">No active quests.</p>
              <p className="font-mono-game text-[10px] text-mist/30 mt-2">Visit bounty boards in settlements or speak with NPCs to receive quests.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
