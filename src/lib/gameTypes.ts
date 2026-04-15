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
  disposition: number;
}

export interface Location {
  id: string;
  name: string;
  type: 'village' | 'town' | 'city' | 'castle' | 'fortress' | 'ruins' | 'wilderness' | 'port';
  description: string;
  biome: string;
  npcs: string[];
  connections: string[];
  icon: string;
  mapX?: number;
  mapY?: number;
}

export interface SettlementProfile {
  tier: 'village' | 'town' | 'city' | 'castle';
  footprintRadius: number;
  wallThickness: number;
  guardCount: number;
  marketSlots: number;
  npcCapacity: number;
}

export interface ChronicleEntry {
  tick: number;
  season: Season;
  text: string;
  type: 'action' | 'world' | 'npc' | 'faction' | 'discovery' | 'environment' | 'lore';
}

export interface LoreEntry {
  id: string;
  title: string;
  body: string;
  continent: string;
  triggerLocationId: string;
  unlocked: boolean;
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

export interface EnvironmentAction {
  id: string;
  label: string;
  icon: string;
  terrain: string;
  repEffects: Partial<Reputation>;
  resultText: string;
  chronicleText: string;
  cooldownTicks: number;
  itemReward?: { id: string; name: string; icon: string; quantity: number; type: ItemType; description: string };
}

export type OverlayType = 'none' | 'player' | 'chronicle' | 'map' | 'help';

export type ItemType = 'tool' | 'weapon' | 'resource' | 'food' | 'armor' | 'misc';

export interface HotbarItem {
  id: string;
  name: string;
  icon: string;
  quantity: number;
  type: ItemType;
  description: string;
}

export type TutorialStep = 'cinematic' | 'movement' | 'hotkeys' | 'landmark' | 'done';

export interface GameState {
  hotbar: HotbarItem[];
  activeSlot: number;
  phase: 'title' | 'playing' | 'chronicle' | 'dead';
  health: number;
  maxHealth: number;
  hunger: number;
  isMoving: boolean;
  tick: number;
  season: Season;
  seasonTick: number;
  reputation: Reputation;
  factions: FactionStanding;
  currentLocation: string;
  nearestLocation: string | null;
  playerX: number;
  playerY: number;
  npcs: Npc[];
  chronicle: ChronicleEntry[];
  loreEntries: LoreEntry[];
  unlockedLore: string[];
  currentEvent: GameEvent | null;
  lastResult: string | null;
  visitedLocations: string[];
  completedEvents: string[];
  playerTitle: string;
  overlay: OverlayType;
  tutorialStep: TutorialStep;
  environmentCooldowns: Record<string, number>;
}
