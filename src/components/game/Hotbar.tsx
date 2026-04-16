import { useEffect } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ITEMS } from '@/lib/items';

export default function Hotbar() {
  const inventory = useGameStore(s => s.inventory);
  const activeSlot = useGameStore(s => s.activeSlot);
  const setActive = useGameStore(s => s.setActiveSlot);
  const phase = useGameStore(s => s.phase);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName ?? '')) return;
      const n = parseInt(e.key);
      if (n >= 1 && n <= 6) setActive(n - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setActive]);

  if (phase !== 'playing' && phase !== 'sailing') return null;

  const slots = inventory.slots.slice(0, 6);
  const activeItem = slots[activeSlot];
  const activeDef = activeItem ? ITEMS[activeItem.itemId] : null;

  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1 pointer-events-auto select-none">
      {slots.map((slot, i) => {
        const isActive = i === activeSlot;
        const def = slot ? ITEMS[slot.itemId] : null;
        const isEmpty = !slot;
        return (
          <motion.button
            key={i}
            onClick={() => setActive(i)}
            whileTap={{ scale: 0.93 }}
            className={`relative w-12 h-12 flex flex-col items-center justify-center border transition-all duration-150 cursor-pointer ${isActive ? 'border-gold bg-gold/15 shadow-[0_0_8px_rgba(201,168,76,0.35)]' : 'border-gold/15 bg-ink/80 hover:border-gold/35 hover:bg-gold/5'}`}
            style={{ backdropFilter: 'blur(4px)' }}
          >
            <span className="absolute top-0.5 left-1 font-mono text-[8px] text-gold/40 leading-none">{i + 1}</span>
            {!isEmpty && def ? (
              <>
                <span className="text-lg leading-none mt-1">{def.icon}</span>
                {slot!.qty > 1 && <span className="absolute bottom-0.5 right-1 font-mono text-[8px] text-gold/70 leading-none">{slot!.qty}</span>}
              </>
            ) : (
              <span className="w-4 h-4 border border-dashed border-gold/10 rounded-sm" />
            )}
            {isActive && <motion.div layoutId="activeBar" className="absolute left-0 top-1 bottom-1 w-[2px] bg-gold rounded-full" />}
          </motion.button>
        );
      })}

      <AnimatePresence mode="wait">
        {activeDef && (
          <motion.div
            key={activeDef.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className="mt-1 w-28 bg-ink/95 border border-gold/15 p-2"
            style={{ backdropFilter: 'blur(6px)' }}
          >
            <p className="font-display text-[10px] text-gold leading-tight">{activeDef.name}</p>
            {activeDef.description && <p className="font-body text-[9px] text-mist/60 leading-snug mt-0.5 italic">{activeDef.description}</p>}
            <p className="font-mono text-[8px] text-gold/30 uppercase tracking-wider mt-1">
              {activeDef.type}
              {activeDef.damage ? ` · ${activeDef.damage} dmg` : ''}
              {activeDef.armor ? ` · ${activeDef.armor} def` : ''}
              {activeDef.foodValue ? ` · +${activeDef.foodValue} hunger` : ''}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
