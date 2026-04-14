export type ReputationKey = 'conquest' | 'trade' | 'craft' | 'diplomacy' | 'exploration' | 'arcane';

export interface Reputation {
  conquest: number;
  trade: number;
  craft: number;
  diplomacy: number;
  exploration: number;
  arcane: number;
}

export type Season = 'thaw' | 'summer' | 'harvest' | 'dark';

export interface FactionStanding {
  amber: number;
  iron: number;
  green: number;
  scholar: number;
  ashen: number;
  tide: number;
}

export interface NpcMemory {
  event: string;
  tick: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface Npc {
  id: string;
  name: string;
  title: string;
  location: string;
  faction: keyof FactionStanding | 'none';
  personality: string;
  memories: NpcMemory[];
  disposition: number; // -100 to 100
}

export interface Location {
  id: string;
  name: string;
  type: 'village' | 'city' | 'fortress' | 'ruins' | 'wilderness' | 'port';
  description: string;
  biome: string;
  npcs: string[];
  connections: string[];
  icon: string;
}

export interface ChronicleEntry {
  tick: number;
  season: Season;
  text: string;
  type: 'action' | 'world' | 'npc' | 'faction' | 'discovery';
}

export interface GameChoice {
  id: string;
  text: string;
  repEffects: Partial<Reputation>;
  factionEffects?: Partial<FactionStanding>;
  npcEffects?: { npcId: string; disposition: number; memory: string }[];
  resultText: string;
  requiresRep?: Partial<Reputation>;
  chronicleText: string;
}

export interface GameEvent {
  id: string;
  title: string;
  narrative: string;
  location: string;
  choices: GameChoice[];
  season?: Season;
  minTick?: number;
  oneTime?: boolean;
  triggered?: boolean;
}

export interface GameState {
  phase: 'title' | 'playing' | 'chronicle';
  tick: number;
  season: Season;
  seasonTick: number;
  reputation: Reputation;
  factions: FactionStanding;
  currentLocation: string;
  npcs: Npc[];
  chronicle: ChronicleEntry[];
  currentEvent: GameEvent | null;
  lastResult: string | null;
  visitedLocations: string[];
  completedEvents: string[];
  playerTitle: string;
}
