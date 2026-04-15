import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { SEASON_NAMES, SEASON_ICONS, REP_LABELS, LOCATIONS, ENVIRONMENT_ACTIONS } from '@/lib/gameData';
import { LOCATION_COORDS, TileType, TILE_NAMES, MAP_W } from '@/lib/mapGenerator';
import { getMap } from '@/lib/gameStore';

export default function HudBar() {
  const [hoverHealth, setHoverHealth] = useState(false);
  const [hoverHunger, setHoverHunger] = useState(false);
  const [hoverSeason, setHoverSeason] = useState(false);
  const [hoverRep, setHoverRep] = useState<string | null>(null);

  const season = useGameStore(s => s.season);
  const tick = useGameStore(s => s.tick);
  const playerTitle = useGameStore(s => s.playerTitle);
  const nearestLocation = useGameStore(s => s.nearestLocation);
  const reputation = useGameStore(s => s.reputation);
  const playerX = useGameStore(s => s.playerX);
  const playerY = useGameStore(s => s.playerY);
  const environmentCooldowns = useGameStore(s => s.environmentCooldowns);
  const setOverlay = useGameStore(s => s.setOverlay);
  const performEnvironmentAction = useGameStore(s => s.performEnvironmentAction);
  const health    = useGameStore(s => s.health);
  const maxHealth = useGameStore(s => s.maxHealth);
  const hunger    = useGameStore(s => s.hunger);

  const locData = nearestLocation ? LOCATIONS.find(l => l.id === nearestLocation) : null;

  // Get current terrain for environment actions
  const map = getMap();
  const currentTile: TileType = (playerX >= 0 && playerX < MAP_W && playerY >= 0 && playerY < MAP_W)
    ? (TILE_NAMES[map.tiles[playerY * MAP_W + playerX]] ?? 'grass')
    : 'grass';

  const availableActions = ENVIRONMENT_ACTIONS.filter(a =>
    a.terrain === currentTile && (!environmentCooldowns[a.id] || tick >= environmentCooldowns[a.id])
  );

  // Get top 3 rep stats
  const topReps = Object.entries(reputation)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .filter(([, v]) => v > 0);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-auto">
      {/* Environment actions row */}
      {availableActions.length > 0 && (
        <div className="flex justify-center gap-2 mb-1 px-4">
          {availableActions.map(action => (
            <button
              key={action.id}
              onClick={() => performEnvironmentAction(action.id)}
              className="px-3 py-1 bg-ink/90 border border-gold/20 font-mono-game text-[10px] text-gold
                hover:bg-gold/10 hover:border-gold/40 transition-all cursor-pointer backdrop-blur-sm"
              title={action.label}
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Main HUD bar */}
      <div className="bg-ink/95 border-t border-gold/15 backdrop-blur-md px-4 py-2">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          {/* Left — vital bars + season & location */}
          <div className="flex flex-col gap-1">
            {/* Vital bars */}
            <div className="flex items-center gap-3">
              {/* Health bar with tooltip */}
              <div className="flex items-center gap-1 relative" onMouseEnter={() => setHoverHealth(true)} onMouseLeave={() => setHoverHealth(false)}>
                <span className="text-[11px]">❤️</span>
                <div className="w-20 h-1.5 bg-ash overflow-hidden border border-gold/10">
                  <div
                    className={`h-full transition-all duration-300 ${health < 25 ? 'animate-pulse-blood bg-blood' : 'bg-blood/70'}`}
                    style={{ width: `${(health / maxHealth) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[8px] text-mist/50">{Math.ceil(health)}</span>
                {/* Tooltip */}
                <AnimatePresence>
                  {hoverHealth && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute bottom-full mb-1 left-0 bg-ink/95 border border-gold/20 px-2 py-1 rounded text-[8px] text-mist whitespace-nowrap z-50"
                    >
                      Health: {Math.ceil(health)}/{maxHealth}. Reaches 0 when starving.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Hunger bar with tooltip */}
              <div className="flex items-center gap-1 relative" onMouseEnter={() => setHoverHunger(true)} onMouseLeave={() => setHoverHunger(false)}>
                <span className="text-[11px]">🍖</span>
                <div className="w-20 h-1.5 bg-ash overflow-hidden border border-gold/10">
                  <div
                    className={`h-full transition-all duration-300 ${hunger < 20 ? 'animate-pulse-amber bg-rust' : 'bg-rust/70'}`}
                    style={{ width: `${hunger}%` }}
                  />
                </div>
                <span className="font-mono text-[8px] text-mist/50">{Math.ceil(hunger)}</span>
                {/* Tooltip */}
                <AnimatePresence>
                  {hoverHunger && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute bottom-full mb-1 left-0 bg-ink/95 border border-gold/20 px-2 py-1 rounded text-[8px] text-mist whitespace-nowrap z-50"
                    >
                      Hunger: {Math.ceil(hunger)}%. Press E to eat.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            {/* Season & location row */}
            <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 relative" onMouseEnter={() => setHoverSeason(true)} onMouseLeave={() => setHoverSeason(false)}>
              <span className="text-sm">{SEASON_ICONS[season]}</span>
              <span className="font-mono-game text-[10px] text-mist uppercase tracking-wider">
                {SEASON_NAMES[season]}
              </span>
              <span className="font-mono-game text-[9px] text-mist/50">T{tick}</span>
              {/* Season tooltip */}
              <AnimatePresence>
                {hoverSeason && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-full mt-1 left-0 bg-ink/95 border border-gold/20 px-2 py-1 rounded text-[8px] text-mist whitespace-nowrap z-50"
                  >
                    {season === 'dark' ? 'Winter: Hunger decays faster (0.75/tick)' : 'Hunger decays at normal rate (0.5/tick)'}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {locData && (
              <div className="flex items-center gap-1.5 border-l border-gold/10 pl-4">
                <span className="text-sm">{locData.icon}</span>
                <span className="font-display text-xs text-parchment">{locData.name}</span>
              </div>
            )}
            </div>{/* end season row */}
          </div>{/* end left col */}

          {/* Center — title */}
          <div className="font-display text-xs text-gold gold-glow hidden sm:block">
            {playerTitle}
          </div>

          {/* Right — rep icons + hotkeys */}
          <div className="flex items-center gap-3">
            {topReps.map(([key, val]) => (
              <div key={key} className="relative" onMouseEnter={() => setHoverRep(key as string)} onMouseLeave={() => setHoverRep(null)}>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${REP_LABELS[key]?.color}`} />
                  <span className="font-mono-game text-[9px] text-mist">{val}</span>
                </div>
                {/* Rep tooltip */}
                <AnimatePresence>
                  {hoverRep === key && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-full mt-1 right-0 bg-ink/95 border border-gold/20 px-2 py-1 rounded text-[8px] text-mist whitespace-nowrap z-50"
                    >
                      {REP_LABELS[key]?.label}: {val}/100
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <div className="flex items-center gap-1 border-l border-gold/10 pl-3">
              <button
                onClick={() => setOverlay('player')}
                className="px-2 py-0.5 font-mono-game text-[9px] text-gold/60 hover:text-gold border border-gold/10 hover:border-gold/30 transition-all cursor-pointer"
              >
                [P]
              </button>
              <button
                onClick={() => setOverlay('chronicle')}
                className="px-2 py-0.5 font-mono-game text-[9px] text-gold/60 hover:text-gold border border-gold/10 hover:border-gold/30 transition-all cursor-pointer"
              >
                [C]
              </button>
              <button
                onClick={() => setOverlay('help')}
                className="px-2 py-0.5 font-mono-game text-[9px] text-gold/60 hover:text-gold border border-gold/10 hover:border-gold/30 transition-all cursor-pointer"
              >
                [?]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
