# HTML Explorer Game — agent context

This document helps coding agents orient quickly. **Do not put API keys or secrets here.**

## What it is

Browser-based top-down 2D open-world RPG prototype: **React 18 + TypeScript + Vite 5**, **Zustand** store, **HTML5 Canvas** for the overworld and dungeon view, **Tailwind** + shadcn/Radix UI, **Framer Motion** for panels.

## World scale

- **10,000×10,000** logical tiles; rendering uses **lazy chunks** (`CHUNK_SIZE = 64`) from [`src/lib/mapGenerator.ts`](src/lib/mapGenerator.ts): `getChunkData`, `getTileAt`, `ensureRoads` (exported road set).
- Three continents: `getContinentAt(x, y)` → `auredia` | `trivalen` | `uloren`.
- **Named settlements** live in `SETTLEMENTS` / `LOCATION_COORDS` with `biomeRadius` driving biome stamp and **scaled** object placement in `generateChunkObjects` / `generateChunkEntities`.
- **Hamlets**: [`src/lib/hamlets.ts`](src/lib/hamlets.ts) — road-adjacent deterministic sites, merged into discovery via [`getExtendedLocationCoords()`](src/lib/hamlets.ts). [`isHamletId`](src/lib/hamlets.ts) distinguishes them from majors.

## State and loop

- [`src/lib/gameStore.ts`](src/lib/gameStore.ts): single source of truth — movement, combat, inventory, gold, quests, fog, housing, dialogue, tutorial, `minorNpcState`, etc.
- [`src/lib/worldTicker.ts`](src/lib/worldTicker.ts): `setInterval` advances `worldTime`, weather, hunger, markets, factions, bounty boards, enemy aggro, animal flee, **wildlife respawn** (`respawnWildlifeFarFrom`), resource spawns.
- **Save/load**: [`src/lib/saveSystem.ts`](src/lib/saveSystem.ts) serializes store slice + [`serializeEntities`](src/lib/worldEntities.ts) for spatial entities.

## Entities

[`src/lib/worldEntities.ts`](src/lib/worldEntities.ts): spatial hash of `WorldEntity` (`EntityKind` includes boats, caves, resources, animals, **`settlement_npc`**, **`hamlet_npc`**). `initWorldEntities()` runs on `startGame` — boats, horses, caves (random + **guaranteed** near mountain anchors), starter trees/rocks near Ashenford, **INITIAL_NPCS** as settlement NPCs, hamlet residents.

## Combat and items

[`src/lib/combatSystem.ts`](src/lib/combatSystem.ts): `playerAttack` / `getKillLoot` / aggro helpers. [`attackAction`](src/lib/gameStore.ts) applies loot and XP.

[`src/lib/items.ts`](src/lib/items.ts), [`recipes.ts`](src/lib/recipes.ts), [`craftingSystem.ts`](src/lib/craftingSystem.ts).

## Narrative events

[`src/lib/gameData.ts`](src/lib/gameData.ts): `generateEvents(location, season, tick, completedEvents)` — **stable event ids**; store filters so revisits do not repeat.

## UI map

- [`GameScreen.tsx`](src/components/game/GameScreen.tsx): routes `phase` (title / playing / sailing / dungeon / dead), mounts panels, **tutorial banner**.
- [`WorldMap.tsx`](src/components/game/WorldMap.tsx): canvas input, `interactEntity` / `useItem` / `attackAction`.
- [`TitleScreen.tsx`](src/components/game/TitleScreen.tsx): **world preview** canvas (not starfield).
- [`Minimap.tsx`](src/components/game/Minimap.tsx): terrain sample, roads, locations, hamlets, entity dots including **caves**.

## Gemini (optional)

[`src/lib/geminiNpc.ts`](src/lib/geminiNpc.ts): `VITE_GEMINI_API_KEY` from Vite env. Hamlet talk in [`interactEntity`](src/lib/gameStore.ts) may async-upgrade dialogue. Never commit keys; see [`.env.example`](../.env.example).

## Extension points

- New `EntityKind` → `worldEntities` + `interactEntity` / `WorldMap` draw + combat filters if needed.
- New locations → `SETTLEMENTS` + `LOCATIONS` + events in `gameData`.
- New overlays → `gameTypes.OverlayType` + `OverlayPanel` / `GameScreen`.
