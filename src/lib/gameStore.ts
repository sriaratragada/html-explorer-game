import { create } from 'zustand';
import { GameState, Season, ChronicleEntry, Reputation, FactionStanding, OverlayType, TutorialStep, HotbarItem, DayNightPhase, MountState } from './gameTypes';
import { createWeatherState } from './weatherSystem';
import { startTicker } from './worldTicker';
import { INITIAL_NPCS, generateEvents, getWorldEvent, getPlayerTitle, ENVIRONMENT_ACTIONS, FOOD_VALUES, LOCATIONS } from './gameData';
import { LOCATION_COORDS, isWalkableCode, getTileAt, MAP_W, MAP_H, TILE_NAMES, getContinentAt, getSettlementMeta } from './mapGenerator';
import { getExtendedLocationCoords, isHamletId } from './hamlets';
import { initWorldEntities, getEntitiesNear, spawnEntity, removeEntity } from './worldEntities';
import { createInventory, addToInventory, removeFromInventory, equipItem, unequipItem, craft, canCraft, Inventory, getWeaponDamage, getTotalArmor, countItem } from './craftingSystem';
import { createSkillTree, addXp, selectPerk, SkillTree } from './skills';
import { ITEMS } from './items';
import { RECIPES } from './recipes';
import { createMarkets } from './economySystem';
import { createFactions, FactionState } from './factionSystem';
import { Quest } from './questSystem';
import { createBountyBoard, BountyBoard } from './bountyBoard';
import { createFogMap, revealAroundPlayer, revealLocation, FogMap } from './fogOfWar';
import { createHousing, purchasePlot, placeFurniture, Housing, PLOT_PRICES } from './housing';
import { playerAttack } from './combatSystem';
import { DialogueTree, getDialogueTree, genericDialogue } from './dialogue';
import { generateNpcDialogue, isGeminiConfigured } from './geminiNpc';

const SEASON_ORDER: Season[] = ['thaw', 'summer', 'harvest', 'dark'];
const TICKS_PER_SEASON = 12;

function proximityForLocation(id: string): number {
  if (isHamletId(id)) return 15;
  const m = getSettlementMeta(id);
  if (!m) return 28;
  switch (m.type) {
    case 'capital': return 48;
    case 'city': return 40;
    case 'fortress': return 42;
    case 'port': return 38;
    case 'town': return 34;
    case 'wilderness': return 34;
    default: return 28;
  }
}

function findNearestLocation(px: number, py: number): string | null {
  const coords = getExtendedLocationCoords();
  let nearest: string | null = null;
  let minDist = Infinity;
  for (const [id, coord] of Object.entries(coords)) {
    const pr = proximityForLocation(id);
    const d = Math.sqrt((px - coord.x) ** 2 + (py - coord.y) ** 2);
    if (d < pr && d < minDist) {
      minDist = d;
      nearest = id;
    }
  }
  return nearest;
}

function runtimeDialogueFromGemini(npcKey: string, speaker: string, npcText: string, optionTexts: string[]): DialogueTree {
  const options = optionTexts.map((t, i) => ({
    id: `g_${i}`,
    text: t,
    exitText: 'You step away.',
  }));
  return {
    npcId: npcKey,
    startNodeId: 'g0',
    nodes: { g0: { id: 'g0', speaker, text: npcText, options } },
  };
}

function inventoryToHotbar(inv: Inventory): HotbarItem[] {
  const result: HotbarItem[] = [];
  for (let i = 0; i < 6; i++) {
    const slot = inv.slots[i];
    if (slot) {
      const def = ITEMS[slot.itemId];
      result.push({ id: slot.itemId, name: def?.name ?? slot.itemId, icon: def?.icon ?? '?', quantity: slot.qty, type: (def?.type ?? 'misc') as any, description: def?.description ?? '' });
    } else {
      result.push({ id: 'empty', name: '', icon: '', quantity: 0, type: 'misc', description: '' });
    }
  }
  return result;
}

