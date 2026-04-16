export interface SkillBranch {
  xp: number;
  level: number;
  perks: string[];
}

export interface SkillTree {
  combat: SkillBranch;
  stealth: SkillBranch;
  diplomacy: SkillBranch;
  crafting: SkillBranch;
}

export function createSkillTree(): SkillTree {
  return {
    combat:    { xp: 0, level: 1, perks: [] },
    stealth:   { xp: 0, level: 1, perks: [] },
    diplomacy: { xp: 0, level: 1, perks: [] },
    crafting:  { xp: 0, level: 1, perks: [] },
  };
}

const XP_TABLE = [0, 100, 250, 500, 800, 1200, 1800, 2500, 3500, 5000]; // level 1-10

export function xpForLevel(level: number): number {
  return XP_TABLE[Math.min(level - 1, XP_TABLE.length - 1)] ?? 5000;
}

export function addXp(tree: SkillTree, skill: keyof SkillTree, amount: number): SkillTree {
  const next = { ...tree, [skill]: { ...tree[skill] } };
  const branch = next[skill];
  branch.xp += amount;
  while (branch.level < 10 && branch.xp >= xpForLevel(branch.level + 1)) {
    branch.level++;
  }
  return next;
}

export interface PerkDef {
  id: string;
  name: string;
  description: string;
  skill: keyof SkillTree;
  levelReq: number;
}

export const PERKS: PerkDef[] = [
  // Combat
  { id: 'power_strike', name: 'Power Strike', description: '+20% melee damage', skill: 'combat', levelReq: 2 },
  { id: 'thick_skin', name: 'Thick Skin', description: '+3 armor from toughness', skill: 'combat', levelReq: 4 },
  { id: 'berserker', name: 'Berserker', description: 'Deal more damage below 30% health', skill: 'combat', levelReq: 6 },
  { id: 'cleave', name: 'Cleave', description: 'Attacks hit enemies in an arc', skill: 'combat', levelReq: 8 },

  // Stealth
  { id: 'light_foot', name: 'Light Foot', description: 'Reduced aggro radius from enemies', skill: 'stealth', levelReq: 2 },
  { id: 'pickpocket', name: 'Pickpocket', description: 'Steal from NPCs within melee range', skill: 'stealth', levelReq: 4 },
  { id: 'shadow_step', name: 'Shadow Step', description: 'Move faster at night', skill: 'stealth', levelReq: 6 },
  { id: 'assassin', name: 'Assassin', description: '2× damage on unaware targets', skill: 'stealth', levelReq: 8 },

  // Diplomacy
  { id: 'silver_tongue', name: 'Silver Tongue', description: 'Better trade prices', skill: 'diplomacy', levelReq: 2 },
  { id: 'reputation_bonus', name: 'Renown', description: '+50% reputation gains', skill: 'diplomacy', levelReq: 4 },
  { id: 'faction_favor', name: 'Faction Favor', description: 'Start with +10 faction standing', skill: 'diplomacy', levelReq: 6 },
  { id: 'kingmaker', name: 'Kingmaker', description: 'Unlock special faction dialogue', skill: 'diplomacy', levelReq: 8 },

  // Crafting
  { id: 'efficient_craft', name: 'Efficient Crafting', description: '20% chance to not consume materials', skill: 'crafting', levelReq: 2 },
  { id: 'double_yield', name: 'Double Yield', description: 'Gathering gives +1 resource', skill: 'crafting', levelReq: 4 },
  { id: 'master_smith', name: 'Master Smith', description: 'Crafted weapons get +3 damage', skill: 'crafting', levelReq: 6 },
  { id: 'alchemist', name: 'Alchemist', description: 'Potions are 50% more effective', skill: 'crafting', levelReq: 8 },
];

export function getAvailablePerks(tree: SkillTree): PerkDef[] {
  return PERKS.filter(p => {
    const branch = tree[p.skill];
    return branch.level >= p.levelReq && !branch.perks.includes(p.id);
  });
}

export function selectPerk(tree: SkillTree, perkId: string): SkillTree {
  const perk = PERKS.find(p => p.id === perkId);
  if (!perk) return tree;
  const branch = tree[perk.skill];
  if (branch.level < perk.levelReq || branch.perks.includes(perkId)) return tree;
  return {
    ...tree,
    [perk.skill]: { ...branch, perks: [...branch.perks, perkId] },
  };
}
