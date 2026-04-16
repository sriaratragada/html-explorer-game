import { create } from 'zustand';
import { GameState, Season, ChronicleEntry, Reputation, FactionStanding, OverlayType, TutorialStep, EnvironmentAction, HotbarItem, DayNightPhase } from './gameTypes';
import { createWeatherState } from './weatherSystem';
import { startTicker, stopTicker } from './worldTicker';
import { INITIAL_NPCS, generateEvents, getWorldEvent, getPlayerTitle, ENVIRONMENT_ACTIONS, FOOD_VALUES } from './gameData';
import { LOCATION_COORDS, isWalkableCode, getTileAt, MAP_W, MAP_H, TILE_NAMES } from './mapGenerator';
import { initWorldEntities, getEntitiesNear, spawnEntity, removeEntity, moveEntity } from './worldEntities';

const SEASON_ORDER: Season[] = ['thaw', 'summer', 'harvest', 'dark'];
const TICKS_PER_SEASON = 12;
const PROXIMITY_RADIUS = 30;

function findNearestLocation(px: number, py: number): string | null {
  let nearest: string | null = null;
  let minDist = Infinity;
  for (const [id, coord] of Object.entries(LOCATION_COORDS)) {
    const d = Math.sqrt((px - coord.x) ** 2 + (py - coord.y) ** 2);
    if (d < PROXIMITY_RADIUS && d < minDist) {
      minDist = d;
      nearest = id;
    }
  }
  return nearest;
}

const STARTER_HOTBAR: HotbarItem[] = [
  { id: 'bare_hands',   name: 'Bare Hands',    icon: '✊', quantity: 1, type: 'tool',    description: 'All you have. For now.' },
  { id: 'rusty_knife',  name: 'Rusty Knife',   icon: '🗡️', quantity: 1, type: 'weapon',  description: 'A worn blade. Better than nothing.' },
  { id: 'flint_steel',  name: 'Flint & Steel', icon: '🔥', quantity: 1, type: 'tool',    description: 'Start fires. Signal for help.' },
  { id: 'waterskin',    name: 'Waterskin',     icon: '🫗', quantity: 1, type: 'misc',    description: 'Empty. Find a river.' },
  { id: 'trail_ration', name: 'Trail Rations', icon: '🍖', quantity: 3, type: 'food',    description: 'Dried meat. Enough for a few days.' },
  { id: 'empty',        name: '',              icon: '',   quantity: 0, type: 'misc',    description: '' },
];

function addItemToHotbar(hotbar: HotbarItem[], item: HotbarItem): HotbarItem[] {
  const next = [...hotbar];
  const existingIdx = next.findIndex(s => s.id === item.id && s.id !== 'empty');
  if (existingIdx !== -1) {
    next[existingIdx] = { ...next[existingIdx], quantity: next[existingIdx].quantity + item.quantity };
    return next;
  }
  const emptyIdx = next.findIndex(s => !s.id || s.id === 'empty');
  if (emptyIdx !== -1) { next[emptyIdx] = { ...item }; return next; }
  return next; // hotbar full — silently drop
}

interface GameStore extends GameState {
  startGame: () => void;
  setActiveSlot: (slot: number) => void;
  useItem: () => void;
  travel: (locationId: string) => void;
  movePlayer: (dx: number, dy: number) => void;
  makeChoice: (choiceId: string) => void;
  dismissResult: () => void;
  viewChronicle: () => void;
  backToGame: () => void;
  advanceTick: () => void;
  setOverlay: (o: OverlayType) => void;
  advanceTutorial: () => void;
  performEnvironmentAction: (actionId: string) => void;
  interactEntity: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'title',
  isMoving: false,
  hotbar: STARTER_HOTBAR,
  activeSlot: 0,
  health: 100,
  maxHealth: 100,
  hunger: 100,
  tick: 0,
  worldTime: 0,
  dayNightPhase: 'day' as DayNightPhase,
  weather: createWeatherState(),
  season: 'thaw',
  seasonTick: 0,
  seed: 42,
  reputation: { conquest: 0, trade: 0, craft: 0, diplomacy: 0, exploration: 0, arcane: 0 },
  factions: { amber: 0, iron: 0, green: 0, scholar: 0, ashen: 0, tide: 0 },
  currentLocation: 'ashenford',
  nearestLocation: 'ashenford',
  playerX: LOCATION_COORDS.ashenford.x,
  playerY: LOCATION_COORDS.ashenford.y,
  npcs: [],
  chronicle: [],
  currentEvent: null,
  lastResult: null,
  visitedLocations: [],
  completedEvents: [],
  playerTitle: 'Unknown Traveler',
  overlay: 'none',
  tutorialStep: 'cinematic',
  environmentCooldowns: {},

