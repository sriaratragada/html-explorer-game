# HTML Explorer Game

A browser-based top-down 2D open-world RPG prototype — built entirely in the browser with React, TypeScript, and HTML5 Canvas. The world breathes before the player takes their first step.

**Live:** [html-explorer-game.vercel.app](https://html-explorer-game.vercel.app)

---

## Design Vision

The world is already alive before the player takes their first step. Caravans move between cities, harvests succeed or fail, wars break out, merchants grow rich or go bankrupt — all without waiting for the player to trigger anything. The player is dropped into this living simulation and must find their place in it: building a reputation, mastering trade routes, forging alliances, or carving out infamy. Progress is measured not just in levels but in how well-known the player becomes across the world.

**Core pillars:**

- Simulation first — the world ticks forward independently; the player's actions are consequential ripples in an already-moving system
- Trade and economy as a first-class mechanic — buying low, selling high, controlling supply chains, or disrupting rivals
- Reputation as currency — every faction, city, and NPC remembers what the player has done; fame (or notoriety) opens and closes doors

---

## What's Been Built

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 with SWC |
| State management | Zustand |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Animation | Framer Motion |
| Rendering | HTML5 Canvas (chunk-baked, pannable, zoomable) |
| Testing | Vitest + Testing Library |

### Procedural World Generation

The overworld is a **2000×2000 tile grid** generated at startup via layered noise functions. Biomes placed across the map include: grassland, forest, desert, snow, mountain, water, sand, and swamp. A road network is procedurally drawn to connect all 11 settlements, and the world is populated with decorative world objects and ambient map entities. For performance, the map is split into chunks and each chunk is pre-baked to an offscreen canvas — only dirty chunks are redrawn.

### 11 Named Settlements

Eleven named locations are placed at fixed coordinates across the map: villages, towns, and fortresses each with distinct identities reflected in their events and NPCs. When the player enters within **30 tiles** of a new settlement, the game registers a discovery, advances the world tick/season, and may queue a location-specific narrative event.

### Branching Narrative Events

Location visits and world ticks can trigger scripted events presented as full-screen popups with typewriter text animation. Each event offers **2–4 numbered choices**, and many options are gated behind reputation thresholds. Choices produce concrete effects: reputation axes shift, faction standings change, NPC memories are updated, and the outcome is appended to the chronicle.

### Reputation System

Six reputation axes track the player's standing across different domains:

| Axis | What it reflects |
|---|---|
| Valor | Courage in combat and dangerous situations |
| Wisdom | Thoughtful, scholarly, or diplomatic decisions |
| Trade | Commercial acumen and mercantile reputation |
| Shadow | Deception, theft, and dealings in the underworld |
| Nature | Harmony with the wilderness and its creatures |
| Arcane | Engagement with magic and the mystical |

High or low scores on any axis gate dialogue options and shape how the world reacts to the player.

### Faction Standing

Six factions each maintain an independent disposition score toward the player. Choices in events shift these scores up or down. NPC records store per-character disposition and a memory list of past interactions — this history is factored into how NPCs respond in future encounters.

### Survival Mechanics

The player has **health** and **hunger** bars rendered in the HUD. Hunger decays with each world tick; when hunger hits zero it drains health instead. Food items consumed from the hotbar restore hunger. Reaching zero health triggers a death screen with an option to restart from the beginning.

### Six-Slot Hotbar

A persistent hotbar sits at the bottom of the screen with six item slots. The player selects the active slot with number keys and uses the item with a keybind. New games begin with a small set of starter items. Currently, food is the primary item type — eating restores hunger.

### Environment Actions

Standing on certain terrain types unlocks contextual actions in the HUD. Terrain-to-action mappings include foraging in forests, fishing on water tiles, hunting in grasslands, and mining near mountains. Each action has a cooldown and may yield item rewards placed into the hotbar.

### Seasonal Cycle

World time is tracked in ticks that accumulate as the player discovers new locations. Every four ticks a season advances through spring → summer → autumn → winter. The current season is displayed in the HUD and flavours periodic world-event blurbs that appear in the chronicle.

### Chronicle Log

Every significant event — location discoveries, narrative choices and their outcomes, world events — is appended to the chronicle. The log is viewable at any time via the player overlay and serves as a persistent record of the run.

### HUD and Overlays

- **HudBar** — health and hunger bars, current location name, season indicator, and environment action buttons
- **Player overlay** — all six reputation axes, faction standings, NPC relationship list, and run statistics
- **Chronicle overlay** — full scrollable log of past events and choices
- **Help overlay** — keyboard shortcut reference, toggled with `?`
- **Death overlay** — end-of-run summary with restart option

### Title Screen

A styled title screen greets the player on load. Starting a new game initialises the world (map generation, NPC setup, starter hotbar) and transitions into the game shell. Tutorial state is tracked in the store to support future onboarding flows.

### Canvas Rendering

`WorldMap.tsx` renders everything to a single HTML5 canvas: tile layers, road network, world objects, ambient entities, and the player token. The view pans to follow the player and supports zoom. Chunk baking means only changed regions are redrawn on each frame, keeping render cost proportional to what actually changed rather than the full 2000×2000 grid.

---

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

Other scripts:

```bash
npm run build      # production build
npm run preview    # preview production build
npm test           # run Vitest test suite
npm run lint       # ESLint
```

---

## Project Structure

```
src/
├── lib/
│   ├── gameStore.ts       # Zustand store: all game state, rules, movement, tick logic
│   ├── gameTypes.ts       # TypeScript interfaces for every game entity
│   ├── gameData.ts        # Locations, NPCs, scripted events, environment actions
│   ├── mapGenerator.ts    # Procedural terrain, road network, world objects
│   └── utils.ts           # Shared helpers
├── components/
│   └── game/
│       ├── GameScreen.tsx  # Top-level game shell, composes all sub-components
│       ├── WorldMap.tsx    # HTML5 Canvas rendering and keyboard/mouse input
│       ├── HudBar.tsx      # HUD vitals, location indicator, terrain actions
│       ├── Hotbar.tsx      # Six-slot item hotbar
│       ├── EventPopup.tsx  # Narrative event UI with typewriter and choices
│       ├── OverlayPanel.tsx# Player stats and chronicle overlays
│       ├── HelpPanel.tsx   # Keyboard shortcut help overlay
│       └── TitleScreen.tsx # Title screen and new-game flow
└── pages/
    └── Index.tsx           # Route root: switches between title and game phase
```

---

## To-do List

### Core Systems

- Real-time combat system with melee, ranged, and magic attack types
- Loot tables and item rarity tiers (common, uncommon, rare, legendary)
- Stealth mechanics — sneaking, pickpocketing, line-of-sight detection
- Mount system — horses, carts, and boats for faster overworld travel
- Inventory system with equipment slots, weapons, and armour
- Crafting system using gathered resources
- Skill trees for combat, stealth, diplomacy, and crafting
- Save/load system with multiple save slots
- Health bar, hunger, early game progression (expansion of current survival system)

### World and Settlements

- Villages, towns, cities, castles — tiered settlement types with distinct economies
- Continents and a larger map, with lore
- Dungeon and cave interiors — entering a cave switches the view to a Terraria-style 2D side-scrolling mode with procedurally generated tunnels, ore veins, and underground enemies; exiting returns to the top-down overworld
- Ruins and procedurally placed points of interest between settlements
- Day/night cycle affecting NPC behaviour and random events
- Weather system influencing travel and resource availability
- Ocean and river navigation with ship travel
- Biome-specific flora and fauna with seasonal variation

### NPCs and Simulation

- Dynamic spawning NPCs, proper progression — NPCs have their own schedules, jobs, and goals; they trade, travel, and react to world events independently of the player
- World Ticker — every game tick the world advances: harvests ripen, caravans depart, prices shift, wars escalate or end; the player joins a world mid-story, not at the start of one
- Autonomous NPC economies — merchants restock, farmers sell surplus, bandits raid trade roads; the player can observe, exploit, or disrupt these flows
- Dialogue trees for NPCs with branching choices — NPC responses reflect current reputation and past player actions
- NPC companion system — recruit allies who follow and fight alongside the player
- Disease and plague events that spread between settlements
- Migration patterns — NPCs relocate when war or famine strikes their home

### Economy and Politics

- Trade route system — discoverable routes between settlements with varying goods, tariffs, and dangers; controlling or monopolising a route yields recurring income and influence
- Economy simulation — prices shift based on supply and demand; shortages caused by world events (droughts, wars, blockades) ripple through the market in real time
- Reputation and fame system — a global notoriety score plus per-faction standing; deeds spread by word-of-mouth through NPC gossip and broadsheets, unlocking unique dialogue, prices, quests, and enemies
- Faction politics — factions compete for territory and resources on their own; the player can side with, undermine, or play factions against each other
- Building and siege mechanics for faction warfare
- Farming, trading, fighting and PvE
- If sellsword, picking up bounties and hunting down enemy

### Quests and Progression

- Quest log and multi-step quest chains
- Procedural quest generation driven by world-state changes
- Fishing mini-game with region-specific catches
- Player housing and base-building

### Endgame and Social

- Multiplayer or co-op exploration mode

### Quality of Life

- Auto-save on each tick or location change
- Keyboard shortcut cheatsheet / help overlay (toggle with `?`) *(partially done)*
- Pause menu with settings (volume, keybinds, UI scale)
- Tooltips on hover for all HUD icons and stat bars
- Persistent notifications / message log so missed events can be reviewed
- Confirmation prompt before dangerous or irreversible actions
- Colourblind-friendly palette option
- Responsive layout that works well on mobile and small screens
- Fast-travel between previously visited locations
- Adjustable game speed (slow / normal / fast tick rate)
- Visual indicators for active buffs, debuffs, and status effects
- Map markers — let the player pin notes on the world map
- Tutorial / onboarding sequence for new players
- Sound effects and ambient music tied to locations and seasons
- Minimap or fog-of-war exploration reveal
- Accessibility: screen-reader hints and keyboard-only navigation
- Undo last action / regret mechanic for critical story choices
- Localization / i18n framework for multi-language support
- Performance profiling dashboard (dev-only) for canvas rendering
