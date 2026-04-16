export type DayNightPhase = 'dawn' | 'day' | 'dusk' | 'night';

// 48 ticks = 1 in-game day. At 1500ms/tick, that's ~72 seconds per day.
export const TICKS_PER_DAY = 48;
export const TICKS_PER_HOUR = TICKS_PER_DAY / 24; // 2 ticks per hour

export function getHourFromTime(worldTime: number): number {
  return Math.floor((worldTime % TICKS_PER_DAY) / TICKS_PER_HOUR);
}

export function getDayNightPhase(worldTime: number): DayNightPhase {
  const hour = getHourFromTime(worldTime);
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 18) return 'day';
  if (hour >= 18 && hour < 20) return 'dusk';
  return 'night';
}

export function getDayNumber(worldTime: number): number {
  return Math.floor(worldTime / TICKS_PER_DAY) + 1;
}

export function getTimeString(worldTime: number): string {
  const hour = getHourFromTime(worldTime);
  const minute = Math.floor(((worldTime % TICKS_PER_HOUR) / TICKS_PER_HOUR) * 60);
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// Lighting tint based on time of day: returns [r, g, b, alpha] overlay
export function getLightingTint(worldTime: number): [number, number, number, number] {
  const phase = getDayNightPhase(worldTime);
  switch (phase) {
    case 'dawn':  return [255, 200, 140, 0.08];
    case 'day':   return [0, 0, 0, 0];
    case 'dusk':  return [200, 100, 50, 0.12];
    case 'night': return [10, 10, 40, 0.35];
  }
}
