import { Quest, generateBountyQuest } from './questSystem';
import type { RegionalModifiers } from './regionalState';
import { regionalTagsForBounty } from './regionalState';

export interface BountyBoard {
  locationId: string;
  bounties: Quest[];
  lastRefreshTick: number;
}

const BANDIT_NAMES = [
  'Silver Maw', 'Greyhand', 'The Butcher', 'Crowfeeder', 'Ironteeth',
  'Nighthowl', 'Redfang', 'The Wraith', 'Dustwalker', 'Bogrot',
  'Viperjaw', 'Blackthorn', 'The Rat King', 'Bonebreaker', 'Asheater',
];

function hashBounty(seed: number): number {
  let h = (seed * 1274126177) & 0xffffffff;
  return (h & 0x7fffffff) / 0x7fffffff;
}

export function createBountyBoard(
  locationId: string,
  worldTime: number,
  modifiers?: RegionalModifiers,
): BountyBoard {
  const count = 2 + Math.floor(hashBounty(worldTime + locationId.charCodeAt(0)) * 3);
  const bounties: Quest[] = [];
  const tags = modifiers ? regionalTagsForBounty(modifiers) : ['routine'];
  for (let i = 0; i < count; i++) {
    const nameIdx = Math.floor(hashBounty(worldTime * 31 + i * 97 + locationId.charCodeAt(0)) * BANDIT_NAMES.length);
    const reward = 50 + Math.floor(hashBounty(worldTime * 53 + i * 71) * 150);
    bounties.push(generateBountyQuest(BANDIT_NAMES[nameIdx], locationId, reward, tags));
  }
  return { locationId, bounties, lastRefreshTick: worldTime };
}

export function refreshBountyBoard(board: BountyBoard, worldTime: number, modifiers?: RegionalModifiers): BountyBoard {
  // Refresh every 100 ticks
  if (worldTime - board.lastRefreshTick < 100) return board;
  return createBountyBoard(board.locationId, worldTime, modifiers);
}
