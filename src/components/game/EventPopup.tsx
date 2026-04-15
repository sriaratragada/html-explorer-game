import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { Reputation } from '@/lib/gameTypes';
import { motion, AnimatePresence } from 'framer-motion';

export default function EventPopup() {
  const currentEvent = useGameStore(s => s.currentEvent);
  const lastResult = useGameStore(s => s.lastResult);
  const makeChoice = useGameStore(s => s.makeChoice);
  const dismissResult = useGameStore(s => s.dismissResult);
  const reputation = useGameStore(s => s.reputation);

  const [displayedText, setDisplayedText] = useState('');
  const [typewriterDone, setTypewriterDone] = useState(false);

  // Typewriter effect
  useEffect(() => {
    const text = currentEvent?.narrative || lastResult || '';
    if (!text) { setDisplayedText(''); setTypewriterDone(true); return; }
    setTypewriterDone(false);
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        setTypewriterDone(true);
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [currentEvent?.id, lastResult]);

  // Number key shortcuts for choices
  useEffect(() => {
    if (!currentEvent || !typewriterDone) return;
    const handler = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= currentEvent.choices.length) {
        const choice = currentEvent.choices[num - 1];
        if (choice.requiresRep) {
          const meetsReqs = Object.entries(choice.requiresRep).every(
            ([key, val]) => reputation[key as keyof Reputation] >= (val || 0)
          );
          if (!meetsReqs) return;
        }
        makeChoice(choice.id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentEvent, typewriterDone, makeChoice, reputation]);

  // Space/Enter to dismiss result
  useEffect(() => {
    if (!lastResult) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        dismissResult();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lastResult, dismissResult]);

  // Skip typewriter on click
  const skipTypewriter = useCallback(() => {
    const text = currentEvent?.narrative || lastResult || '';
    setDisplayedText(text);
    setTypewriterDone(true);
  }, [currentEvent, lastResult]);

  const show = currentEvent || lastResult;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute bottom-12 left-4 right-4 z-50 max-w-2xl mx-auto pointer-events-auto"
        >
          <div className="bg-ink/95 border border-gold/20 backdrop-blur-md p-4 shadow-lg"
            style={{ boxShadow: '0 -4px 30px rgba(200,170,80,0.08)' }}
          >
            {/* Title */}
            {currentEvent && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-[1px] bg-gold/30" />
                <span className="font-display text-xs text-gold uppercase tracking-widest">
                  {currentEvent.title}
                </span>
                <div className="flex-1 h-[1px] bg-gold/30" />
              </div>
            )}

            {/* Narrative text */}
            <div
              onClick={!typewriterDone ? skipTypewriter : undefined}
              className="font-body text-sm text-parchment/90 leading-relaxed mb-3 cursor-default min-h-[2rem]"
            >
              {displayedText}
              {!typewriterDone && <span className="text-gold animate-pulse">▊</span>}
            </div>

            {/* Choices */}
            {currentEvent && typewriterDone && (
              <div className="space-y-1.5">
                {currentEvent.choices.map((choice, idx) => {
                  const locked = choice.requiresRep && !Object.entries(choice.requiresRep).every(
                    ([key, val]) => reputation[key as keyof Reputation] >= (val || 0)
                  );
                  return (
                    <button
                      key={choice.id}
                      onClick={() => !locked && makeChoice(choice.id)}
                      disabled={!!locked}
                      className={`w-full text-left px-3 py-2 border font-mono-game text-[11px] transition-all cursor-pointer
                        ${locked
                          ? 'border-gold/5 text-mist/30 cursor-not-allowed'
                          : 'border-gold/15 text-parchment/80 hover:border-gold/40 hover:bg-gold/5 hover:text-gold'
                        }`}
                    >
                      <span className="text-gold/40 mr-2">[{idx + 1}]</span>
                      {choice.text}
                      {locked && choice.requiresRep && (
                        <span className="ml-2 text-[9px] text-blood/60">
                          (Requires: {Object.entries(choice.requiresRep).map(([k, v]) => `${k} ${v}`).join(', ')})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Result dismiss */}
            {lastResult && typewriterDone && (
              <button
                onClick={dismissResult}
                className="mt-2 px-4 py-1.5 border border-gold/20 font-mono-game text-[10px] text-gold
                  hover:bg-gold/10 transition-all cursor-pointer"
              >
                Continue [Space]
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
