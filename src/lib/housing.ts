export interface FurniturePlacement {
  itemId: string;
  gridX: number;
  gridY: number;
}

export interface PlayerPlot {
  locationId: string;
  gridSize: number; // 16×16
  furniture: FurniturePlacement[];
  purchased: boolean;
}

export interface Housing {
  plots: Record<string, PlayerPlot>;
}

export function createHousing(): Housing {
  return {
    plots: {
      highmarch: { locationId: 'highmarch', gridSize: 16, furniture: [], purchased: false },
      vell_harbor: { locationId: 'vell_harbor', gridSize: 16, furniture: [], purchased: false },
      korrath_citadel: { locationId: 'korrath_citadel', gridSize: 16, furniture: [], purchased: false },
    },
  };
}

export function purchasePlot(housing: Housing, locationId: string): Housing {
  const plot = housing.plots[locationId];
  if (!plot || plot.purchased) return housing;
  return {
    ...housing,
    plots: {
      ...housing.plots,
      [locationId]: { ...plot, purchased: true },
    },
  };
}

export function placeFurniture(housing: Housing, locationId: string, itemId: string, gridX: number, gridY: number): Housing {
  const plot = housing.plots[locationId];
  if (!plot || !plot.purchased) return housing;
  if (gridX < 0 || gridX >= plot.gridSize || gridY < 0 || gridY >= plot.gridSize) return housing;
  // Check collision
  if (plot.furniture.some(f => f.gridX === gridX && f.gridY === gridY)) return housing;
  return {
    ...housing,
    plots: {
      ...housing.plots,
      [locationId]: {
        ...plot,
        furniture: [...plot.furniture, { itemId, gridX, gridY }],
      },
    },
  };
}

export function removeFurniture(housing: Housing, locationId: string, gridX: number, gridY: number): Housing {
  const plot = housing.plots[locationId];
  if (!plot) return housing;
  return {
    ...housing,
    plots: {
      ...housing.plots,
      [locationId]: {
        ...plot,
        furniture: plot.furniture.filter(f => !(f.gridX === gridX && f.gridY === gridY)),
      },
    },
  };
}

export const PLOT_PRICES: Record<string, number> = {
  highmarch: 500,
  vell_harbor: 400,
  korrath_citadel: 600,
};
