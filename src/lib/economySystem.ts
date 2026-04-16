import { ITEMS } from './items';
import { LOCATION_COORDS, getSettlementMeta } from './mapGenerator';

export interface MarketItem {
  itemId: string;
  stock: number;
  basePrice: number;
  priceMultiplier: number;
}

export interface Market {
  locationId: string;
  items: MarketItem[];
}

const TRADE_GOODS = ['salt', 'spice', 'silk', 'iron_ingot', 'wood', 'stone', 'leather', 'cloth', 'herb', 'bread', 'cooked_meat', 'fish'];

function getBaseStock(locType: string, itemId: string): number {
  const base = Math.floor(Math.random() * 10) + 5;
  if (locType === 'port' && ['salt', 'fish', 'silk'].includes(itemId)) return base * 3;
  if (locType === 'fortress' && ['iron_ingot', 'leather'].includes(itemId)) return base * 2;
  if (locType === 'village' && ['bread', 'cooked_meat', 'wood'].includes(itemId)) return base * 2;
  return base;
}

export function createMarkets(): Record<string, Market> {
  const markets: Record<string, Market> = {};
  for (const [locId] of Object.entries(LOCATION_COORDS)) {
    const meta = getSettlementMeta(locId);
    if (!meta) continue;
    if (['wilderness', 'ruins'].includes(meta.type)) continue;

    const items: MarketItem[] = TRADE_GOODS.map(itemId => {
      const def = ITEMS[itemId];
      return {
        itemId,
        stock: getBaseStock(meta.type, itemId),
        basePrice: def?.value ?? 5,
        priceMultiplier: 0.8 + Math.random() * 0.4,
      };
    });
    markets[locId] = { locationId: locId, items };
  }
  return markets;
}

export function getPrice(item: MarketItem): number {
  // Price scales inversely with stock
  const scarcityMul = item.stock < 3 ? 2.0 : item.stock < 8 ? 1.3 : item.stock > 20 ? 0.7 : 1.0;
  return Math.max(1, Math.round(item.basePrice * item.priceMultiplier * scarcityMul));
}

export function getSellPrice(item: MarketItem): number {
  return Math.max(1, Math.floor(getPrice(item) * 0.6));
}

export function tickMarket(market: Market): Market {
  return {
    ...market,
    items: market.items.map(item => ({
      ...item,
      // Restock slowly
      stock: Math.min(30, item.stock + (Math.random() < 0.3 ? 1 : 0)),
      // Price drift
      priceMultiplier: Math.max(0.5, Math.min(2.0, item.priceMultiplier + (Math.random() - 0.5) * 0.05)),
    })),
  };
}

export function buyItem(market: Market, itemId: string, qty: number): { market: Market; cost: number } | null {
  const item = market.items.find(i => i.itemId === itemId);
  if (!item || item.stock < qty) return null;
  const cost = getPrice(item) * qty;
  return {
    market: {
      ...market,
      items: market.items.map(i => i.itemId === itemId ? { ...i, stock: i.stock - qty } : i),
    },
    cost,
  };
}

export function sellItem(market: Market, itemId: string, qty: number): { market: Market; revenue: number } {
  const existing = market.items.find(i => i.itemId === itemId);
  const basePrice = ITEMS[itemId]?.value ?? 5;
  const revenue = existing ? getSellPrice(existing) * qty : Math.floor(basePrice * 0.5) * qty;
  return {
    market: {
      ...market,
      items: existing
        ? market.items.map(i => i.itemId === itemId ? { ...i, stock: i.stock + qty } : i)
        : [...market.items, { itemId, stock: qty, basePrice, priceMultiplier: 1.0 }],
    },
    revenue,
  };
}
