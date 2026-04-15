

# Massive 2D Pixelated World Map

## Overview
Replace the current text-based travel system with a large, interactive 2D pixel-art-style world map rendered on HTML5 Canvas. The player token moves across a procedurally generated terrain map featuring all 11 locations as interactive points, connected by visible paths. Styled to evoke the openfront.io aesthetic — grid-based, chunky pixels, elegant icons.

## Architecture

```text
┌──────────────────────────────────────────┐
│  Index.tsx                               │
│  ┌────────┐  ┌─────────────────────────┐ │
│  │ Player │  │  GameScreen (tabbed)    │ │
│  │ Panel  │  │  ┌───────┬───────────┐  │ │
│  │        │  │  │ Map   │ Narrative  │  │ │
│  │        │  │  │ View  │ View       │  │ │
│  │        │  │  │(canvas│(existing   │  │ │
│  │        │  │  │ map)  │ events)    │  │ │
│  │        │  │  └───────┴───────────┘  │ │
│  └────────┘  └─────────────────────────┘ │
└──────────────────────────────────────────┘
```

## What Gets Built

### 1. Procedural Map Generator (`src/lib/mapGenerator.ts`)
- Generates a ~200x150 tile grid using simplex noise (we'll use a lightweight implementation)
- Biome tiles: water, grass, forest, mountain, desert, swamp, ruins, snow — each mapped to a pixel color palette
- Locations placed at fixed coordinates with surrounding biome matching their data (e.g. Ironhold on mountains, Saltmoor on coast)
- Road/path tiles connecting linked locations
- Deterministic seed so map is consistent per game

### 2. World Map Component (`src/components/game/WorldMap.tsx`)
- Full HTML5 Canvas renderer, no external library needed
- Renders the tile grid pixel-by-pixel at a configurable scale (4-6px per tile)
- Camera panning (click-drag) and zoom (scroll wheel)
- Camera auto-centers on player location
- Player token rendered as an animated marker
- Location icons rendered as larger styled markers with name labels
- Fog of war: unvisited areas dimmed/desaturated, visited areas bright
- Click a connected location to travel (replaces the old travel buttons)
- Hover tooltips showing location name and biome
- Animated player movement along paths when traveling

### 3. Updated Game Layout
- The main game area splits into two views: **Map** (default) and **Narrative** (when an event is active)
- When an event triggers, the narrative panel slides in over or beside the map
- Travel buttons in GameScreen removed — travel is now map-click only
- Season changes reflected on map (color palette shifts: green in summer, orange in harvest, white/blue in dark, mixed in thaw)

### 4. Location Data Enhancement (`gameTypes.ts` + `gameData.ts`)
- Add `mapX` and `mapY` coordinates to each Location
- Add biome-to-tile-color mapping constants

### 5. Store Updates (`gameStore.ts`)
- `travel()` now triggers a movement animation flag
- Add `isMoving` state to prevent actions during travel animation

## Technical Details

- **No new dependencies** — canvas rendering + a simple noise function (embedded ~50 lines)
- Pixel art palette: 8-12 carefully chosen colors per biome, consistent with the game's dark gold/parchment theme
- Map size: ~200x150 tiles at 5px each = 1000x750px base canvas, scrollable/zoomable
- Performance: only render visible tiles based on camera viewport
- Location markers use emoji or custom pixel-art icons drawn on canvas

## Files Changed
| File | Action |
|------|--------|
| `src/lib/mapGenerator.ts` | **New** — noise function, terrain gen, biome colors |
| `src/components/game/WorldMap.tsx` | **New** — canvas map component |
| `src/lib/gameData.ts` | **Edit** — add map coordinates to locations |
| `src/lib/gameTypes.ts` | **Edit** — add mapX/mapY to Location type |
| `src/lib/gameStore.ts` | **Edit** — add isMoving state, update travel |
| `src/components/game/GameScreen.tsx` | **Edit** — integrate map view, remove travel buttons |
| `src/pages/Index.tsx` | **Edit** — adjust layout for map-first design |
| `src/index.css` | **Edit** — add canvas/map utility styles |