  startGame: () => {
    initWorldEntities();
    const npcs = JSON.parse(JSON.stringify(INITIAL_NPCS));
    const initialChronicle: ChronicleEntry = {
      tick: 0, season: 'thaw',
      text: 'A traveler arrived in Ashenford at the start of the Thaw. No one knew their name. No one asked. The world does not care about you. Not yet.',
      type: 'world',
    };

    set({
      phase: 'playing',
      isMoving: false,
      health: 100,
      maxHealth: 100,
      hunger: 100,
      tick: 0,
      worldTime: 14 * 2, // start at noon (hour 14)
      dayNightPhase: 'day',
      weather: createWeatherState(),
      season: 'thaw', seasonTick: 0,
      seed: 42,
      reputation: { conquest: 0, trade: 0, craft: 0, diplomacy: 0, exploration: 0, arcane: 0 },
      factions: { amber: 0, iron: 0, green: 0, scholar: 0, ashen: 0, tide: 0 },
      currentLocation: 'ashenford',
      nearestLocation: 'ashenford',
      playerX: LOCATION_COORDS.ashenford.x,
      playerY: LOCATION_COORDS.ashenford.y,
      npcs,
      chronicle: [initialChronicle],
      currentEvent: null,
      lastResult: null,
      visitedLocations: ['ashenford'],
      completedEvents: [],
      playerTitle: 'Unknown Traveler',
      overlay: 'none',
      tutorialStep: 'movement',
      environmentCooldowns: {},
      hotbar: STARTER_HOTBAR,
      activeSlot: 0,
    });
    startTicker();
  },

  setActiveSlot: (slot: number) => set({ activeSlot: slot }),

  useItem: () => {
    const state = get();
    if (state.phase !== 'playing') return;
    const item = state.hotbar[state.activeSlot];
    if (!item || item.id === 'empty' || item.type !== 'food') return;

    const restore = FOOD_VALUES[item.id] ?? 5;
    const newHunger = Math.min(100, state.hunger + restore);
    const newHotbar = [...state.hotbar];
    if (item.quantity <= 1) {
      newHotbar[state.activeSlot] = { id: 'empty', name: '', icon: '', quantity: 0, type: 'misc', description: '' };
    } else {
      newHotbar[state.activeSlot] = { ...item, quantity: item.quantity - 1 };
    }
    const entry: ChronicleEntry = {
      tick: state.tick, season: state.season,
      text: `The traveler ate ${item.name}. Hunger abates somewhat.`,
      type: 'action',
    };
    set({ hunger: newHunger, hotbar: newHotbar, chronicle: [...state.chronicle, entry] });
  },

  movePlayer: (dx: number, dy: number) => {
    const state = get();
    if (state.currentEvent || state.lastResult || state.phase === 'dead') return;
    
    const nx = state.playerX + dx;
    const ny = state.playerY + dy;
    
    if (nx < 0 || nx >= MAP_W || ny < 0 || ny >= MAP_H) return;
    const tileCode = getTileAt(nx, ny);
    const tileName = TILE_NAMES[tileCode] ?? 'grass';
    if (state.phase === 'sailing') {
      // While sailing: water/deep_water/river are walkable, land is not
      if (tileName !== 'deep_water' && tileName !== 'water' && tileName !== 'river' && tileName !== 'sand') return;
    } else {
      if (!isWalkableCode(tileCode)) return;
    }

    const nearest = findNearestLocation(nx, ny);
    const newChronicle: ChronicleEntry[] = [];
    let newEvent = state.currentEvent;
    let newVisited = state.visitedLocations;
    let currentLoc = state.currentLocation;
    let newTick = state.tick;
    let newSeasonTick = state.seasonTick;
    let newSeason = state.season;

    // Entered a new location's proximity
    if (nearest && nearest !== state.nearestLocation) {
      currentLoc = nearest;
      newTick++;
      newSeasonTick++;

      if (newSeasonTick >= TICKS_PER_SEASON) {
        const idx = SEASON_ORDER.indexOf(state.season);
        newSeason = SEASON_ORDER[(idx + 1) % 4];
        newSeasonTick = 0;
        newChronicle.push({
          tick: newTick, season: newSeason,
          text: `The season turned. ${newSeason === 'thaw' ? 'The ice breaks.' : newSeason === 'summer' ? 'The sun reaches its peak.' : newSeason === 'harvest' ? 'The harvest begins.' : 'Winter falls.'}`,
          type: 'world',
        });
      }

      const worldEvent = getWorldEvent(newTick, newSeason);
      if (worldEvent) {
        newChronicle.push({ tick: newTick, season: newSeason, text: worldEvent, type: 'world' });
      }

      if (!state.visitedLocations.includes(nearest)) {
        newVisited = [...state.visitedLocations, nearest];
        newChronicle.push({
          tick: newTick, season: newSeason,
          text: `The traveler arrived in ${nearest.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} for the first time.`,
          type: 'discovery',
        });
      }

      const events = generateEvents(nearest, newSeason, newTick);
      if (events.length > 0) {
        newEvent = events[0];
      }
    }

    // Hunger & health decay — only when a tick advances (new location proximity entered)
    let newHunger = state.hunger;
    let newHealth = state.health;
    let newPhase: GameState['phase'] = state.phase;
    if (newTick > state.tick) {
      const decay = newSeason === 'dark' ? 0.75 : 0.5;
      newHunger = Math.max(0, newHunger - decay);
      if (newHunger === 0)       newHealth = Math.max(0, newHealth - 2);
      else if (newHunger < 20)   newHealth = Math.max(0, newHealth - 0.5);
      if (newHealth <= 0)        newPhase = 'dead';
    }

    set({
      playerX: nx, playerY: ny,
      nearestLocation: nearest,
      currentLocation: currentLoc,
      tick: newTick,
      season: newSeason,
      seasonTick: newSeasonTick,
      visitedLocations: newVisited,
      chronicle: [...state.chronicle, ...newChronicle],
      currentEvent: newEvent,
      hunger: newHunger,
      health: newHealth,
      phase: newPhase,
      playerTitle: getPlayerTitle(state.reputation as unknown as Record<string, number>),
    });
  },

