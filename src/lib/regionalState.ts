import type { ContinentId } from './mapGenerator';

export interface RegionalModifiers {
  /** 0–1 tension on contested routes (affects prices, bounties). */
  warTension: number;
  /** 0–1 drought / crop stress (grain, bread). */
  drought: number;
  /** 0–1 bandit pressure on roads (salt, spice, escort bounties). */
  banditPressure: number;
  /** 0–1 storm severity aggregate (fish, travel). */
  stormSeverity: number;
  lastChronicleBand: number;
}

export function createRegionalModifiers(): RegionalModifiers {
  return {
    warTension: 0.15 + Math.random() * 0.1,
    drought: 0.1 + Math.random() * 0.1,
    banditPressure: 0.12 + Math.random() * 0.12,
    stormSeverity: 0.08,
    lastChronicleBand: 0,
  };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function continentForKingdom(k: string): ContinentId | null {
  if (k === 'auredia_crown') return 'auredia';
  if (['korrath', 'vell', 'sarnak', 'contested'].includes(k)) return 'trivalen';
  if (k === 'unknown') return 'uloren';
  return null;
}

/** Advance regional simulation; returns optional short chronicle line (rate-limited). */
export function tickRegionalModifiers(
  prev: RegionalModifiers,
  worldTime: number,
  weatherByContinent: Record<string, { state: string; duration: number }>,
  factionTreasuryStress: number,
): { next: RegionalModifiers; chronicleLine: string | null } {
  const next = { ...prev };
  const band = Math.floor(worldTime / 48);
  let chronicleLine: string | null = null;

  next.warTension = clamp01(next.warTension + (Math.random() - 0.48) * 0.02 + factionTreasuryStress * 0.015);
  next.drought = clamp01(next.drought + (Math.random() - 0.5) * 0.025);
  next.banditPressure = clamp01(next.banditPressure + (Math.random() - 0.47) * 0.022 + next.warTension * 0.01);

  let storm = 0;
  for (const w of Object.values(weatherByContinent)) {
    if (w.state === 'storm') storm += 0.35;
    else if (w.state === 'rain') storm += 0.15;
  }
  next.stormSeverity = clamp01(storm / 3 + next.stormSeverity * 0.85);

  if (worldTime % 48 === 0) {
    next.drought = clamp01(next.drought + (Math.random() < 0.25 ? 0.06 : -0.04));
  }

  if (band > prev.lastChronicleBand + 2 && worldTime % 24 === 0) {
    next.lastChronicleBand = band;
    if (next.warTension > 0.55 && Math.random() < 0.4) {
      chronicleLine = 'Rumors spread: mercenary captains raise rates as border tension climbs.';
    } else if (next.drought > 0.55 && Math.random() < 0.4) {
      chronicleLine = 'Dry winds from the east; well-keepers ration water on the long roads.';
    } else if (next.banditPressure > 0.55 && Math.random() < 0.4) {
      chronicleLine = 'Merchants whisper of closed caravans and missing wagons on the trade lines.';
    } else if (next.stormSeverity > 0.45 && Math.random() < 0.35) {
      chronicleLine = 'Harbor chains sing in the gale; insurers double their fees.';
    }
  }

  return { next, chronicleLine };
}

export function getContinentModifierMul(
  continent: ContinentId | null | undefined,
  modifiers: RegionalModifiers,
  kingdom: string,
): { stockMul: number; priceMul: number } {
  let stockMul = 1;
  let priceMul = 1;
  const c = continent ?? continentForKingdom(kingdom);
  if (c === 'trivalen' || kingdom === 'contested') {
    stockMul *= 1 - modifiers.warTension * 0.22;
    priceMul *= 1 + modifiers.warTension * 0.35;
    priceMul *= 1 + modifiers.banditPressure * 0.2;
  }
  if (c === 'auredia') {
    stockMul *= 1 - modifiers.drought * 0.18;
    priceMul *= 1 + modifiers.drought * 0.28;
  }
  if (c === 'trivalen' && kingdom === 'vell') {
    stockMul *= 1 - modifiers.stormSeverity * 0.12;
    priceMul *= 1 + modifiers.stormSeverity * 0.15;
  }
  return { stockMul, priceMul };
}

export function regionalTagsForBounty(modifiers: RegionalModifiers): string[] {
  const tags: string[] = [];
  if (modifiers.banditPressure > 0.45) tags.push('banditry');
  if (modifiers.warTension > 0.45) tags.push('border_war');
  if (modifiers.drought > 0.45) tags.push('drought');
  if (modifiers.stormSeverity > 0.4) tags.push('storms');
  if (tags.length === 0) tags.push('routine');
  return tags;
}
