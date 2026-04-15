import { create } from 'zustand';
import { GameState, Season, ChronicleEntry, Reputation, FactionStanding } from './gameTypes';
import { INITIAL_NPCS, generateEvents, getWorldEvent, getPlayerTitle } from './gameData';

const SEASON_ORDER: Season[] = ['thaw', 'summer', 'harvest', 'dark'];
const TICKS_PER_SEASON = 12;

interface GameStore extends GameState {
  startGame: () => void;
  travel: (locationId: string) => void;
  makeChoice: (choiceId: string) => void;
  dismissResult: () => void;
  viewChronicle: () => void;
  backToGame: () => void;
  advanceTick: () => void;
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
  npcs: [],
  chronicle: [],
  currentEvent: null,
  lastResult: null,
  visitedLocations: [],
  completedEvents: [],
  playerTitle: 'Unknown Traveler',

  startGame: () => {
    const npcs = JSON.parse(JSON.stringify(INITIAL_NPCS));
    const initialChronicle: ChronicleEntry = {
      tick: 0,
      season: 'thaw',
      text: 'A traveler arrived in Ashenford at the start of the Thaw. No one knew their name. No one asked. The world does not care about you. Not yet.',
      type: 'world',
    };

    const events = generateEvents('ashenford', 'thaw', 0);

    set({
      phase: 'playing',
      isMoving: false,
      season: 'thaw',
      seasonTick: 0,
      reputation: { conquest: 0, trade: 0, craft: 0, diplomacy: 0, exploration: 0, arcane: 0 },
      factions: { amber: 0, iron: 0, green: 0, scholar: 0, ashen: 0, tide: 0 },
      currentLocation: 'ashenford',
      npcs,
      chronicle: [initialChronicle],
      currentEvent: events.length > 0 ? events[0] : null,
      lastResult: null,
      visitedLocations: ['ashenford'],
      completedEvents: [],
      playerTitle: 'Unknown Traveler',
    });
  },

  travel: (locationId: string) => {
    const state = get();
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
    
    if (worldEvent) {
      newChronicle.push({
        tick: newTick,
        season: newSeason,
        text: worldEvent,
        type: 'world',
      });
    }

    if (newSeasonTick >= TICKS_PER_SEASON) {
      newChronicle.push({
        tick: newTick,
        season: newSeason,
        text: `The season turned. ${newSeason === 'thaw' ? 'The ice breaks. Trade routes reopen.' : newSeason === 'summer' ? 'The sun reaches its peak. The continent stirs with ambition.' : newSeason === 'harvest' ? 'The harvest begins. Prices rise. Factions demand tribute.' : 'Winter falls. Mountain passes close. The desperate season begins.'}`,
        type: 'world',
      });
    }

    const visited = state.visitedLocations.includes(locationId);
    if (!visited) {
      newChronicle.push({
        tick: newTick,
        season: newSeason,
        text: `The traveler arrived in ${locationId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} for the first time.`,
        type: 'discovery',
      });
    }

    set({
      currentLocation: locationId,
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

    // Check requirements
    if (choice.requiresRep) {
      const meetsReqs = Object.entries(choice.requiresRep).every(
        ([key, val]) => state.reputation[key as keyof Reputation] >= (val || 0)
      );
      if (!meetsReqs) return;
    }

    // Apply reputation effects
    const newRep = { ...state.reputation };
    Object.entries(choice.repEffects).forEach(([key, val]) => {
      newRep[key as keyof Reputation] = Math.min(100, Math.max(0, newRep[key as keyof Reputation] + (val || 0)));
    });

    // Apply faction effects
    const newFactions = { ...state.factions };
    if (choice.factionEffects) {
      Object.entries(choice.factionEffects).forEach(([key, val]) => {
        newFactions[key as keyof FactionStanding] = Math.min(100, Math.max(-100, newFactions[key as keyof FactionStanding] + (val || 0)));
      });
    }

    // Apply NPC effects
    const newNpcs = [...state.npcs];
    if (choice.npcEffects) {
      choice.npcEffects.forEach(effect => {
        const npc = newNpcs.find(n => n.id === effect.npcId);
        if (npc) {
          npc.disposition = Math.min(100, Math.max(-100, npc.disposition + effect.disposition));
          npc.memories.push({
            event: effect.memory,
            tick: state.tick,
            sentiment: effect.disposition > 0 ? 'positive' : effect.disposition < 0 ? 'negative' : 'neutral',
          });
        }
      });
    }

    // Add chronicle entry
    const newChronicle: ChronicleEntry = {
      tick: state.tick,
      season: state.season,
      text: choice.chronicleText,
      type: 'action',
    };

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

  dismissResult: () => {
    set({ lastResult: null });
  },

  viewChronicle: () => {
    set({ phase: 'chronicle' });
  },

  backToGame: () => {
    set({ phase: 'playing' });
  },

  advanceTick: () => {
    const state = get();
    const newTick = state.tick + 1;
    const worldEvent = getWorldEvent(newTick, state.season);
    
    const newChronicle: ChronicleEntry[] = [];
    if (worldEvent) {
      newChronicle.push({ tick: newTick, season: state.season, text: worldEvent, type: 'world' });
    }

    set({
      tick: newTick,
      chronicle: [...state.chronicle, ...newChronicle],
    });
  },
}));
