import { Recipe } from './gameTypes';

export const RECIPES: Recipe[] = [
  // ─── Campfire (cooking) ───
  { id: 'cook_meat',    name: 'Cook Meat',       inputs: [{ itemId: 'raw_meat', qty: 1 }],                                 output: { itemId: 'cooked_meat', qty: 1 }, workbench: 'campfire' },
  { id: 'bake_bread',   name: 'Bake Bread',      inputs: [{ itemId: 'grain', qty: 3 }],                                    output: { itemId: 'bread', qty: 1 },       workbench: 'campfire' },
  { id: 'trail_ration', name: 'Trail Rations',   inputs: [{ itemId: 'cooked_meat', qty: 1 }, { itemId: 'salt', qty: 1 }],  output: { itemId: 'trail_ration', qty: 2 }, workbench: 'campfire' },

  // ─── Anvil (smelting + smithing) ───
  { id: 'smelt_iron',   name: 'Smelt Iron',      inputs: [{ itemId: 'iron_ore', qty: 2 }, { itemId: 'coal', qty: 1 }],     output: { itemId: 'iron_ingot', qty: 1 },  workbench: 'anvil', skill: 'crafting', minSkillLevel: 1 },
  { id: 'smelt_steel',  name: 'Smelt Steel',     inputs: [{ itemId: 'iron_ingot', qty: 2 }, { itemId: 'coal', qty: 2 }],   output: { itemId: 'steel_ingot', qty: 1 }, workbench: 'anvil', skill: 'crafting', minSkillLevel: 4 },
  { id: 'smelt_gold',   name: 'Smelt Gold',      inputs: [{ itemId: 'gold_ore', qty: 2 }, { itemId: 'coal', qty: 1 }],     output: { itemId: 'gold_ingot', qty: 1 },  workbench: 'anvil', skill: 'crafting', minSkillLevel: 3 },
  { id: 'forge_sword',  name: 'Forge Iron Sword',inputs: [{ itemId: 'iron_ingot', qty: 3 }, { itemId: 'wood', qty: 1 }],   output: { itemId: 'iron_sword', qty: 1 },  workbench: 'anvil', skill: 'crafting', minSkillLevel: 2 },
  { id: 'forge_ssword', name: 'Forge Steel Sword',inputs:[{ itemId: 'steel_ingot', qty: 3 }, { itemId: 'wood', qty: 1 }],  output: { itemId: 'steel_sword', qty: 1 }, workbench: 'anvil', skill: 'crafting', minSkillLevel: 5 },
  { id: 'forge_axe',    name: 'Forge Axe',       inputs: [{ itemId: 'iron_ingot', qty: 2 }, { itemId: 'wood', qty: 1 }],   output: { itemId: 'axe', qty: 1 },         workbench: 'anvil', skill: 'crafting', minSkillLevel: 2 },
  { id: 'forge_pick',   name: 'Forge Pickaxe',   inputs: [{ itemId: 'iron_ingot', qty: 2 }, { itemId: 'wood', qty: 1 }],   output: { itemId: 'pickaxe', qty: 1 },     workbench: 'anvil', skill: 'crafting', minSkillLevel: 2 },
  { id: 'forge_cbow',   name: 'Forge Crossbow',  inputs: [{ itemId: 'iron_ingot', qty: 2 }, { itemId: 'wood', qty: 3 }],   output: { itemId: 'crossbow', qty: 1 },    workbench: 'anvil', skill: 'crafting', minSkillLevel: 4 },
  { id: 'iron_helm',    name: 'Iron Helm',       inputs: [{ itemId: 'iron_ingot', qty: 2 }],                               output: { itemId: 'iron_helm', qty: 1 },   workbench: 'anvil', skill: 'crafting', minSkillLevel: 2 },
  { id: 'iron_chest',   name: 'Iron Cuirass',    inputs: [{ itemId: 'iron_ingot', qty: 5 }],                               output: { itemId: 'iron_chest', qty: 1 },  workbench: 'anvil', skill: 'crafting', minSkillLevel: 3 },
  { id: 'steel_chest',  name: 'Steel Cuirass',   inputs: [{ itemId: 'steel_ingot', qty: 5 }],                              output: { itemId: 'steel_chest', qty: 1 }, workbench: 'anvil', skill: 'crafting', minSkillLevel: 6 },
  { id: 'iron_legs',    name: 'Iron Greaves',    inputs: [{ itemId: 'iron_ingot', qty: 3 }],                               output: { itemId: 'iron_legs', qty: 1 },   workbench: 'anvil', skill: 'crafting', minSkillLevel: 2 },
  { id: 'iron_boots',   name: 'Iron Boots',      inputs: [{ itemId: 'iron_ingot', qty: 2 }],                               output: { itemId: 'iron_boots', qty: 1 },  workbench: 'anvil', skill: 'crafting', minSkillLevel: 2 },

  // ─── Loom (tailoring) ───
  { id: 'weave_cloth',  name: 'Weave Cloth',     inputs: [{ itemId: 'herb', qty: 2 }],                                     output: { itemId: 'cloth', qty: 1 },       workbench: 'loom' },
  { id: 'leather_helm', name: 'Leather Cap',     inputs: [{ itemId: 'leather', qty: 2 }],                                  output: { itemId: 'leather_helm', qty: 1 },workbench: 'loom' },
  { id: 'leather_vest', name: 'Leather Vest',    inputs: [{ itemId: 'leather', qty: 4 }],                                  output: { itemId: 'leather_chest', qty: 1 }, workbench: 'loom' },
  { id: 'leather_legs', name: 'Leather Greaves', inputs: [{ itemId: 'leather', qty: 3 }],                                  output: { itemId: 'leather_legs', qty: 1 },workbench: 'loom' },
  { id: 'boots',        name: 'Travel Boots',    inputs: [{ itemId: 'leather', qty: 2 }],                                  output: { itemId: 'boots', qty: 1 },       workbench: 'loom' },

  // ─── Alchemy ───
  { id: 'heal_small',   name: 'Minor Potion',    inputs: [{ itemId: 'herb', qty: 2 }],                                     output: { itemId: 'heal_potion_s', qty: 1 }, workbench: 'alchemy' },
  { id: 'heal_full',    name: 'Healing Potion',  inputs: [{ itemId: 'herb', qty: 4 }, { itemId: 'cloth', qty: 1 }],        output: { itemId: 'heal_potion', qty: 1 }, workbench: 'alchemy', skill: 'crafting', minSkillLevel: 3 },

  // ─── Hand-crafted (no workbench) ───
  { id: 'wooden_club',  name: 'Wooden Club',     inputs: [{ itemId: 'wood', qty: 2 }],                                     output: { itemId: 'wooden_club', qty: 1 }, workbench: 'none' },
  { id: 'shortbow',     name: 'Shortbow',        inputs: [{ itemId: 'wood', qty: 3 }, { itemId: 'cloth', qty: 1 }],        output: { itemId: 'shortbow', qty: 1 },    workbench: 'none' },
  { id: 'flint_steel',  name: 'Flint & Steel',   inputs: [{ itemId: 'stone', qty: 1 }, { itemId: 'iron_ingot', qty: 1 }],  output: { itemId: 'flint_steel', qty: 1 }, workbench: 'none' },
  { id: 'fishing_rod',  name: 'Fishing Rod',     inputs: [{ itemId: 'wood', qty: 2 }, { itemId: 'cloth', qty: 1 }],        output: { itemId: 'fishing_rod', qty: 1 }, workbench: 'none' },

  // ─── Furniture (placeable) ───
  { id: 'bed',          name: 'Bed',             inputs: [{ itemId: 'wood', qty: 4 }, { itemId: 'cloth', qty: 2 }],        output: { itemId: 'bed', qty: 1 },         workbench: 'none' },
  { id: 'chest',        name: 'Chest',           inputs: [{ itemId: 'wood', qty: 6 }],                                     output: { itemId: 'chest', qty: 1 },       workbench: 'none' },
  { id: 'workbench',    name: 'Workbench',       inputs: [{ itemId: 'wood', qty: 8 }],                                     output: { itemId: 'workbench', qty: 1 },   workbench: 'none' },
  { id: 'anvil',        name: 'Anvil',           inputs: [{ itemId: 'iron_ingot', qty: 6 }],                               output: { itemId: 'anvil', qty: 1 },       workbench: 'none' },
  { id: 'loom',         name: 'Loom',            inputs: [{ itemId: 'wood', qty: 6 }, { itemId: 'cloth', qty: 2 }],        output: { itemId: 'loom', qty: 1 },        workbench: 'none' },
  { id: 'campfire_fur', name: 'Campfire',        inputs: [{ itemId: 'wood', qty: 4 }, { itemId: 'stone', qty: 2 }],        output: { itemId: 'campfire_fur', qty: 1 },workbench: 'none' },
  { id: 'alchemy_table',name: 'Alchemy Table',   inputs: [{ itemId: 'wood', qty: 4 }, { itemId: 'iron_ingot', qty: 2 }, { itemId: 'herb', qty: 4 }], output: { itemId: 'alchemy_table', qty: 1 }, workbench: 'none' },
];

export function findRecipe(id: string): Recipe | undefined {
  return RECIPES.find(r => r.id === id);
}
