import { useEffect } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Hotbar() {
  const hotbar      = useGameStore(s => s.hotbar);
  const activeSlot  = useGameStore(s => s.activeSlot);
  const setActive   = useGameStore(s => s.setActiveSlot);
  const phase       = useGameStore(s => s.phase);

  // 1–6 keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't fire if overlay is open or typing
      if (['INPUT','TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName ?? '')) return;
      const n = parseInt(e.key);
      if (n >= 1 && n <= 6) setActive(n - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setActive]);

  if (phase !== 'playing') return null;

  const active = hotbar[activeSlot];

  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1 pointer-events-auto select-none">
      {/* Slots */}
      {hotbar.map((item, i) => {
        const isActive = i === activeSlot;
        const isEmpty  = !item.id || item.id === 'empty';
        return (
          <motion.button
            key={i}
            onClick={() => setActive(i)}
            whileTap={{ scale: 0.93 }}
            className={`
              relative w-12 h-12 flex flex-col items-center justify-center
              border transition-all duration-150 cursor-pointer
              ${isActive
                ? 'border-gold bg-gold/15 shadow-[0_0_8px_rgba(201,168,76,0.35)]'
                : 'border-gold/15 bg-ink/80 hover:border-gold/35 hover:bg-gold/5'
              }
            `}
            style={{ backdropFilter: 'blur(4px)' }}
          >
            {/* Slot number */}
            <span className="absolute top-0.5 left-1 font-mono text-[8px] text-gold/40 leading-none">
              {i + 1}
            </span>

            {!isEmpty ? (
              <>
                <span className="text-lg leading-none mt-1">{item.icon}</span>
                {item.quantity > 1 && (
                  <span className="absolute bottom-0.5 right-1 font-mono text-[8px] text-gold/70 leading-none">
                    {item.quantity}
                  </span>
                )}
              </>
            ) : (
              <span className="w-4 h-4 border border-dashed border-gold/10 rounded-sm" />
            )}

            {/* Active glow bar on left edge */}
            {isActive && (
              <motion.div
                layoutId="activeBar"
                className="absolute left-0 top-1 bottom-1 w-[2px] bg-gold rounded-full"
              />
            )}
          </motion.button>
        );
      })}

      {/* Active item tooltip — appears below slots */}
      <AnimatePresence mode="wait">
        {active && active.id !== 'empty' && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className="mt-1 w-28 bg-ink/95 border border-gold/15 p-2"
            style={{ backdropFilter: 'blur(6px)' }}
          >
            <p className="font-display text-[10px] text-gold leading-tight">{active.name}</p>
            {active.description && (
              <p className="font-body text-[9px] text-mist/60 leading-snug mt-0.5 italic">
                {active.description}
              </p>
            )}
            {active.type !== 'misc' && (
              <p className="font-mono text-[8px] text-gold/30 uppercase tracking-wider mt-1">
                {active.type}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