  travel: (locationId: string) => {
    const state = get();
    const coord = LOCATION_COORDS[locationId];
    if (!coord) return;

    const newTick = state.tick + 1;
    const newSeasonTick = state.seasonTick + 1;
    let newSeason = state.season;
    if (newSeasonTick >= TICKS_PER_SEASON) {
      const idx = SEASON_ORDER.indexOf(state.season);
      newSeason = SEASON_ORDER[(idx + 1) % 4];
    }

    const events = generateEvents(locationId, newSeason, newTick);
    const worldEvent = getWorldEvent(newTick, newSeason);
    const newChronicle: ChronicleEntry[] = [];
    if (worldEvent) newChronicle.push({ tick: newTick, season: newSeason, text: worldEvent, type: 'world' });
    if (newSeasonTick >= TICKS_PER_SEASON) {
      newChronicle.push({ tick: newTick, season: newSeason, text: `The season turned.`, type: 'world' });
    }

    const visited = state.visitedLocations.includes(locationId);
    if (!visited) {
      newChronicle.push({ tick: newTick, season: newSeason, text: `Arrived in ${locationId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} for the first time.`, type: 'discovery' });
    }

    // Hunger & health decay on fast-travel
    const travelDecay = newSeason === 'dark' ? 0.75 : 0.5;
    const travelHunger = Math.max(0, state.hunger - travelDecay);
    let travelHealth = state.health;
    let travelPhase: GameState['phase'] = state.phase;
    if (travelHunger === 0)      travelHealth = Math.max(0, travelHealth - 2);
    else if (travelHunger < 20)  travelHealth = Math.max(0, travelHealth - 0.5);
    if (travelHealth <= 0)       travelPhase = 'dead';

    set({
      currentLocation: locationId,
      nearestLocation: locationId,
      playerX: coord.x,
      playerY: coord.y,
      tick: newTick,
      season: newSeason,
      seasonTick: newSeasonTick >= TICKS_PER_SEASON ? 0 : newSeasonTick,
      currentEvent: events.length > 0 ? events[0] : null,
      lastResult: null,
      visitedLocations: visited ? state.visitedLocations : [...state.visitedLocations, locationId],
      chronicle: [...state.chronicle, ...newChronicle],
      hunger: travelHunger,
      health: travelHealth,
      phase: travelPhase,
      playerTitle: getPlayerTitle(state.reputation as unknown as Record<string, number>),
    });
  },

