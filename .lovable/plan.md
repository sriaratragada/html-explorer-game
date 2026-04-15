# Full-Screen Cinematic Map Experience

## Overview

Transform the game from a split-panel layout into a **full-screen immersive map** (800x800 tile grid at 5px = 4000x4000 virtual pixels). The map IS the game — all UI overlays float on top. Player navigates with WASD/arrow keys. Events, stats, and info appear as elegant bottom-bar popups and hotkey-triggered panels.

## Architecture

```text
┌─────────────────────────────────────────────┐
│  Full-screen Canvas Map (800x800 tiles)     │
│                                             │
│  [C] Chronicle  [I] Inventory   [M] Menu    │  ← top-right hotkey hints
│                                             │
│         ● nearby landmark indicators        │
│              with distance/direction         │
│                                             │
│  ┌─ Player Token (always centered) ────┐    │
│  │        WASD / Arrow keys to move    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │ Bottom HUD Bar                          ││
│  │ Season | Location | Rep icons | [P]anel ││
│  └─────────────────────────────────────────┘│
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │ Event Popup (slides up from bottom)     ││
│  │ "A merchant approaches..." [1] [2] [3] ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

## What Changes

### 1. Map Generator — Scale to 4000x4000

- `MAP_W = 800`, `MAP_H = 800`, keep `TILE_SIZE = 1` (4000x4000px world)
- Spread location coordinates across the larger map
- Add more biome variety: rivers (linear water trails), scattered ruins, clearings
- Pre-generate once on game start, cache the result

### 2. New Full-Screen WorldMap Component

- **Camera follows player** — player token always at screen center
- **WASD / Arrow key movement** — player moves tile-by-tile (with smooth interpolation)
- **Nearby landmark indicators** — compass-style arrows at screen edges pointing to off-screen locations with distance labels
- **Location proximity triggers** — when player walks within ~10 tiles of a location, an event/interaction prompt appears
- **Scroll wheel zoom** still works (0.5x–3x)
- No more click-to-travel — player physically walks there

### 3. Tutorial / Cinematic Opening

- On game start, a scripted sequence plays:
  1. Camera pans across the world showing key landmarks
  2. Fades to player spawning in Ashenford
  3. Sequential tutorial popups teach controls: "Use WASD to move", "Press [I] for info", "Approach landmarks to interact"
  4. First event triggers automatically — offers choices spanning all 6 reputation paths
- Tutorial events designed to showcase conquest, trade, craft, diplomacy, exploration, and arcane options

### 4. Bottom HUD Bar (replaces sidebar)

- Slim persistent bar: season icon, location name (if near one), miniature rep icons, tick counter
- Buttons: `[P]` Player panel (slides up as overlay), `[C]` Chronicle, `[M]` Map legend
- Keyboard shortcuts: P, C, M keys toggle panels

### 5. Event Popup System (classic RPG style)

- Events slide up from bottom as dark translucent panels
- Show narrative text with typewriter effect
- Choices numbered [1] [2] [3] — clickable or press number keys
- Results shown as brief toast-style notification then auto-dismiss
- Locked choices shown grayed with requirement text

### 6. Overlay Panels

- **Player Panel**: full-screen dark overlay with rep bars, faction standings, title — press P or click button
- **Chronicle**: same overlay treatment — press C
- All dismiss with Escape

### 7. Environment Actions

- When near specific terrain (not just locations), offer contextual actions:
  - Forest: "Forage for herbs" (craft rep), "Hunt game" (conquest rep)
  - Ruins: "Search for artifacts" (arcane rep), "Map the area" (exploration rep)
  - Water: "Fish" (trade rep), "Study the currents" (exploration rep)
  - Roads: "Set up camp and rest" (diplomacy — attract travelers)
- These appear as subtle prompts in the bottom HUD

## Files Changed


| File                                       | Action                                                                                                           |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `src/lib/mapGenerator.ts`                  | **Rewrite** — 4000x4000 grid, spread coordinates, add rivers/details                                             |
| `src/components/game/WorldMap.tsx`         | **Rewrite** — full-screen, WASD movement, landmark indicators, proximity triggers                                |
| `src/components/game/GameScreen.tsx`       | **Rewrite** — becomes thin wrapper, just renders WorldMap + overlay system                                       |
| `src/components/game/EventPopup.tsx`       | **New** — bottom-sliding event/choice panel with typewriter text                                                 |
| `src/components/game/HudBar.tsx`           | **New** — bottom persistent HUD with hotkeys                                                                     |
| `src/components/game/OverlayPanel.tsx`     | **New** — fullscreen overlay for Player/Chronicle panels                                                         |
| `src/components/game/TutorialSequence.tsx` | **New** — cinematic intro + tutorial popups                                                                      |
| `src/lib/gameStore.ts`                     | **Edit** — add player position (x,y), movement actions, proximity detection, environment actions, tutorial state |
| `src/lib/gameData.ts`                      | **Edit** — update coordinates for 4000x4000, add environment action definitions, tutorial events                 |
| `src/lib/gameTypes.ts`                     | **Edit** — add playerX/Y, tutorialStep, environment action types                                                 |
| `src/pages/Index.tsx`                      | **Edit** — remove sidebar layout, full-screen map-first                                                          |
| `src/index.css`                            | **Edit** — add HUD/overlay styles                                                                                |
