// ═══ Reputation & factions (legacy + retained) ════════════════════════════
export type ReputationKey = 'conquest' | 'trade' | 'craft' | 'diplomacy' | 'exploration' | 'arcane';
export interface Reputation { conquest: number; trade: number; craft: number; diplomacy: number; exploration: number; arcane: number; }
export interface FactionStanding { amber: number; iron: number; green: number; scholar: number; ashen: number; tide: number; auredia: number; korrath: number; vell: number; sarnak: number; }

export type Season = 'thaw' | 'summer' | 'harvest' | 'dark';

// ═══ NPCs (legacy + extended with schedule) ═══════════════════════════════
export interface NpcMemory { event: string; tick: number; sentiment: 'positive' | 'negative' | 'neutral'; }

export type NpcJob = 'farmer' | 'merchant' | 'guard' | 'innkeeper' | 'smith' | 'priest' | 'noble' | 'sellsword' | 'bandit' | 'hunter' | 'fisher' | 'none';

export interface Npc {
  id: string;
  name: string;
  title: string;
  location: string;
  faction: keyof FactionStanding | 'none';
  personality: string;
  memories: NpcMemory[];
  disposition: number;
  // Extended
  job?: NpcJob;
  homeLocation?: string;
  workplace?: string;
  x?: number; y?: number;    // off-screen abstract position
  alive?: boolean;
}

// ═══ Legacy Location + Settlement profile (retained) ══════════════════════
export interface Location {
  id: string;
  name: string;
  type: 'village' | 'town' | 'city' | 'castle' | 'fortress' | 'ruins' | 'wilderness' | 'port' | 'capital' | 'camp';
  description: string;
  biome: string;
  npcs: string[];
  connections: string[];
  icon: string;
  mapX?: number; mapY?: number;
}

export interface SettlementProfile {
  tier: 'village' | 'town' | 'city' | 'castle';
  footprintRadius: number;
  wallThickness: number;
  guardCount: number;
  marketSlots: number;
  npcCapacity: number;
}

// ═══ Chronicle / Lore ═════════════════════════════════════════════════════
export type ChronicleType = 'action' | 'world' | 'npc' | 'faction' | 'discovery' | 'environment' | 'lore' | 'combat' | 'trade' | 'quest';

export interface ChronicleEntry {
  tick: number;
  season: Season;
  text: string;
  type: ChronicleType;
}

export interface LoreEntry {
  id: string;
  title: string;
  body: string;
  continent: string;
  triggerLocationId: string;
  unlocked: boolean;
}

// ═══ Events / Choices (narrative, retained) ═══════════════════════════════
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

// ═══ Items & Inventory ════════════════════════════════════════════════════
export type ItemType = 'tool' | 'weapon' | 'resource' | 'food' | 'armor' | 'misc' | 'potion' | 'trade' | 'furniture';
export type EquipSlot = 'mainhand' | 'offhand' | 'helm' | 'chest' | 'legs' | 'boots' | 'amulet';

export interface Item {
  id: string;
  name: string;
  icon: string;
  quantity: number;
  type: ItemType;
  description: string;
  // Stats (optional)
  damage?: number;
  armor?: number;
  hunger?: number;   // food restore
  healAmount?: number;
  equipSlot?: EquipSlot;
  stack?: number;    // max stack size
  value?: number;    // base price
}

// Hotbar-compat alias so legacy code still typechecks
export type HotbarItem = Item;

export interface Equipment {
  mainhand: Item | null;
  offhand: Item | null;
  helm: Item | null;
  chest: Item | null;
  legs: Item | null;
  boots: Item | null;
  amulet: Item | null;
}

export interface Inventory {
  slots: (Item | null)[];   // 30 slots; 0..5 used as hotbar
  equipment: Equipment;
  gold: number;
}

// ═══ Recipes ══════════════════════════════════════════════════════════════
export type WorkbenchKind = 'none' | 'campfire' | 'anvil' | 'loom' | 'alchemy';

export interface Recipe {
  id: string;
  name: string;
  inputs: { itemId: string; qty: number }[];
  output: { itemId: string; qty: number };
  workbench: WorkbenchKind;
  skill?: 'combat' | 'crafting' | 'stealth' | 'diplomacy';
  minSkillLevel?: number;
}

// ═══ Skills ═══════════════════════════════════════════════════════════════
export type SkillKey = 'combat' | 'stealth' | 'diplomacy' | 'crafting';

export interface SkillNode {
  xp: number;
  level: number;
  perks: string[];   // perk ids unlocked
}

export interface Skills {
  combat: SkillNode;
  stealth: SkillNode;
  diplomacy: SkillNode;
  crafting: SkillNode;
}

// ═══ World Entities ═══════════════════════════════════════════════════════
export type EntityKind =
  | 'boat' | 'merchant' | 'caravan' | 'guard' | 'villager' | 'noble'
  | 'wolf' | 'bear' | 'bandit' | 'deer' | 'rabbit'
  | 'army' | 'patrol'
  | 'tree' | 'rock' | 'iron_ore' | 'herb' | 'berry_bush' | 'coal_ore' | 'gold_ore'
  | 'cave_entrance' | 'bounty_target'
  | 'furniture';

export interface WorldEntity {
  id: string;
  kind: EntityKind;
  x: number; y: number;
  hp?: number;
  maxHp?: number;
  speed?: number;
  targetX?: number; targetY?: number;
  goalId?: string;
  faction?: string;
  name?: string;
  locked?: boolean;     // boat occupied, etc.
  variant?: number;
  // Army specifics
  size?: number;
  morale?: number;
  // Merchant specifics
  cargo?: { itemId: string; qty: number }[];
  home?: string;
  route?: string[];
  routeIdx?: number;
  // Bounty specifics
  bountyId?: string;
}

