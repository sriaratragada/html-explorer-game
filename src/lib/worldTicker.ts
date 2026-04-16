import { useGameStore } from './gameStore';
import { tickWeather } from './weatherSystem';
import { getDayNightPhase, TICKS_PER_DAY } from './timeSystem';

const DEFAULT_TICK_MS = 1500;
let tickInterval: ReturnType<typeof setInterval> | null = null;
let tickRate = DEFAULT_TICK_MS;

function onTick() {
  const state = useGameStore.getState();
  // Pause when modal is open, dead, dungeon, or title
  if (state.currentEvent || state.lastResult || state.phase === 'dead' || state.phase === 'title' || state.phase === 'dungeon') return;
  if (state.overlay !== 'none') return;

  const newWorldTime = (state as any).worldTime != null ? (state as any).worldTime + 1 : state.tick + 1;
  const newDayNight = getDayNightPhase(newWorldTime);

  // Season: every 12 in-game days = 1 season
  const SEASON_ORDER = ['thaw', 'summer', 'harvest', 'dark'] as const;
  const dayNum = Math.floor(newWorldTime / TICKS_PER_DAY);
  const seasonIdx = Math.floor(dayNum / 12) % 4;
  const newSeason = SEASON_ORDER[seasonIdx];

  // Weather
  const currentWeather = (state as any).weather ?? {};
  const newWeather = Object.keys(currentWeather).length > 0 ? tickWeather(currentWeather, newWorldTime) : currentWeather;

  // Hunger decay each tick (slow — 0.02 per tick = ~1 per in-game hour)
  let newHunger = Math.max(0, state.hunger - 0.02);
  let newHealth = state.health;
  let newPhase = state.phase;
  if (newHunger === 0) newHealth = Math.max(0, newHealth - 0.1);
  else if (newHunger < 20) newHealth = Math.max(0, newHealth - 0.02);
  if (newHealth <= 0) newPhase = 'dead';

  useGameStore.setState({
    tick: state.tick, // keep legacy tick separate
    hunger: newHunger,
    health: newHealth,
    season: newSeason,
    phase: newPhase,
    ...({ worldTime: newWorldTime, dayNightPhase: newDayNight, weather: newWeather } as any),
  });
}

export function startTicker(rate = DEFAULT_TICK_MS) {
  stopTicker();
  tickRate = rate;
  tickInterval = setInterval(onTick, tickRate);
}

export function stopTicker() {
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
}

export function setTickRate(ms: number) {
  tickRate = ms;
  if (tickInterval) { stopTicker(); startTicker(tickRate); }
}

export function isTickerRunning(): boolean {
  return tickInterval !== null;
}
