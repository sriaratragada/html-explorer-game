import { create } from 'zustand';
import { GameState, Season, ChronicleEntry, Reputation, FactionStanding, OverlayType, TutorialStep, EnvironmentAction } from './gameTypes';
import { INITIAL_NPCS, generateEvents, getWorldEvent, getPlayerTitle, ENVIRONMENT_ACTIONS } from './gameData';
import { LOCATION_COORDS, isWalkable, generateWorldMap, WorldMap as WorldMapData } from './mapGenerator';

const SEASON_ORDER: Season[] = ['thaw', 'summer', 'harvest', 'dark'];
const TICKS_PER_SEASON = 12;
const PROXIMITY_RADIUS = 12;

let cachedMap: WorldMapData | null = null;
export function getMap(): WorldMapData {
  if (!cachedMap) cachedMap = generateWorldMap();
  return cachedMap;
}

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

interface GameStore extends GameState {
  startGame: () => void;
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
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'title',
  isMoving: false,
  tick: 0,
  season: 'thaw',
  seasonTick: 0,
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
    // Pre-generate map
    getMap();
    const npcs = JSON.parse(JSON.stringify(INITIAL_NPCS));
    const initialChronicle: ChronicleEntry = {
      tick: 0, season: 'thaw',
      text: 'A traveler arrived in Ashenford at the start of the Thaw. No one knew their name. No one asked. The world does not care about you. Not yet.',
      type: 'world',
    };

    set({
      phase: 'playing',
      isMoving: false,
      tick: 0, season: 'thaw', seasonTick: 0,
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
    });
  },

  movePlayer: (dx: number, dy: number) => {
    const state = get();
    if (state.currentEvent || state.lastResult) return;
    
    const map = getMap();
    const nx = state.playerX + dx;
    const ny = state.playerY + dy;
    
    if (nx < 0 || nx >= 800 || ny < 0 || ny >= 800) return;
    if (!isWalkable(map.tiles[ny][nx])) return;

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

    const entry: ChronicleEntry = { tick: state.tick, season: state.season, text: action.chronicleText, type: 'environment' };
    set({
      reputation: newRep,
      lastResult: action.resultText,
      chronicle: [...state.chronicle, entry],
      environmentCooldowns: { ...state.environmentCooldowns, [actionId]: state.tick + action.cooldownTicks },
      playerTitle: getPlayerTitle(newRep as unknown as Record<string, number>),
    });
  },
}));
