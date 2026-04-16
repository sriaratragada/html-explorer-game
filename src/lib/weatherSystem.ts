import { ContinentId } from './mapGenerator';

export type WeatherState = 'clear' | 'cloudy' | 'rain' | 'storm';

export interface ContinentWeather {
  state: WeatherState;
  duration: number; // ticks remaining in this state
}

const TRANSITION: Record<WeatherState, WeatherState[]> = {
  clear:  ['clear', 'clear', 'cloudy'],
  cloudy: ['cloudy', 'clear', 'rain'],
  rain:   ['rain', 'cloudy', 'storm'],
  storm:  ['storm', 'rain', 'cloudy'],
};

function hashWeather(seed: number): number {
  let h = (seed * 1274126177) & 0xffffffff;
  h = ((h ^ (h >> 16)) * 1911520717) & 0xffffffff;
  return (h & 0x7fffffff) / 0x7fffffff;
}

export function createWeatherState(): Record<ContinentId, ContinentWeather> {
  return {
    auredia:  { state: 'clear', duration: 8 },
    trivalen: { state: 'cloudy', duration: 5 },
    uloren:   { state: 'rain', duration: 6 },
  };
}

export function tickWeather(
  weather: Record<ContinentId, ContinentWeather>,
  worldTime: number,
): Record<ContinentId, ContinentWeather> {
  const next: Record<ContinentId, ContinentWeather> = {} as any;
  for (const id of ['auredia', 'trivalen', 'uloren'] as ContinentId[]) {
    const cur = weather[id];
    if (cur.duration > 1) {
      next[id] = { state: cur.state, duration: cur.duration - 1 };
    } else {
      const options = TRANSITION[cur.state];
      const pick = options[Math.floor(hashWeather(worldTime * 31 + id.charCodeAt(0)) * options.length)];
      const dur = 4 + Math.floor(hashWeather(worldTime * 53 + id.charCodeAt(2)) * 8);
      next[id] = { state: pick, duration: dur };
    }
  }
  return next;
}

export function getWeatherSpeedMultiplier(state: WeatherState): number {
  switch (state) {
    case 'clear':  return 1.0;
    case 'cloudy': return 1.0;
    case 'rain':   return 0.85;
    case 'storm':  return 0.65;
  }
}

export function getWeatherIcon(state: WeatherState): string {
  switch (state) {
    case 'clear':  return '☀️';
    case 'cloudy': return '☁️';
    case 'rain':   return '🌧️';
    case 'storm':  return '⛈️';
  }
}
