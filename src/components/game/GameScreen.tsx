import { useGameStore } from '@/lib/gameStore';
import { LOCATIONS, SEASON_NAMES, SEASON_ICONS } from '@/lib/gameData';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameScreen() {
  const {
    currentLocation, currentEvent, lastResult, season, tick, npcs,
    reputation,
  } = useGameStore();
  const travel = useGameStore(s => s.travel);
  const makeChoice = useGameStore(s => s.makeChoice);
  const dismissResult = useGameStore(s => s.dismissResult);

  const loc = LOCATIONS.find(l => l.id === currentLocation);
  const connectedLocs = loc?.connections.map(id => LOCATIONS.find(l => l.id === id)).filter(Boolean) || [];
  const localNpcs = npcs.filter(n => n.location === currentLocation);

  if (!loc) return null;

  return (
    <div className="h-full flex flex-col overflow-y-auto game-scroll">
      {/* Location header */}
      <div className="border-b border-gold/15 p-6 bg-gold/[0.02]">
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase">{loc.biome}</p>
          <p className="font-mono text-[10px] text-mist">
            {SEASON_ICONS[season]} {SEASON_NAMES[season]} · Tick {tick}
          </p>
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-parchment flex items-center gap-3">
          <span>{loc.icon}</span>
          {loc.name}
        </h2>
        <p className="mt-3 text-mist text-[15px] leading-relaxed max-w-2xl">{loc.description}</p>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 flex flex-col gap-5">
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

        {/* Travel options */}
        {!currentEvent && !lastResult && (
          <div className="mt-auto">
            <p className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase mb-3">Travel</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {connectedLocs.map(dest => dest && (
                <button
                  key={dest.id}
                  onClick={() => travel(dest.id)}
                  className="p-3 border border-gold/10 bg-gold/[0.02] text-left
                    hover:bg-gold/[0.06] hover:border-gold/25 transition-all cursor-pointer group"
                >
                  <span className="text-lg mr-2">{dest.icon}</span>
                  <span className="font-display text-sm text-parchment group-hover:text-gold transition-colors">
                    {dest.name}
                  </span>
                  <p className="font-mono text-[10px] text-mist mt-1">{dest.biome}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