  makeChoice: (choiceId: string) => {
    const state = get();
    if (!state.currentEvent) return;
    const choice = state.currentEvent.choices.find(c => c.id === choiceId);
    if (!choice) return;

    if (choice.requiresRep) {
      const meetsReqs = Object.entries(choice.requiresRep).every(
        ([key, val]) => state.reputation[key as keyof Reputation] >= (val || 0)
      );
      if (!meetsReqs) return;
    }

    const newRep = { ...state.reputation };
    Object.entries(choice.repEffects).forEach(([key, val]) => {
      newRep[key as keyof Reputation] = Math.min(100, Math.max(0, newRep[key as keyof Reputation] + (val || 0)));
    });

    const newFactions = { ...state.factions };
    if (choice.factionEffects) {
      Object.entries(choice.factionEffects).forEach(([key, val]) => {
        newFactions[key as keyof FactionStanding] = Math.min(100, Math.max(-100, newFactions[key as keyof FactionStanding] + (val || 0)));
      });
    }

    const newNpcs = [...state.npcs];
    if (choice.npcEffects) {
      choice.npcEffects.forEach(effect => {
        const npc = newNpcs.find(n => n.id === effect.npcId);
        if (npc) {
          npc.disposition = Math.min(100, Math.max(-100, npc.disposition + effect.disposition));
          npc.memories.push({ event: effect.memory, tick: state.tick, sentiment: effect.disposition > 0 ? 'positive' : effect.disposition < 0 ? 'negative' : 'neutral' });
        }
      });
    }

    const newChronicle: ChronicleEntry = { tick: state.tick, season: state.season, text: choice.chronicleText, type: 'action' };

    set({
      reputation: newRep,
      factions: newFactions,
      npcs: newNpcs,
      chronicle: [...state.chronicle, newChronicle],
      lastResult: choice.resultText,
      currentEvent: null,
      completedEvents: [...state.completedEvents, state.currentEvent.id],
      playerTitle: getPlayerTitle(newRep as unknown as Record<string, number>),
    });
  },

  dismissResult: () => set({ lastResult: null }),

  viewChronicle: () => set({ overlay: 'chronicle' }),

  backToGame: () => set({ overlay: 'none', phase: 'playing' }),

  advanceTick: () => {
    const state = get();
    const newTick = state.tick + 1;
    const worldEvent = getWorldEvent(newTick, state.season);
    const newChronicle: ChronicleEntry[] = [];
    if (worldEvent) newChronicle.push({ tick: newTick, season: state.season, text: worldEvent, type: 'world' });
    set({ tick: newTick, chronicle: [...state.chronicle, ...newChronicle] });
  },

  setOverlay: (o: OverlayType) => set({ overlay: o }),

  advanceTutorial: () => {
    const state = get();
    const steps: TutorialStep[] = ['cinematic', 'movement', 'hotkeys', 'landmark', 'done'];
    const idx = steps.indexOf(state.tutorialStep);
    if (idx < steps.length - 1) set({ tutorialStep: steps[idx + 1] });
  },

  performEnvironmentAction: (actionId: string) => {
    const state = get();
    const action = ENVIRONMENT_ACTIONS.find(a => a.id === actionId);
    if (!action) return;
    if (state.environmentCooldowns[actionId] && state.tick < state.environmentCooldowns[actionId]) return;

    const newRep = { ...state.reputation };
    Object.entries(action.repEffects).forEach(([key, val]) => {
      newRep[key as keyof Reputation] = Math.min(100, Math.max(0, newRep[key as keyof Reputation] + (val || 0)));
    });

    const newHotbar = action.itemReward
      ? addItemToHotbar(state.hotbar, action.itemReward)
      : state.hotbar;

    const entry: ChronicleEntry = { tick: state.tick, season: state.season, text: action.chronicleText, type: 'environment' };
    set({
      reputation: newRep,
      hotbar: newHotbar,
      lastResult: action.resultText,
      chronicle: [...state.chronicle, entry],
      environmentCooldowns: { ...state.environmentCooldowns, [actionId]: state.tick + action.cooldownTicks },
      playerTitle: getPlayerTitle(newRep as unknown as Record<string, number>),
    });
  },

  interactEntity: () => {
    const state = get();
    const nearby = getEntitiesNear(state.playerX, state.playerY, 3);

    if (state.phase === 'sailing') {
      // Dismount: find adjacent sand/grass tile
      const tileCode = getTileAt(state.playerX, state.playerY);
      const tileName = TILE_NAMES[tileCode] ?? '';
      if (tileName === 'sand' || tileName === 'water') {
        // Leave boat entity at current position
        spawnEntity('boat', state.playerX, state.playerY, { docked: false });
        const entry: ChronicleEntry = { tick: state.tick, season: state.season, text: 'The traveler stepped ashore and left the boat at the waterline.', type: 'action' };
        set({ phase: 'playing', chronicle: [...state.chronicle, entry] });
      }
      return;
    }

    // Check for boats
    const boat = nearby.find(e => e.kind === 'boat');
    if (boat) {
      removeEntity(boat.id);
      const entry: ChronicleEntry = { tick: state.tick, season: state.season, text: 'The traveler boarded a boat and set sail.', type: 'action' };
      set({ phase: 'sailing', chronicle: [...state.chronicle, entry] });
      return;
    }

    // Check for cave entrances (Phase 9 will expand this)
    const cave = nearby.find(e => e.kind === 'cave_entrance');
    if (cave) {
      const entry: ChronicleEntry = { tick: state.tick, season: state.season, text: 'The traveler found a dark cave entrance...', type: 'discovery' };
      set({ chronicle: [...state.chronicle, entry] });
    }
  },
}));
