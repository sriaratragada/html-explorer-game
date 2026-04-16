import { useGameStore } from './gameStore';
import { tickWeather } from './weatherSystem';
import { getDayNightPhase, TICKS_PER_DAY } from './timeSystem';
import { tickMarket } from './economySystem';
import { tickFaction } from './factionSystem';
import { refreshBountyBoard } from './bountyBoard';
import { getEntitiesNear, spawnEntity, moveEntity, respawnWildlifeFarFrom } from './worldEntities';
import { enemyAttackDamage, getAggroRadius } from './combatSystem';
import { getTotalArmor } from './craftingSystem';
import { MAP_W, MAP_H, CHUNK_SIZE, getContinentAt } from './mapGenerator';

const DEFAULT_TICK_MS = 1500;
let tickInterval: ReturnType<typeof setInterval> | null = null;

function onTick() {
  const state = useGameStore.getState();
  if (state.currentEvent || state.lastResult || state.phase === 'dead' || state.phase === 'title' || state.phase === 'dungeon') return;
  if (state.overlay !== 'none') return;

  const newWorldTime = state.worldTime + 1;
  const newDayNight = getDayNightPhase(newWorldTime);

  const SEASON_ORDER = ['thaw', 'summer', 'harvest', 'dark'] as const;
  const dayNum = Math.floor(newWorldTime / TICKS_PER_DAY);
  const seasonIdx = Math.floor(dayNum / 12) % 4;
  const newSeason = SEASON_ORDER[seasonIdx];

  // Weather
  const newWeather = tickWeather(state.weather as any, newWorldTime);

  // Hunger decay
  let newHunger = Math.max(0, state.hunger - 0.02);
  let newHealth = state.health;
  let newPhase = state.phase;
  if (newHunger === 0) newHealth = Math.max(0, newHealth - 0.1);
  else if (newHunger < 20) newHealth = Math.max(0, newHealth - 0.02);
  if (newHealth <= 0) newPhase = 'dead';

  // Economy: tick markets every 10 ticks
  let newMarkets = state.markets;
  if (newWorldTime % 10 === 0) {
    newMarkets = { ...newMarkets };
    for (const [locId, market] of Object.entries(newMarkets)) {
      newMarkets[locId] = tickMarket(market);
    }
  }

  // Factions: tick each in-game day (every 48 ticks)
  let newFactionStates = state.factionStates;
  if (newWorldTime % TICKS_PER_DAY === 0) {
    newFactionStates = { ...newFactionStates };
    for (const [id, faction] of Object.entries(newFactionStates)) {
      newFactionStates[id] = tickFaction(faction);
    }
  }

  // Bounty boards: refresh
  let newBountyBoards = state.bountyBoards;
  if (newWorldTime % 50 === 0) {
    newBountyBoards = { ...newBountyBoards };
    for (const [locId, board] of Object.entries(newBountyBoards)) {
      newBountyBoards[locId] = refreshBountyBoard(board, newWorldTime);
    }
  }

  // Enemy aggro: nearby enemies move toward player and attack
  const aggroEnemies = getEntitiesNear(state.playerX, state.playerY, 15);
  for (const enemy of aggroEnemies) {
    if (!['wolf', 'bandit', 'warband', 'bear'].includes(enemy.kind)) continue;
    const dist = Math.sqrt((enemy.x - state.playerX) ** 2 + (enemy.y - state.playerY) ** 2);
    const aggroR = getAggroRadius(enemy);
    if (dist > aggroR) continue;

    // Move toward player
    const dx = Math.sign(state.playerX - enemy.x);
    const dy = Math.sign(state.playerY - enemy.y);
    moveEntity(enemy.id, enemy.x + dx, enemy.y + dy);

    // Attack if adjacent
    if (dist < 2) {
      const armor = getTotalArmor(state.inventory);
      const dmg = enemyAttackDamage(enemy, armor);
      newHealth = Math.max(0, newHealth - dmg);
      if (newHealth <= 0) newPhase = 'dead';
    }
  }

  // Animal behavior: herbivores flee from player if too close
  const nearbyAnimals = getEntitiesNear(state.playerX, state.playerY, 20);
  for (const animal of nearbyAnimals) {
    if (!['deer', 'sheep', 'rabbit'].includes(animal.kind)) continue;
    const dist = Math.sqrt((animal.x - state.playerX) ** 2 + (animal.y - state.playerY) ** 2);
    if (dist < 8) {
      const dx = Math.sign(animal.x - state.playerX);
      const dy = Math.sign(animal.y - state.playerY);
      moveEntity(animal.id, animal.x + dx, animal.y + dy);
    }
  }

  // Slow wildlife respawn (far from player) when hunted out
  if (newWorldTime % 100 === 0 && state.phase === 'playing') {
    respawnWildlifeFarFrom(state.playerX, state.playerY, newWorldTime);
  }

  // Resource respawn: small chance each tick to spawn new resources near player's continent
  if (newWorldTime % 20 === 0) {
    const hashR = (a: number, b: number) => { let h = (a * 374761393 + b * 668265263 + newWorldTime) & 0xffffffff; return ((h ^ (h >> 16)) & 0x7fffffff) / 0x7fffffff; };
    for (let i = 0; i < 5; i++) {
      const rx = state.playerX + Math.floor((hashR(i * 31, newWorldTime) - 0.5) * 200);
      const ry = state.playerY + Math.floor((hashR(i * 47, newWorldTime + 100) - 0.5) * 200);
      if (rx < 0 || rx >= MAP_W || ry < 0 || ry >= MAP_H) continue;
      const roll = hashR(rx, ry);
      const kind = roll < 0.3 ? 'resource_tree' as const : roll < 0.5 ? 'resource_rock' as const : roll < 0.7 ? 'resource_herb' as const : 'resource_berry' as const;
      spawnEntity(kind, rx, ry, {}, 1);
    }
  }

  // Quest advancement: check goto steps
  const newQuests = state.quests.map(q => {
    if (q.state !== 'active') return q;
    let changed = false;
    const steps = q.steps.map(s => {
      if (s.completed) return s;
      if (s.type === 'goto' && s.targetLocation === state.currentLocation) { changed = true; return { ...s, completed: true }; }
      return s;
    });
    if (!changed) return q;
    const allDone = steps.every(s => s.completed);
    return { ...q, steps, state: allDone ? 'completed' as const : q.state };
  });

  useGameStore.setState({
    worldTime: newWorldTime, dayNightPhase: newDayNight, weather: newWeather,
    season: newSeason, hunger: newHunger, health: newHealth, phase: newPhase,
    markets: newMarkets, factionStates: newFactionStates, bountyBoards: newBountyBoards,
    quests: newQuests,
  });
}

export function startTicker(rate = DEFAULT_TICK_MS) {
  stopTicker();
  tickInterval = setInterval(onTick, rate);
}

export function stopTicker() {
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
}

export function setTickRate(ms: number) {
  if (tickInterval) { stopTicker(); startTicker(ms); }
}

export function isTickerRunning(): boolean {
  return tickInterval !== null;
}
