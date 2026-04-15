import { Item } from './gameTypes';

// Catalog factory — creates a fresh stack entry; stack + value + stats live here.
export const ITEM_CATALOG: Record<string, Omit<Item, 'quantity'>> = {
  // ─── Tools ───
  bare_hands:    { id: 'bare_hands',   name: 'Bare Hands',    icon: '✊', type: 'tool',    description: 'All you have. For now.', damage: 1, equipSlot: 'mainhand', value: 0 },
  rusty_knife:   { id: 'rusty_knife',  name: 'Rusty Knife',   icon: '🗡️', type: 'weapon',  description: 'Worn blade. Better than fists.', damage: 4, equipSlot: 'mainhand', value: 8 },
  flint_steel:   { id: 'flint_steel',  name: 'Flint & Steel', icon: '🔥', type: 'tool',    description: 'Start fires.', value: 5 },
  waterskin:     { id: 'waterskin',    name: 'Waterskin',     icon: '🫗', type: 'misc',    description: 'Empty. Find a river.', value: 3 },
  pickaxe:       { id: 'pickaxe',      name: 'Pickaxe',       icon: '⛏️', type: 'tool',    description: 'Break rock. Mine ore.', damage: 3, equipSlot: 'mainhand', value: 25 },
  axe:           { id: 'axe',          name: 'Axe',           icon: '🪓', type: 'tool',    description: 'Fell trees. Swing hard.', damage: 5, equipSlot: 'mainhand', value: 20 },
  fishing_rod:   { id: 'fishing_rod',  name: 'Fishing Rod',   icon: '🎣', type: 'tool',    description: 'Pull dinner from the water.', value: 12 },

  // ─── Weapons ───
  wooden_club:   { id: 'wooden_club',  name: 'Wooden Club',   icon: '🪵', type: 'weapon',  description: 'A heavy stick, but yours.', damage: 5, equipSlot: 'mainhand', value: 5 },
  iron_sword:    { id: 'iron_sword',   name: 'Iron Sword',    icon: '⚔️', type: 'weapon',  description: 'Standard-issue iron blade.', damage: 12, equipSlot: 'mainhand', value: 80 },
  steel_sword:   { id: 'steel_sword',  name: 'Steel Sword',   icon: '🗡️', type: 'weapon',  description: 'Well-forged steel. Sings.', damage: 20, equipSlot: 'mainhand', value: 260 },
  shortbow:      { id: 'shortbow',     name: 'Shortbow',      icon: '🏹', type: 'weapon',  description: 'Hunts at range.', damage: 9, equipSlot: 'mainhand', value: 40 },
  crossbow:      { id: 'crossbow',     name: 'Crossbow',      icon: '🏹', type: 'weapon',  description: 'Punches through mail.', damage: 16, equipSlot: 'mainhand', value: 120 },

  // ─── Armor ───
  leather_helm:  { id: 'leather_helm', name: 'Leather Cap',   icon: '🪖', type: 'armor', description: 'Boiled hide.', armor: 2, equipSlot: 'helm', value: 15 },
  iron_helm:     { id: 'iron_helm',    name: 'Iron Helm',     icon: '🪖', type: 'armor', description: 'Dented but solid.', armor: 5, equipSlot: 'helm', value: 60 },
  leather_chest: { id: 'leather_chest',name: 'Leather Vest',  icon: '🎽', type: 'armor', description: 'Tough hide plates.', armor: 4, equipSlot: 'chest', value: 30 },
  iron_chest:    { id: 'iron_chest',   name: 'Iron Cuirass',  icon: '🛡️', type: 'armor', description: 'Heavy. Reassuring.', armor: 10, equipSlot: 'chest', value: 140 },
  steel_chest:   { id: 'steel_chest',  name: 'Steel Cuirass', icon: '🛡️', type: 'armor', description: 'Tempered plate.', armor: 18, equipSlot: 'chest', value: 400 },
  leather_legs:  { id: 'leather_legs', name: 'Leather Greaves',icon: '👖', type: 'armor', description: 'Tough hide.', armor: 3, equipSlot: 'legs', value: 20 },
  iron_legs:     { id: 'iron_legs',    name: 'Iron Greaves',  icon: '👖', type: 'armor', description: 'Iron plates.', armor: 7, equipSlot: 'legs', value: 90 },
  boots:         { id: 'boots',        name: 'Travel Boots',  icon: '🥾', type: 'armor', description: 'Worn but broken in.', armor: 1, equipSlot: 'boots', value: 10 },
  iron_boots:    { id: 'iron_boots',   name: 'Iron Boots',    icon: '🥾', type: 'armor', description: 'Stomps make a point.', armor: 4, equipSlot: 'boots', value: 50 },
  amulet_luck:   { id: 'amulet_luck',  name: 'Amulet of Luck',icon: '🔱', type: 'armor', description: 'Feels warm. Maybe means nothing.', armor: 1, equipSlot: 'amulet', value: 200 },

  // ─── Resources ───
  wood:          { id: 'wood',          name: 'Wood',          icon: '🪵', type: 'resource', description: 'Raw timber.', stack: 64, value: 1 },
  stone:         { id: 'stone',         name: 'Stone',         icon: '🪨', type: 'resource', description: 'Rough rock.', stack: 64, value: 1 },
  iron_ore:      { id: 'iron_ore',      name: 'Iron Ore',      icon: '⚙️', type: 'resource', description: 'Raw iron.', stack: 64, value: 3 },
  coal:          { id: 'coal',          name: 'Coal',          icon: '⚫', type: 'resource', description: 'Burns hot.', stack: 64, value: 2 },
  gold_ore:      { id: 'gold_ore',      name: 'Gold Ore',      icon: '🪙', type: 'resource', description: 'Unrefined gold.', stack: 64, value: 15 },
  iron_ingot:    { id: 'iron_ingot',    name: 'Iron Ingot',    icon: '🟫', type: 'resource', description: 'Smelted iron.', stack: 32, value: 8 },
  steel_ingot:   { id: 'steel_ingot',   name: 'Steel Ingot',   icon: '⬜', type: 'resource', description: 'Forged steel.', stack: 32, value: 22 },
  gold_ingot:    { id: 'gold_ingot',    name: 'Gold Ingot',    icon: '🟨', type: 'resource', description: 'Refined gold.', stack: 32, value: 50 },
  leather:       { id: 'leather',       name: 'Leather',       icon: '🟤', type: 'resource', description: 'Cured hide.', stack: 32, value: 4 },
  cloth:         { id: 'cloth',         name: 'Cloth',         icon: '🧵', type: 'resource', description: 'Woven linen.', stack: 32, value: 3 },
  herb:          { id: 'herb',          name: 'Herb',          icon: '🌿', type: 'resource', description: 'Fragrant leaves.', stack: 32, value: 2 },

  // ─── Food ───
  berries:       { id: 'berries',       name: 'Wild Berries',  icon: '🫐', type: 'food', description: 'Sweet and tart.', hunger: 10, stack: 16, value: 1 },
  raw_meat:      { id: 'raw_meat',      name: 'Raw Meat',      icon: '🥩', type: 'food', description: 'Better cooked.', hunger: 8, stack: 16, value: 2 },
  cooked_meat:   { id: 'cooked_meat',   name: 'Cooked Meat',   icon: '🍖', type: 'food', description: 'Proper meal.', hunger: 30, stack: 16, value: 6 },
  fish:          { id: 'fish',          name: 'Fresh Fish',    icon: '🐟', type: 'food', description: 'River catch.', hunger: 15, stack: 16, value: 3 },
  bread:         { id: 'bread',         name: 'Bread',         icon: '🍞', type: 'food', description: 'Warm crust.', hunger: 20, stack: 16, value: 4 },
  trail_ration:  { id: 'trail_ration',  name: 'Trail Rations', icon: '🍖', type: 'food', description: 'Dense food.', hunger: 25, stack: 16, value: 8 },
  grain:         { id: 'grain',         name: 'Grain',         icon: '🌾', type: 'resource', description: 'Unground wheat.', stack: 64, value: 1 },

  // ─── Potions ───
  heal_potion:   { id: 'heal_potion',   name: 'Healing Potion',icon: '🧪', type: 'potion', description: 'Restores 40 HP.', healAmount: 40, stack: 8, value: 40 },
  heal_potion_s: { id: 'heal_potion_s', name: 'Minor Potion',  icon: '🧪', type: 'potion', description: 'Restores 15 HP.', healAmount: 15, stack: 8, value: 15 },

  // ─── Trade goods ───
  spice:         { id: 'spice',         name: 'Spices',        icon: '🌶️', type: 'trade', description: 'Rare pepper.', stack: 32, value: 12 },
  silk:          { id: 'silk',          name: 'Silk',          icon: '🪢', type: 'trade', description: 'Fine cloth.', stack: 32, value: 18 },
  salt:          { id: 'salt',          name: 'Salt',          icon: '🧂', type: 'trade', description: 'Preserves meat.', stack: 32, value: 5 },

  // ─── Furniture (placeable) ───
  bed:           { id: 'bed',           name: 'Bed',           icon: '🛏️', type: 'furniture', description: 'Restores stamina.', stack: 1, value: 30 },
  chest:         { id: 'chest',         name: 'Chest',         icon: '📦', type: 'furniture', description: 'Store items.', stack: 1, value: 25 },
  workbench:     { id: 'workbench',     name: 'Workbench',     icon: '🔨', type: 'furniture', description: 'Craft tools here.', stack: 1, value: 40 },
  anvil:         { id: 'anvil',         name: 'Anvil',         icon: '⚒️', type: 'furniture', description: 'Smith metal.', stack: 1, value: 80 },
  loom:          { id: 'loom',          name: 'Loom',          icon: '🧶', type: 'furniture', description: 'Weave cloth.', stack: 1, value: 50 },
  campfire_fur:  { id: 'campfire_fur',  name: 'Campfire',      icon: '🔥', type: 'furniture', description: 'Cook food.', stack: 1, value: 15 },
  alchemy_table: { id: 'alchemy_table', name: 'Alchemy Table', icon: '⚗️', type: 'furniture', description: 'Brew potions.', stack: 1, value: 90 },

  // ─── Misc ───
  empty:         { id: 'empty',         name: '',              icon: '',   type: 'misc', description: '', stack: 1, value: 0 },
};

export function makeItem(id: string, quantity = 1): Item {
  const base = ITEM_CATALOG[id];
  if (!base) return { id: 'empty', name: '', icon: '', type: 'misc', quantity: 0, description: '' };
  return { ...base, quantity };
}

export const EMPTY_ITEM: Item = makeItem('empty', 0);
