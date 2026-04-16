export interface FactionState {
  id: string;
  name: string;
  treasury: number;
  armySize: number;
  territory: string[];
  atWarWith: string[];
  morale: number;
}

export function createFactions(): Record<string, FactionState> {
  return {
    auredia_crown: { id: 'auredia_crown', name: 'Grand Kingdom of Auredia', treasury: 5000, armySize: 200, territory: ['highmarch', 'ashenford', 'saltmoor', 'ironhold', 'thornwick', 'graygate', 'crossroads', 'coldpeak', 'millhaven', 'brightwater', 'oakshire', 'goldcrest'], atWarWith: [], morale: 80 },
    korrath:       { id: 'korrath', name: 'Kingdom of Korrath', treasury: 3000, armySize: 150, territory: ['korrath_citadel', 'frostmarch', 'deepmine'], atWarWith: ['sarnak'], morale: 70 },
    vell:          { id: 'vell', name: 'Kingdom of Vell', treasury: 4000, armySize: 100, territory: ['vell_harbor', 'sunfield', 'coral_cove'], atWarWith: [], morale: 75 },
    sarnak:        { id: 'sarnak', name: 'Sarnak Khanate', treasury: 2000, armySize: 180, territory: ['sarnak_hold', 'windridge', 'dustplain'], atWarWith: ['korrath'], morale: 85 },
  };
}

export function tickFaction(faction: FactionState): FactionState {
  const next = { ...faction };

  // Tax collection
  next.treasury += next.territory.length * 50;

  // Army maintenance
  next.treasury -= next.armySize * 5;
  if (next.treasury < 0) {
    // Can't pay army — morale drops, army shrinks
    next.morale = Math.max(0, next.morale - 5);
    next.armySize = Math.max(0, next.armySize - 10);
    next.treasury = 0;
  }

  // Recruitment if at war and has money
  if (next.atWarWith.length > 0 && next.treasury > 500) {
    const recruits = Math.min(10, Math.floor(next.treasury / 100));
    next.armySize += recruits;
    next.treasury -= recruits * 100;
  }

  // Morale recovery when at peace
  if (next.atWarWith.length === 0 && next.morale < 90) {
    next.morale = Math.min(100, next.morale + 2);
  }

  return next;
}

export function declareWar(factions: Record<string, FactionState>, attackerId: string, defenderId: string): Record<string, FactionState> {
  const next = { ...factions };
  const a = { ...next[attackerId] };
  const d = { ...next[defenderId] };
  if (!a.atWarWith.includes(defenderId)) a.atWarWith = [...a.atWarWith, defenderId];
  if (!d.atWarWith.includes(attackerId)) d.atWarWith = [...d.atWarWith, attackerId];
  next[attackerId] = a;
  next[defenderId] = d;
  return next;
}

export function makePeace(factions: Record<string, FactionState>, aId: string, bId: string): Record<string, FactionState> {
  const next = { ...factions };
  const a = { ...next[aId] };
  const b = { ...next[bId] };
  a.atWarWith = a.atWarWith.filter(id => id !== bId);
  b.atWarWith = b.atWarWith.filter(id => id !== aId);
  next[aId] = a;
  next[bId] = b;
  return next;
}

export function captureTerritory(factions: Record<string, FactionState>, winnerId: string, loserId: string, locationId: string): Record<string, FactionState> {
  const next = { ...factions };
  const w = { ...next[winnerId] };
  const l = { ...next[loserId] };
  l.territory = l.territory.filter(t => t !== locationId);
  if (!w.territory.includes(locationId)) w.territory = [...w.territory, locationId];
  next[winnerId] = w;
  next[loserId] = l;
  return next;
}