// ═══ Markets / Economy ════════════════════════════════════════════════════
export interface MarketEntry {
  stock: number;
  basePrice: number;
  price: number;
  demand: number;
}
export interface Market {
  locationId: string;
  items: Record<string, MarketEntry>;
}

// ═══ Quests & Bounties ════════════════════════════════════════════════════
export type QuestStepKind = 'goto' | 'kill' | 'fetch' | 'talk' | 'deliver';
export interface QuestStep {
  kind: QuestStepKind;
  target: string;       // id or location or item id
  qty?: number;
  progress: number;
  desc: string;
}
export interface Quest {
  id: string;
  title: string;
  giver: string;
  steps: QuestStep[];
  currentStep: number;
  state: 'active' | 'completed' | 'failed';
  rewards: { gold?: number; items?: { itemId: string; qty: number }[]; rep?: Partial<Reputation> };
}

export interface Bounty {
  id: string;
  targetEntityId: string;
  targetName: string;
  issuedAt: string;      // location id
  reward: number;
  description: string;
  taken: boolean;
  completed: boolean;
}

// ═══ Faction / War state ══════════════════════════════════════════════════
export interface FactionState {
  kingdoms: Record<string, {
    treasury: number;
    armySize: number;
    territory: string[];
    atWarWith: string[];
  }>;
  wars: { a: string; b: string; startedTick: number }[];
}

// ═══ Weather & Time ═══════════════════════════════════════════════════════
export type DayPhase = 'dawn' | 'day' | 'dusk' | 'night';
export type WeatherKind = 'clear' | 'cloudy' | 'rain' | 'storm' | 'fog' | 'snow';

export interface WeatherState { kind: WeatherKind; ticksLeft: number; }

// ═══ Fog of war ═══════════════════════════════════════════════════════════
export type FogMap = Record<number, number>;   // chunkKey -> reveal level (0/1/2)

// ═══ Housing ══════════════════════════════════════════════════════════════
export interface HouseFurniture { id: string; itemId: string; x: number; y: number; }
export interface House {
  locationId: string;
  owned: boolean;
  furniture: HouseFurniture[];
  plotX: number; plotY: number;   // world-space corner
}
export type Housing = Record<string, House>;   // keyed by locationId

// ═══ Overlay / Tutorial ═══════════════════════════════════════════════════
export type OverlayType = 'none' | 'player' | 'chronicle' | 'map' | 'help' | 'inventory' | 'crafting' | 'shop' | 'skills' | 'quests' | 'faction' | 'save' | 'build' | 'dialogue';
export type TutorialStep = 'cinematic' | 'movement' | 'hotkeys' | 'landmark' | 'done';

// ═══ GamePhase ════════════════════════════════════════════════════════════
export type GamePhase = 'title' | 'playing' | 'chronicle' | 'dead' | 'dungeon' | 'sailing';

// ═══ Dungeon state (side-scroller) ════════════════════════════════════════
export interface DungeonState {
  seed: number;
  locationId: string;
  tiles: Uint8Array;          // side-scroll 2D grid
  width: number; height: number;
  playerX: number; playerY: number;   // pixel
  vx: number; vy: number;
  enemies: { id: string; x: number; y: number; hp: number; kind: string }[];
  exitX: number; exitY: number;
}

// ═══ Game state ═══════════════════════════════════════════════════════════
export interface GameState {
  phase: GamePhase;

  // Legacy hotbar (kept as derived view into inventory.slots[0..5] at render time)
  hotbar: Item[];
  activeSlot: number;

  // Player
  health: number;
  maxHealth: number;
  hunger: number;
  stamina: number;
  isMoving: boolean;
  playerX: number;
  playerY: number;
  playerTitle: string;
  playerDir: 'up' | 'down' | 'left' | 'right';

  // Inventory / skills
  inventory: Inventory;
  skills: Skills;

  // World time
  tick: number;
  season: Season;
  seasonTick: number;
  worldTime: number;       // minutes since day 0
  dayPhase: DayPhase;
  weather: Record<string, WeatherState>;

  // Reputation / factions
  reputation: Reputation;
  factions: FactionStanding;

  // Locations / lore
  currentLocation: string;
  nearestLocation: string | null;
  visitedLocations: string[];
  completedEvents: string[];
  loreEntries: LoreEntry[];
  unlockedLore: string[];
  chronicle: ChronicleEntry[];
  currentEvent: GameEvent | null;
  lastResult: string | null;

  // NPCs
  npcs: Npc[];

  // Entities (serialised)
  entities: WorldEntity[];

  // Markets / economy
  markets: Record<string, Market>;

  // Quests / bounties
  quests: Quest[];
  bounties: Bounty[];
  activeBountyId: string | null;

  // Faction simulation
  factionState: FactionState;

  // Fog of war
  fog: FogMap;

  // Housing
  housing: Housing;

  // Dungeon
  dungeon: DungeonState | null;

  // Sailing
  mountedBoatId: string | null;

  // UI
  overlay: OverlayType;
  tutorialStep: TutorialStep;
  environmentCooldowns: Record<string, number>;

  // Dialogue
  dialogueNpcId: string | null;
  dialogueNodeId: string | null;

  // Shop UI
  shopLocationId: string | null;

  // Seed
  seed: number;
  tickRunning: boolean;
}