function makeStarterInventory(): Inventory {
  let inv = createInventory();
  inv = addToInventory(inv, 'waterskin', 1);
  inv = addToInventory(inv, 'bare_hands', 1);
  const bh = inv.slots.findIndex(s => s?.itemId === 'bare_hands');
  if (bh >= 0) inv = equipItem(inv, bh);
  return inv;
}

function initBountyBoards(): Record<string, BountyBoard> {
  const boards: Record<string, BountyBoard> = {};
  for (const locId of ['highmarch', 'graygate', 'saltmoor', 'ironhold', 'korrath_citadel', 'vell_harbor', 'sarnak_hold']) {
    boards[locId] = createBountyBoard(locId, 0);
  }
  return boards;
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
  interactEntity: () => boolean;
  attackAction: () => void;
  addItemToInventory: (itemId: string, qty: number) => void;
  removeItemFromInventory: (itemId: string, qty: number) => void;
  equipItemAction: (slotIndex: number) => void;
  unequipItemAction: (equipSlot: string) => void;
  craftItemAction: (recipeId: string) => void;
  selectPerkAction: (perkId: string) => void;
  buyItemAction: (itemId: string, qty: number) => void;
  sellItemAction: (itemId: string, qty: number) => void;
  acceptQuest: (quest: Quest) => void;
  purchasePlotAction: (locationId: string) => void;
  setActiveDialogue: (tree: DialogueTree | null) => void;
}

