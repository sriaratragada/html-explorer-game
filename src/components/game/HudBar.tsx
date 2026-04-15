import { useGameStore } from '@/lib/gameStore';
import { SEASON_NAMES, SEASON_ICONS, REP_LABELS, LOCATIONS, ENVIRONMENT_ACTIONS } from '@/lib/gameData';
import { LOCATION_COORDS } from '@/lib/mapGenerator';
import { TileType } from '@/lib/mapGenerator';
import { getMap } from '@/lib/gameStore';

export default function HudBar() {
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

  const locData = nearestLocation ? LOCATIONS.find(l => l.id === nearestLocation) : null;

  // Get current terrain for environment actions
  const map = getMap();
  const currentTile: TileType = (playerY >= 0 && playerY < 800 && playerX >= 0 && playerX < 800)
    ? map.tiles[playerY][playerX] : 'grass';

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
          {/* Left — season & location */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{SEASON_ICONS[season]}</span>
              <span className="font-mono-game text-[10px] text-mist uppercase tracking-wider">
                {SEASON_NAMES[season]}
              </span>
              <span className="font-mono-game text-[9px] text-mist/50">T{tick}</span>
            </div>
            {locData && (
              <div className="flex items-center gap-1.5 border-l border-gold/10 pl-4">
                <span className="text-sm">{locData.icon}</span>
                <span className="font-display text-xs text-parchment">{locData.name}</span>
              </div>
            )}
          </div>

          {/* Center — title */}
          <div className="font-display text-xs text-gold gold-glow hidden sm:block">
            {playerTitle}
          </div>

          {/* Right — rep icons + hotkeys */}
          <div className="flex items-center gap-3">
            {topReps.map(([key, val]) => (
              <div key={key} className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${REP_LABELS[key]?.color}`} />
                <span className="font-mono-game text-[9px] text-mist">{val}</span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
