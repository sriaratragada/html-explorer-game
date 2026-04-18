import type { ContinentId } from './mapGenerator';
import type { Season } from './gameTypes';
import type { RegionalModifiers } from './regionalState';
import type { WeatherState } from './gameTypes';

export interface FishingRollContext {
  continent: ContinentId | null;
  season: Season;
  weather: WeatherState;
  regional: RegionalModifiers;
  craftingLevel: number;
  seedSalt: number;
}

function rng(salt: number, i: number): number {
  let h = (salt * 9301 + 49297 + i * 233280) & 0xffffffff;
  h = ((h ^ (h >> 13)) * 1274126177) & 0xffffffff;
  return (h & 0x7fffffff) / 0x7fffffff;
}

/** Overworld fishing loot — never uses dungeon tables. */
export function rollFishingLoot(ctx: FishingRollContext): { itemId: string; qty: number }[] {
  const r0 = rng(ctx.seedSalt, 1);
  const baseChance = 0.55 + Math.min(0.25, ctx.craftingLevel * 0.02);
  let chance = baseChance;
  if (ctx.weather === 'storm') chance -= 0.12;
  if (ctx.weather === 'rain') chance -= 0.04;
  if (ctx.regional.drought > 0.45) chance -= 0.08;
  if (ctx.regional.stormSeverity > 0.4) chance -= ctx.regional.stormSeverity * 0.1;
  if (r0 > chance) return [];

  const pool: { id: string; w: number }[] = [
    { id: 'fish', w: 4 },
    { id: 'herb', w: 1.2 },
    { id: 'berries', w: 1 },
  ];
  if (ctx.continent === 'trivalen') {
    pool.push({ id: 'salt', w: 1.5 });
    pool.push({ id: 'cloth', w: 0.8 });
  }
  if (ctx.continent === 'uloren') {
    pool.push({ id: 'crystal', w: 0.35 });
  }
  if (ctx.season === 'dark') {
    pool.push({ id: 'herb', w: 0.6 });
  }

  const sum = pool.reduce((a, p) => a + p.w, 0);
  let t = rng(ctx.seedSalt, 2) * sum;
  let pick = pool[0]!.id;
  for (const p of pool) {
    t -= p.w;
    if (t <= 0) {
      pick = p.id;
      break;
    }
  }

  let qty = 1 + (rng(ctx.seedSalt, 3) > 0.55 ? 1 : 0);
  if (ctx.season === 'summer' && pick === 'fish') qty += 1;
  if (ctx.regional.drought > 0.5 && pick === 'fish') qty = Math.max(1, qty - 1);

  return [{ itemId: pick, qty: Math.min(8, qty) }];
}