const starterInv = makeStarterInventory();

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'title',
  isMoving: false,
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
  inventory: starterInv,
  hotbar: inventoryToHotbar(starterInv),
  activeSlot: 0,
  gold: 10,
  skills: createSkillTree(),
  markets: {},
  reputation: { conquest: 0, trade: 0, craft: 0, diplomacy: 0, exploration: 0, arcane: 0 },
  factions: { amber: 0, iron: 0, green: 0, scholar: 0, ashen: 0, tide: 0 },
  factionStates: createFactions(),
  quests: [],
  bountyBoards: {},
  currentLocation: 'ashenford',
  nearestLocation: 'ashenford',
  playerX: LOCATION_COORDS.ashenford.x,
  playerY: LOCATION_COORDS.ashenford.y,
  facingDir: { dx: 0, dy: 1 },
  mounted: 'none' as MountState,
  activeCaveId: null,
  npcs: [],
  activeDialogue: null,
  minorNpcState: {},
  tutorialObjective: 0,
  chronicle: [],
  currentEvent: null,
  lastResult: null,
  visitedLocations: [],
  completedEvents: [],
  playerTitle: 'Unknown Traveler',
  fog: createFogMap(),
  housing: createHousing(),
  overlay: 'none',
  tutorialStep: 'cinematic',
  environmentCooldowns: {},

  startGame: () => {
    initWorldEntities();
    const npcs = JSON.parse(JSON.stringify(INITIAL_NPCS));
    const inv = makeStarterInventory();
    const fog = revealAroundPlayer(createFogMap(), LOCATION_COORDS.ashenford.x, LOCATION_COORDS.ashenford.y, 120);
    const initialChronicle: ChronicleEntry = {
      tick: 0, season: 'thaw',
      text: 'A traveler arrived in Ashenford at the start of the Thaw. No one knew their name. No one asked. The world does not care about you. Not yet.',
      type: 'world',
    };
    set({
      phase: 'playing',
      isMoving: false,
      health: 100, maxHealth: 100, hunger: 100,
      tick: 0, worldTime: 14 * 2, dayNightPhase: 'day',
      weather: createWeatherState(), season: 'thaw', seasonTick: 0, seed: 42,
      inventory: inv, hotbar: inventoryToHotbar(inv), activeSlot: 0, gold: 10,
      skills: createSkillTree(),
      markets: createMarkets(),
      reputation: { conquest: 0, trade: 0, craft: 0, diplomacy: 0, exploration: 0, arcane: 0 },
      factions: { amber: 0, iron: 0, green: 0, scholar: 0, ashen: 0, tide: 0 },
      factionStates: createFactions(),
      quests: [], bountyBoards: initBountyBoards(),
      currentLocation: 'ashenford', nearestLocation: 'ashenford',
      playerX: LOCATION_COORDS.ashenford.x, playerY: LOCATION_COORDS.ashenford.y,
      facingDir: { dx: 0, dy: 1 }, mounted: 'none', activeCaveId: null,
      npcs, activeDialogue: null, minorNpcState: {}, tutorialObjective: 0,
      chronicle: [initialChronicle], currentEvent: null, lastResult: null,
      visitedLocations: ['ashenford'], completedEvents: [],
      playerTitle: 'Unknown Traveler',
      fog, housing: createHousing(),
      overlay: 'none', tutorialStep: 'movement', environmentCooldowns: {},
    });
    startTicker();
  },

  setActiveSlot: (slot: number) => set({ activeSlot: slot }),

  useItem: () => {
    const state = get();
    if (state.phase !== 'playing' && state.phase !== 'sailing') return;
    const slot = state.inventory.slots[state.activeSlot];
    if (!slot) return;
    const def = ITEMS[slot.itemId];
    if (!def) return;

    if (def.type === 'food' && def.foodValue) {
      const newHunger = Math.min(100, state.hunger + def.foodValue);
      const newInv = removeFromInventory(state.inventory, slot.itemId, 1);
      const entry: ChronicleEntry = { tick: state.tick, season: state.season, text: `The traveler ate ${def.name}. Hunger abates somewhat.`, type: 'action' };
      set({ hunger: newHunger, inventory: newInv, hotbar: inventoryToHotbar(newInv), chronicle: [...state.chronicle, entry] });
    } else if (def.type === 'potion') {
      let newHealth = state.health;
      let newHunger = state.hunger;
      if (slot.itemId === 'health_potion') newHealth = Math.min(state.maxHealth, newHealth + 30);
      if (slot.itemId === 'stamina_potion') newHunger = Math.min(100, newHunger + 30);
      const newInv = removeFromInventory(state.inventory, slot.itemId, 1);
      const entry: ChronicleEntry = { tick: state.tick, season: state.season, text: `The traveler drank a ${def.name}.`, type: 'action' };
      set({ health: newHealth, hunger: newHunger, inventory: newInv, hotbar: inventoryToHotbar(newInv), chronicle: [...state.chronicle, entry] });
    }
  },

  movePlayer: (dx: number, dy: number) => {
    const state = get();
    if (state.currentEvent || state.lastResult || state.phase === 'dead' || state.phase === 'dungeon') return;

    const speed = state.mounted === 'horse' ? 2 : 1;
    const nx = state.playerX + dx * speed;
    const ny = state.playerY + dy * speed;

    if (nx < 0 || nx >= MAP_W || ny < 0 || ny >= MAP_H) return;
    const tileCode = getTileAt(nx, ny);
    const tileName = TILE_NAMES[tileCode] ?? 'grass';
    if (state.phase === 'sailing') {
      if (tileName !== 'deep_water' && tileName !== 'water' && tileName !== 'river' && tileName !== 'sand') return;
    } else {
      if (!isWalkableCode(tileCode)) return;
    }

    const newFacing = { dx, dy };
    const nearest = findNearestLocation(nx, ny);
    const newChronicle: ChronicleEntry[] = [];
    let newEvent = state.currentEvent;
    let newVisited = state.visitedLocations;
    let currentLoc = state.currentLocation;
    let newTick = state.tick;
    let newSeasonTick = state.seasonTick;
    let newSeason = state.season;

    if (nearest && nearest !== state.nearestLocation) {
      // Hamlets update proximity label but not "current settlement" (markets keyed by major locations)
      currentLoc = isHamletId(nearest) ? state.currentLocation : nearest;
      newTick++;
      newSeasonTick++;
      if (newSeasonTick >= TICKS_PER_SEASON) {
        const idx = SEASON_ORDER.indexOf(state.season);
        newSeason = SEASON_ORDER[(idx + 1) % 4];
        newSeasonTick = 0;
        newChronicle.push({ tick: newTick, season: newSeason, text: `The season turned. ${newSeason === 'thaw' ? 'The ice breaks.' : newSeason === 'summer' ? 'The sun reaches its peak.' : newSeason === 'harvest' ? 'The harvest begins.' : 'Winter falls.'}`, type: 'world' });
      }
      const worldEvent = getWorldEvent(newTick, newSeason);
      if (worldEvent) newChronicle.push({ tick: newTick, season: newSeason, text: worldEvent, type: 'world' });
      if (!state.visitedLocations.includes(nearest)) {
        newVisited = [...state.visitedLocations, nearest];
        newChronicle.push({ tick: newTick, season: newSeason, text: `The traveler arrived in ${nearest.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} for the first time.`, type: 'discovery' });
      }
      const events = generateEvents(nearest, newSeason, newTick, state.completedEvents);
      if (events.length > 0) newEvent = events[0];
    }

    let newHunger = state.hunger;
    let newHealth = state.health;
    let newPhase: GameState['phase'] = state.phase;
    if (newTick > state.tick) {
      const decay = newSeason === 'dark' ? 0.75 : 0.5;
      newHunger = Math.max(0, newHunger - decay);
      if (newHunger === 0) newHealth = Math.max(0, newHealth - 2);
      else if (newHunger < 20) newHealth = Math.max(0, newHealth - 0.5);
      if (newHealth <= 0) newPhase = 'dead';
    }

    // Update fog
    const newFog = revealAroundPlayer(state.fog, nx, ny, 120);

    let tutorialObjective = state.tutorialObjective;
    const newChronicleForMove = [...newChronicle];
    if (
      tutorialObjective === 4 &&
      nearest &&
      nearest !== 'ashenford' &&
      !isHamletId(nearest) &&
      LOCATIONS.some(l => l.id === nearest)
    ) {
      tutorialObjective = 5;
      newChronicleForMove.push({
        tick: newTick,
        season: newSeason,
        text: 'The first journey beyond home soil — the wide world opens.',
        type: 'discovery',
      });
    }

    set({
      playerX: nx, playerY: ny, facingDir: newFacing,
      nearestLocation: nearest, currentLocation: currentLoc,
      tick: newTick, season: newSeason, seasonTick: newSeasonTick,
      visitedLocations: newVisited,
      chronicle: [...state.chronicle, ...newChronicleForMove],
      currentEvent: newEvent,
      hunger: newHunger, health: newHealth, phase: newPhase,
      fog: newFog,
      playerTitle: getPlayerTitle(state.reputation as unknown as Record<string, number>),
      tutorialObjective,
    });
  },

  travel: (locationId: string) => {
    const state = get();
    const coord = getExtendedLocationCoords()[locationId];
    if (!coord) return;
    const newTick = state.tick + 1;
    const newSeasonTick = state.seasonTick + 1;
    let newSeason = state.season;
    if (newSeasonTick >= TICKS_PER_SEASON) {
      const idx = SEASON_ORDER.indexOf(state.season);
      newSeason = SEASON_ORDER[(idx + 1) % 4];
    }
    const events = generateEvents(locationId, newSeason, newTick, state.completedEvents);
    const worldEvent = getWorldEvent(newTick, newSeason);
    const newChronicle: ChronicleEntry[] = [];
    if (worldEvent) newChronicle.push({ tick: newTick, season: newSeason, text: worldEvent, type: 'world' });
    if (newSeasonTick >= TICKS_PER_SEASON) newChronicle.push({ tick: newTick, season: newSeason, text: `The season turned.`, type: 'world' });
    const visited = state.visitedLocations.includes(locationId);
    if (!visited) newChronicle.push({ tick: newTick, season: newSeason, text: `Arrived in ${locationId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} for the first time.`, type: 'discovery' });
    const decay = newSeason === 'dark' ? 0.75 : 0.5;
    const travelHunger = Math.max(0, state.hunger - decay);
    let travelHealth = state.health;
    let travelPhase: GameState['phase'] = state.phase;
    if (travelHunger === 0) travelHealth = Math.max(0, travelHealth - 2);
    else if (travelHunger < 20) travelHealth = Math.max(0, travelHealth - 0.5);
    if (travelHealth <= 0) travelPhase = 'dead';
    const newFog = revealAroundPlayer(revealLocation(state.fog, coord.x, coord.y), coord.x, coord.y, 120);
    let travelTut = state.tutorialObjective;
    const chronTravel = [...newChronicle];
    if (
      travelTut === 4 &&
      locationId !== 'ashenford' &&
      !isHamletId(locationId) &&
      LOCATIONS.some(l => l.id === locationId)
    ) {
      travelTut = 5;
      chronTravel.push({
        tick: newTick,
        season: newSeason,
        text: 'The first journey beyond home soil — the wide world opens.',
        type: 'discovery',
      });
    }
    set({
      currentLocation: locationId, nearestLocation: locationId,
      playerX: coord.x, playerY: coord.y,
      tick: newTick, season: newSeason,
      seasonTick: newSeasonTick >= TICKS_PER_SEASON ? 0 : newSeasonTick,
      currentEvent: events.length > 0 ? events[0] : null, lastResult: null,
      visitedLocations: visited ? state.visitedLocations : [...state.visitedLocations, locationId],
      chronicle: [...state.chronicle, ...chronTravel],
      hunger: travelHunger, health: travelHealth, phase: travelPhase,
      fog: newFog, mounted: 'none',
      playerTitle: getPlayerTitle(state.reputation as unknown as Record<string, number>),
      tutorialObjective: travelTut,
    });
  },

  makeChoice: (choiceId: string) => {
    const state = get();
    if (!state.currentEvent) return;
    const choice = state.currentEvent.choices.find(c => c.id === choiceId);
    if (!choice) return;
    if (choice.requiresRep) {
      const meetsReqs = Object.entries(choice.requiresRep).every(([key, val]) => state.reputation[key as keyof Reputation] >= (val || 0));
      if (!meetsReqs) return;
    }
    const newRep = { ...state.reputation };
    Object.entries(choice.repEffects).forEach(([key, val]) => { newRep[key as keyof Reputation] = Math.min(100, Math.max(0, newRep[key as keyof Reputation] + (val || 0))); });
    const newFactions = { ...state.factions };
    if (choice.factionEffects) Object.entries(choice.factionEffects).forEach(([key, val]) => { newFactions[key as keyof FactionStanding] = Math.min(100, Math.max(-100, newFactions[key as keyof FactionStanding] + (val || 0))); });
    const newNpcs = [...state.npcs];
    if (choice.npcEffects) choice.npcEffects.forEach(effect => {
      const npc = newNpcs.find(n => n.id === effect.npcId);
      if (npc) { npc.disposition = Math.min(100, Math.max(-100, npc.disposition + effect.disposition)); npc.memories.push({ event: effect.memory, tick: state.tick, sentiment: effect.disposition > 0 ? 'positive' : effect.disposition < 0 ? 'negative' : 'neutral' }); }
    });
    set({
      reputation: newRep, factions: newFactions, npcs: newNpcs,
      chronicle: [...state.chronicle, { tick: state.tick, season: state.season, text: choice.chronicleText, type: 'action' }],
      lastResult: choice.resultText, currentEvent: null,
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
    Object.entries(action.repEffects).forEach(([key, val]) => { newRep[key as keyof Reputation] = Math.min(100, Math.max(0, newRep[key as keyof Reputation] + (val || 0))); });
    let newInv = state.inventory;
    if (action.itemReward) newInv = addToInventory(newInv, action.itemReward.id, action.itemReward.quantity);
    const newSkills = addXp(state.skills, 'crafting', 5);
    const entry: ChronicleEntry = { tick: state.tick, season: state.season, text: action.chronicleText, type: 'environment' };
    let tut = state.tutorialObjective;
    if (tut === 0 && countItem(newInv, 'wood') >= 3) tut = 1;
    set({
      reputation: newRep, inventory: newInv, hotbar: inventoryToHotbar(newInv),
      skills: newSkills,
      lastResult: action.resultText,
      chronicle: [...state.chronicle, entry],
      environmentCooldowns: { ...state.environmentCooldowns, [actionId]: state.tick + action.cooldownTicks },
      playerTitle: getPlayerTitle(newRep as unknown as Record<string, number>),
      tutorialObjective: tut,
    });
  },

  // Returns true if an entity interaction was handled (A13 fix)
  interactEntity: () => {
    const state = get();
    const nearby = getEntitiesNear(state.playerX, state.playerY, 3);

    // Dismount horse
    if (state.mounted === 'horse') {
      spawnEntity('horse', state.playerX, state.playerY, {});
      set({ mounted: 'none' });
      return true;
    }

    // Dismount boat
    if (state.phase === 'sailing') {
      const tileCode = getTileAt(state.playerX, state.playerY);
      const tileName = TILE_NAMES[tileCode] ?? '';
      if (tileName === 'sand' || tileName === 'water') {
        spawnEntity('boat', state.playerX, state.playerY, { docked: false });
        const entry: ChronicleEntry = { tick: state.tick, season: state.season, text: 'The traveler stepped ashore.', type: 'action' };
        set({ phase: 'playing', mounted: 'none', chronicle: [...state.chronicle, entry] });
        return true;
      }
      return false;
    }

    // Mount horse
    const horse = nearby.find(e => e.kind === 'horse');
    if (horse) {
      removeEntity(horse.id);
      set({ mounted: 'horse' });
      return true;
    }

    // Mount boat
    const boat = nearby.find(e => e.kind === 'boat');
    if (boat) {
      removeEntity(boat.id);
      const entry: ChronicleEntry = { tick: state.tick, season: state.season, text: 'The traveler boarded a boat and set sail.', type: 'action' };
      set({ phase: 'sailing', mounted: 'boat', chronicle: [...state.chronicle, entry] });
      return true;
    }

    // Enter cave/dungeon
    const cave = nearby.find(e => e.kind === 'cave_entrance');
    if (cave) {
      const caveId = parseInt(cave.id.split('_').pop() ?? '1') || 1;
      const entry: ChronicleEntry = { tick: state.tick, season: state.season, text: 'The traveler descended into the darkness...', type: 'discovery' };
      set({ phase: 'dungeon', activeCaveId: caveId, chronicle: [...state.chronicle, entry] });
      return true;
    }

    // Talk to settlement or hamlet NPC
    const talkNpc = nearby.find(e => e.kind === 'settlement_npc' || e.kind === 'hamlet_npc');
    if (talkNpc) {
      const data = talkNpc.data as Record<string, unknown>;
      const npcId = data.npcId as string | undefined;
      const minorKey = (data.minorKey as string) ?? npcId ?? talkNpc.id;
      const name = (data.name as string) ?? 'Stranger';
      const job = (data.job as string) ?? 'commoner';
      const hamletName = (data.hamletName as string) ?? 'the road';
      const continent = getContinentAt(state.playerX, state.playerY) ?? 'auredia';
      const wx = Object.values(state.weather)[0];
      const weatherStr = wx?.state ?? 'clear';
      let tree: DialogueTree | undefined;
      if (npcId) tree = getDialogueTree(npcId);
      if (!tree) tree = genericDialogue(minorKey, name, job);

      const prevMinor = state.minorNpcState[minorKey] ?? { memories: [], disposition: 0, lastSeenTick: 0 };
      const nextMinor = {
        ...state.minorNpcState,
        [minorKey]: {
          memories: [...prevMinor.memories, `Spoke at tick ${state.tick}`].slice(-12),
          disposition: prevMinor.disposition,
          lastSeenTick: state.tick,
        },
      };
      let newNpcs = state.npcs;
      if (npcId) {
        newNpcs = state.npcs.map(n =>
          n.id === npcId
            ? { ...n, memories: [...n.memories, { event: 'Conversation', tick: state.tick, sentiment: 'neutral' as const }].slice(-10) }
            : n,
        );
      }

      if (talkNpc.kind === 'hamlet_npc' && isGeminiConfigured()) {
        void (async () => {
          const st = get();
          const minor = st.minorNpcState[minorKey] ?? { memories: [], disposition: 0, lastSeenTick: 0 };
          const res = await generateNpcDialogue({
            npcName: name,
            npcJob: job,
            npcPersonality: 'a local who has lived along this road for years',
            location: hamletName,
            continent,
            season: st.season,
            weather: weatherStr,
            dayPhase: st.dayNightPhase,
            playerReputation: st.reputation as unknown as Record<string, number>,
            npcDisposition: minor.disposition,
            npcMemories: minor.memories,
            recentChronicle: st.chronicle.slice(-5).map(c => c.text),
            worldEvents: [],
          });
          if (res) {
            const opts = res.options.map(o => o.text);
            set({ activeDialogue: runtimeDialogueFromGemini(minorKey, name, res.npcText, opts) });
          }
        })();
      }
      set({ minorNpcState: nextMinor, npcs: newNpcs, activeDialogue: tree });
      return true;
    }

    // Gather resources
    const resource = nearby.find(e => e.kind.startsWith('resource_'));
    if (resource) {
      const itemMap: Record<string, string> = { resource_tree: 'wood', resource_rock: 'stone', resource_iron: 'iron_ore', resource_herb: 'herb', resource_berry: 'berries' };
      const itemId = itemMap[resource.kind] ?? 'wood';
      const qty = state.skills.crafting.perks.includes('double_yield') ? 2 : 1;
      removeEntity(resource.id);
      const newInv = addToInventory(state.inventory, itemId, qty);
      const newSkills = addXp(state.skills, 'crafting', 3);
      const entry: ChronicleEntry = { tick: state.tick, season: state.season, text: `Gathered ${ITEMS[itemId]?.name ?? itemId}.`, type: 'environment' };
      let tut = state.tutorialObjective;
      if (tut === 0 && countItem(newInv, 'wood') >= 3) tut = 1;
      set({ inventory: newInv, hotbar: inventoryToHotbar(newInv), skills: newSkills, chronicle: [...state.chronicle, entry], tutorialObjective: tut });
      return true;
    }

    return false;
  },

  attackAction: () => {
    const state = get();
    if (state.phase !== 'playing') return;
    const result = playerAttack(state.playerX, state.playerY, state.facingDir.dx, state.facingDir.dy, state.inventory, state.skills);
    if (!result) return;
    const newSkills = addXp(state.skills, 'combat', result.xpGain);
    const newChronicle: ChronicleEntry[] = [];
    let inv = state.inventory;
    let gold = state.gold;
    if (result.killed && result.loot) {
      for (const row of result.loot.items) {
        inv = addToInventory(inv, row.itemId, row.qty);
      }
      gold += result.loot.gold;
      const kindLabel = result.targetKind ?? 'foe';
      newChronicle.push({
        tick: state.tick,
        season: state.season,
        text: `The traveler felled a ${kindLabel}. (+${result.xpGain} combat XP)`,
        type: 'action',
      });
    } else if (result.killed) {
      newChronicle.push({ tick: state.tick, season: state.season, text: `The traveler slew an enemy. (+${result.xpGain} combat XP)`, type: 'action' });
    }

    // Check if killed enemies advance any kill quests
    const newQuests = state.quests.map(q => {
      if (q.state !== 'active') return q;
      const step = q.steps.find(s => !s.completed && s.type === 'kill');
      if (step && result.killed) return { ...q, steps: q.steps.map(s => s === step ? { ...s, completed: true } : s) };
      return q;
    });

    let tut = state.tutorialObjective;
    if (result.killed && ['deer', 'sheep', 'rabbit'].includes(String(result.targetKind)) && tut === 2) tut = 3;

    set({
      skills: newSkills,
      quests: newQuests,
      inventory: inv,
      hotbar: inventoryToHotbar(inv),
      gold,
      chronicle: [...state.chronicle, ...newChronicle],
      tutorialObjective: tut,
    });
  },

  addItemToInventory: (itemId: string, qty: number) => {
    const state = get();
    const newInv = addToInventory(state.inventory, itemId, qty);
    set({ inventory: newInv, hotbar: inventoryToHotbar(newInv) });
  },

  removeItemFromInventory: (itemId: string, qty: number) => {
    const state = get();
    const newInv = removeFromInventory(state.inventory, itemId, qty);
    set({ inventory: newInv, hotbar: inventoryToHotbar(newInv) });
  },

  equipItemAction: (slotIndex: number) => {
    const state = get();
    const newInv = equipItem(state.inventory, slotIndex);
    set({ inventory: newInv, hotbar: inventoryToHotbar(newInv) });
  },

  unequipItemAction: (equipSlot: string) => {
    const state = get();
    const newInv = unequipItem(state.inventory, equipSlot);
    set({ inventory: newInv, hotbar: inventoryToHotbar(newInv) });
  },

  craftItemAction: (recipeId: string) => {
    const state = get();
    const recipe = RECIPES.find(r => r.id === recipeId);
    if (!recipe || !canCraft(state.inventory, recipe, state.skills as any)) return;
    const newInv = craft(state.inventory, recipe);
    const newSkills = addXp(state.skills, 'crafting', 10);
    const entry: ChronicleEntry = { tick: state.tick, season: state.season, text: `Crafted ${recipe.name}.`, type: 'action' };
    let tut = state.tutorialObjective;
    if (recipe.id === 'craft_wooden_club' && tut === 1) tut = 2;
    if (recipe.id === 'cook_meat' && tut === 3) tut = 4;
    set({ inventory: newInv, hotbar: inventoryToHotbar(newInv), skills: newSkills, chronicle: [...state.chronicle, entry], tutorialObjective: tut });
  },

  selectPerkAction: (perkId: string) => {
    const state = get();
    set({ skills: selectPerk(state.skills, perkId) });
  },

  buyItemAction: (itemId: string, qty: number) => {
    const state = get();
    const market = state.markets[state.currentLocation];
    if (!market) return;
    const mItem = market.items.find(i => i.itemId === itemId);
    if (!mItem || mItem.stock < qty) return;
    const scarcity = mItem.stock < 3 ? 2.0 : mItem.stock < 8 ? 1.3 : mItem.stock > 20 ? 0.7 : 1.0;
    let price = Math.max(1, Math.round(mItem.basePrice * mItem.priceMultiplier * scarcity));
    const locals = state.npcs.filter(n => n.location === state.currentLocation);
    const bestDisp = locals.length ? Math.max(...locals.map(n => n.disposition)) : 0;
    const discount = Math.min(0.12, Math.max(0, bestDisp) / 120);
    price = Math.max(1, Math.round(price * (1 - discount)));
    const totalCost = price * qty;
    if (state.gold < totalCost) return;
    const newInv = addToInventory(state.inventory, itemId, qty);
    const newMarket = { ...market, items: market.items.map(i => i.itemId === itemId ? { ...i, stock: i.stock - qty } : i) };
    set({ gold: state.gold - totalCost, inventory: newInv, hotbar: inventoryToHotbar(newInv), markets: { ...state.markets, [state.currentLocation]: newMarket } });
  },

  sellItemAction: (itemId: string, qty: number) => {
    const state = get();
    const def = ITEMS[itemId];
    if (!def) return;
    const inv = state.inventory;
    let count = 0;
    for (const s of inv.slots) if (s && s.itemId === itemId) count += s.qty;
    if (count < qty) return;
    const sellPrice = Math.max(1, Math.floor((def.value ?? 1) * 0.6));
    const revenue = sellPrice * qty;
    const newInv = removeFromInventory(state.inventory, itemId, qty);
    set({ gold: state.gold + revenue, inventory: newInv, hotbar: inventoryToHotbar(newInv) });
  },

  acceptQuest: (quest: Quest) => {
    const state = get();
    if (state.quests.some(q => q.id === quest.id)) return;
    set({ quests: [...state.quests, quest] });
  },

  purchasePlotAction: (locationId: string) => {
    const state = get();
    const price = PLOT_PRICES[locationId];
    if (!price || state.gold < price) return;
    const plot = state.housing.plots[locationId];
    if (!plot || plot.purchased) return;
    set({ gold: state.gold - price, housing: purchasePlot(state.housing, locationId) });
  },

  setActiveDialogue: (tree: DialogueTree | null) => set({ activeDialogue: tree }),
}));
