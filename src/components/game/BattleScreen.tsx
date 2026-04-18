import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';

export default function BattleScreen() {
  const phase = useGameStore(s => s.phase);
  const battleState = useGameStore(s => s.battleState);
  const strike = useGameStore(s => s.battleStrikeAction);
  const guard = useGameStore(s => s.battleGuardAction);
  const flee = useGameStore(s => s.battleFleeAction);
  const health = useGameStore(s => s.health);
  const maxHealth = useGameStore(s => s.maxHealth);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (phase !== 'battle') return;
      if (e.key === '1' || e.key === 'a' || e.key === 'A') strike();
      else if (e.key === '2' || e.key === 'g' || e.key === 'G') guard();
      else if (e.key === '3' || e.key === 'f' || e.key === 'F') flee();
    },
    [phase, strike, guard, flee],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  if (phase !== 'battle' || !battleState) return null;

  const foePct = Math.max(0, (battleState.foeHp / battleState.foeMaxHp) * 100);
  const hpPct = Math.max(0, (health / maxHealth) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-[45] flex flex-col items-center justify-end pb-16 pointer-events-auto bg-gradient-to-t from-black/90 via-ink/85 to-transparent"
    >
      <div className="w-full max-w-lg px-4">
        <div className="border border-gold/25 rounded-lg bg-ink/95 backdrop-blur-md p-4 shadow-xl">
          <p className="font-display text-xs text-gold uppercase tracking-widest mb-2 text-center">Encounter</p>
          <p className="font-body text-sm text-parchment text-center mb-4">{battleState.label}</p>

          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <p className="font-mono-game text-[9px] text-mist/70 mb-1">You</p>
              <div className="h-2 rounded bg-black/50 border border-gold/15 overflow-hidden">
                <div className="h-full bg-emerald-600/90 transition-all" style={{ width: `${hpPct}%` }} />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-mono-game text-[9px] text-mist/70 mb-1">Foe</p>
              <div className="h-2 rounded bg-black/50 border border-gold/15 overflow-hidden">
                <div className="h-full bg-rose-700/90 transition-all" style={{ width: `${foePct}%` }} />
              </div>
            </div>
          </div>

          <div className="max-h-24 overflow-y-auto mb-4 space-y-1 font-mono-game text-[10px] text-mist/85">
            {battleState.log.slice(-8).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => strike()}
              className="py-2 border border-gold/30 font-mono-game text-[10px] text-gold hover:bg-gold/10 rounded"
            >
              [1] Strike
            </button>
            <button
              type="button"
              onClick={() => guard()}
              className="py-2 border border-gold/30 font-mono-game text-[10px] text-gold hover:bg-gold/10 rounded"
            >
              [2] Guard
            </button>
            <button
              type="button"
              onClick={() => flee()}
              className="py-2 border border-gold/20 font-mono-game text-[10px] text-mist hover:bg-white/5 rounded"
            >
              [3] Flee
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
