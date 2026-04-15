import { useGameStore } from '@/lib/gameStore';
import { LOCATIONS, SEASON_NAMES, SEASON_ICONS } from '@/lib/gameData';
import { motion, AnimatePresence } from 'framer-motion';
import WorldMap from './WorldMap';
import { useState } from 'react';

type ViewMode = 'map' | 'narrative';

export default function GameScreen() {
  const {
    currentLocation, currentEvent, lastResult, season, tick, npcs,
    reputation,
  } = useGameStore();
  const makeChoice = useGameStore(s => s.makeChoice);
  const dismissResult = useGameStore(s => s.dismissResult);

  const loc = LOCATIONS.find(l => l.id === currentLocation);
  const localNpcs = npcs.filter(n => n.location === currentLocation);

  // Auto-switch to narrative when event/result active
  const hasNarrative = !!currentEvent || !!lastResult;
  const [preferMap, setPreferMap] = useState(true);
  const viewMode: ViewMode = hasNarrative && !preferMap ? 'narrative' : preferMap ? 'map' : 'narrative';

  if (!loc) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="border-b border-gold/15 px-4 py-2 bg-gold/[0.02] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-lg">{loc.icon}</span>
          <div>
            <h2 className="font-display text-lg font-bold text-parchment leading-tight">{loc.name}</h2>
            <p className="font-mono text-[9px] tracking-[0.2em] text-gold uppercase">{loc.biome}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="font-mono text-[10px] text-mist">
            {SEASON_ICONS[season]} {SEASON_NAMES[season]} · Tick {tick}
          </p>
          {/* View toggle */}
          <div className="flex border border-gold/20">
            <button
              onClick={() => setPreferMap(true)}
              className={`px-3 py-1 font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer
                ${viewMode === 'map' ? 'bg-gold/15 text-gold' : 'text-mist hover:text-parchment hover:bg-gold/[0.05]'}`}
            >
              🗺️ Map
            </button>
            <button
              onClick={() => setPreferMap(false)}
              className={`px-3 py-1 font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer border-l border-gold/20
                ${viewMode === 'narrative' ? 'bg-gold/15 text-gold' : 'text-mist hover:text-parchment hover:bg-gold/[0.05]'}
                ${hasNarrative ? 'animate-pulse' : ''}`}
            >
              📜 {hasNarrative ? 'Event!' : 'Details'}
            </button>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0 relative">
        {viewMode === 'map' ? (
          <WorldMap />
        ) : (
          <div className="h-full overflow-y-auto game-scroll p-6 flex flex-col gap-5">
            {/* Location description */}
            <p className="text-mist text-[15px] leading-relaxed max-w-2xl">{loc.description}</p>

            <AnimatePresence mode="wait">
              {/* Active Event */}
              {currentEvent && !lastResult && (
                <motion.div
                  key="event"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="border border-gold/25 bg-gold/[0.04] p-6"
                >
                  <p className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase mb-2">Event</p>
                  <h3 className="font-display text-xl font-semibold text-parchment mb-3">{currentEvent.title}</h3>
                  <p className="text-mist text-[15px] leading-[1.85] mb-6">{currentEvent.narrative}</p>

                  <div className="flex flex-col gap-2">
                    {currentEvent.choices.map(choice => {
                      const locked = choice.requiresRep && Object.entries(choice.requiresRep).some(
                        ([key, val]) => reputation[key as keyof typeof reputation] < (val || 0)
                      );

                      return (
                        <button
                          key={choice.id}
                          onClick={() => !locked && makeChoice(choice.id)}
                          disabled={!!locked}
                          className={`text-left p-4 border transition-all cursor-pointer
                            ${locked
                              ? 'border-foreground/10 bg-foreground/[0.02] text-mist/50 cursor-not-allowed'
                              : 'border-gold/15 bg-gold/[0.02] text-mist hover:bg-gold/[0.08] hover:border-gold/30 hover:text-parchment'
                            }`}
                        >
                          <span className="text-[15px]">{choice.text}</span>
                          {locked && choice.requiresRep && (
                            <span className="block mt-1 font-mono text-[10px] text-blood/70 uppercase tracking-wider">
                              Requires: {Object.entries(choice.requiresRep).map(([k, v]) => `${k} ${v}+`).join(', ')}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Result */}
              {lastResult && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="border border-gold/25 bg-gold/[0.04] p-6"
                >
                  <p className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase mb-3">Consequence</p>
                  <p className="text-parchment text-[16px] leading-[1.85] italic">{lastResult}</p>
                  <button
                    onClick={dismissResult}
                    className="mt-5 px-6 py-2.5 border border-gold/20 bg-gold/[0.05] font-display text-xs tracking-[0.15em] text-gold uppercase
                      hover:bg-gold/15 transition-all cursor-pointer"
                  >
                    Continue
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* NPCs present */}
            {localNpcs.length > 0 && !currentEvent && !lastResult && (
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase mb-3">People Here</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {localNpcs.map(npc => (
                    <div key={npc.id} className="p-3 border border-foreground/[0.06] bg-foreground/[0.02] flex items-start gap-3">
                      <div className="w-8 h-8 border border-gold/20 flex items-center justify-center text-sm bg-background">
                        {npc.faction !== 'none' ? (
                          <span>{
                            npc.faction === 'amber' ? '⚖️' :
                            npc.faction === 'iron' ? '⚔️' :
                            npc.faction === 'green' ? '🌿' :
                            npc.faction === 'scholar' ? '🔮' :
                            npc.faction === 'ashen' ? '🗡️' :
                            npc.faction === 'tide' ? '🌊' : '👤'
                          }</span>
                        ) : <span>👤</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm font-semibold text-parchment">{npc.name}</p>
                        <p className="font-mono text-[10px] text-mist truncate">{npc.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`font-mono text-[10px] ${npc.disposition > 10 ? 'text-rep-trade' : npc.disposition < -10 ? 'text-blood' : 'text-mist'}`}>
                            {npc.disposition > 20 ? 'Warm' : npc.disposition > 10 ? 'Friendly' : npc.disposition < -20 ? 'Hostile' : npc.disposition < -10 ? 'Wary' : 'Neutral'}
                          </span>
                          {npc.memories.length > 0 && (
                            <span className="font-mono text-[9px] text-gold/40">{npc.memories.length} memories</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Event notification overlay on map */}
        {viewMode === 'map' && hasNarrative && (
          <button
            onClick={() => setPreferMap(false)}
            className="absolute top-4 left-1/2 -translate-x-1/2 px-5 py-2.5 border border-gold/40 bg-ink/95 backdrop-blur-sm
              font-display text-sm text-gold hover:bg-gold/15 transition-all cursor-pointer animate-pulse z-40"
          >
            ⚡ An event demands your attention
          </button>
        )}
      </div>
    </div>
  );
}
