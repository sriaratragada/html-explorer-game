import { Location, Npc, GameEvent, Season, EnvironmentAction } from './gameTypes';

export const FOOD_VALUES: Record<string, number> = {
  trail_ration: 25,
  berries:      10,
  raw_meat:      8,
  cooked_meat:  20,
  fish:         15,
  bread:        20,
};

export const SEASON_NAMES: Record<Season, string> = {
  thaw: 'The Thaw', summer: 'High Summer', harvest: 'The Harvest', dark: 'The Long Dark',
};

export const SEASON_ICONS: Record<Season, string> = {
  thaw: '🌱', summer: '☀️', harvest: '🍂', dark: '❄️',
};

export const REP_LABELS: Record<string, { label: string; color: string }> = {
  conquest: { label: 'Conquest', color: 'bg-rep-conquest' },
  trade: { label: 'Trade', color: 'bg-rep-trade' },
  craft: { label: 'Craft', color: 'bg-rep-craft' },
  diplomacy: { label: 'Diplomacy', color: 'bg-rep-diplomacy' },
  exploration: { label: 'Exploration', color: 'bg-rep-exploration' },
  arcane: { label: 'Arcane', color: 'bg-rep-arcane' },
};

export const FACTION_INFO: Record<string, { name: string; motto: string; icon: string; colorClass: string }> = {
  amber: { name: 'The Amber Compact', motto: 'What is owed is owed.', icon: '⚖️', colorClass: 'text-faction-amber' },
  iron: { name: 'The Iron Compact', motto: 'Order is won, never given.', icon: '⚔️', colorClass: 'text-faction-iron' },
  green: { name: 'The Greenwarden Covenant', motto: 'The land remembers.', icon: '🌿', colorClass: 'text-faction-green' },
  scholar: { name: 'The Remnant Scholarium', motto: 'What was known, will be known again.', icon: '🔮', colorClass: 'text-faction-scholar' },
  ashen: { name: 'The Ashen Brotherhood', motto: "Chaos is not an enemy. It's a client.", icon: '🗡️', colorClass: 'text-faction-ashen' },
  tide: { name: 'The Tidewarden Fleet', motto: 'Every sea is ours.', icon: '🌊', colorClass: 'text-faction-tide' },
};

export const ENVIRONMENT_ACTIONS: EnvironmentAction[] = [
  { id: 'forage', label: 'Forage for herbs', icon: '🌿', terrain: 'forest', repEffects: { craft: 3 }, resultText: 'You find useful herbs among the undergrowth. Your knowledge of plants grows.', chronicleText: 'The traveler foraged for herbs in the forest.', cooldownTicks: 3, itemReward: { id: 'berries', name: 'Wild Berries', icon: '🫐', quantity: 2, type: 'food', description: 'Fresh-picked. Sweet and tart.' } },
  { id: 'forage_dense', label: 'Forage rare plants', icon: '🍄', terrain: 'dense_forest', repEffects: { craft: 5, arcane: 2 }, resultText: 'Deep in the old growth, you find mushrooms that glow faintly. Alchemists would pay well.', chronicleText: 'The traveler found rare fungi in the deep forest.', cooldownTicks: 5 },
  { id: 'hunt', label: 'Hunt game', icon: '🏹', terrain: 'forest', repEffects: { conquest: 3, exploration: 2 }, resultText: 'A clean kill. The forest provides for those who know how to take.', chronicleText: 'The traveler hunted in the forest.', cooldownTicks: 3, itemReward: { id: 'raw_meat', name: 'Raw Meat', icon: '🥩', quantity: 1, type: 'food', description: 'Needs cooking, but edible raw in a pinch.' } },
  { id: 'search_ruins', label: 'Search for artifacts', icon: '🔮', terrain: 'ruins', repEffects: { arcane: 5, exploration: 3 }, resultText: 'Among the rubble, a fragment of old text. The symbols seem to shift when you look away.', chronicleText: 'The traveler searched the ruins and found remnants of the old world.', cooldownTicks: 4 },
  { id: 'map_ruins', label: 'Map the area', icon: '🗺️', terrain: 'ruins', repEffects: { exploration: 5 }, resultText: 'You carefully sketch the layout. Every ruin tells a story of what stood before.', chronicleText: 'The traveler mapped a ruin site.', cooldownTicks: 4 },
  { id: 'fish', label: 'Fish', icon: '🎣', terrain: 'river', repEffects: { trade: 3, craft: 1 }, resultText: 'The river yields its bounty. Fresh fish can be traded or eaten.', chronicleText: 'The traveler fished by the river.', cooldownTicks: 3, itemReward: { id: 'fish', name: 'Fresh Fish', icon: '🐟', quantity: 2, type: 'food', description: 'River catch. Best eaten soon.' } },
  { id: 'study_water', label: 'Study the currents', icon: '🌊', terrain: 'river', repEffects: { exploration: 4 }, resultText: 'The water flows in patterns that reveal the shape of the land upstream.', chronicleText: 'The traveler studied river currents.', cooldownTicks: 4 },
  { id: 'camp_road', label: 'Set up camp', icon: '🏕️', terrain: 'road', repEffects: { diplomacy: 3 }, resultText: 'A traveler passes and shares news over your fire. Connections form on the road.', chronicleText: 'The traveler camped by the road and met fellow wanderers.', cooldownTicks: 3 },
  { id: 'climb_hill', label: 'Climb for a vantage point', icon: '⛰️', terrain: 'hill', repEffects: { exploration: 4, conquest: 1 }, resultText: 'From the hilltop, you can see for miles. Landmarks revealed.', chronicleText: 'The traveler climbed a hill to survey the land.', cooldownTicks: 4 },
  { id: 'meditate_snow', label: 'Meditate in the cold', icon: '❄️', terrain: 'snow', repEffects: { arcane: 4, diplomacy: 2 }, resultText: 'The silence of the snow is absolute. In it, you hear something beneath. A whisper of the old language.', chronicleText: 'The traveler meditated in the snow and heard the old whispers.', cooldownTicks: 5 },
  { id: 'gather_sand', label: 'Collect trade goods', icon: '💎', terrain: 'sand', repEffects: { trade: 4 }, resultText: 'Sea glass, shells, salt crystals — the coast provides for those who know what merchants want.', chronicleText: 'The traveler gathered coastal trade goods.', cooldownTicks: 3 },
  { id: 'explore_swamp', label: 'Navigate the marshes', icon: '🐊', terrain: 'swamp', repEffects: { exploration: 5, conquest: 2 }, resultText: 'The marsh tries to swallow you. You push through. Few would dare — that makes you memorable.', chronicleText: 'The traveler braved the marshlands.', cooldownTicks: 4 },
  { id: 'rest_clearing', label: 'Rest in the clearing', icon: '🌤️', terrain: 'clearing', repEffects: { diplomacy: 2, craft: 2 }, resultText: 'A peaceful moment. You sharpen your tools and gather your thoughts.', chronicleText: 'The traveler rested in a forest clearing.', cooldownTicks: 3 },
];

export const LOCATIONS: Location[] = [
  { id: 'ashenford', name: 'Ashenford', type: 'village', description: 'A farming village on the fertile plains. Smoke rises from modest chimneys.', biome: 'Fertile Plains', npcs: ['mira', 'aldric'], connections: ['thornwick', 'saltmoor', 'crossroads'], icon: '🏘️' },
  { id: 'saltmoor', name: 'Saltmoor', type: 'city', description: "A coastal trade city where salt air mingles with the smell of coin.", biome: 'Coastal Region', npcs: ['guildmaster_renn', 'captain_voss'], connections: ['ashenford', 'graygate', 'ironhold'], icon: '🏙️' },
  { id: 'ironhold', name: 'Ironhold', type: 'fortress', description: "A mountain fortress carved from living rock. The Iron Compact's stronghold.", biome: 'Mountain Range', npcs: ['lord_vane', 'sergeant_kael'], connections: ['saltmoor', 'coldpeak', 'crossroads'], icon: '🏰' },
  { id: 'thornwick', name: 'Thornwick', type: 'village', description: 'Deep forest village where the Greenwarden Covenant holds quiet sway.', biome: 'Dense Forest', npcs: ['elder_saya', 'fen_the_hunter'], connections: ['ashenford', 'marshend', 'ruins_of_aether'], icon: '🌲' },
  { id: 'graygate', name: 'Graygate', type: 'city', description: 'A crossroads city where every faction maintains a presence. The neutral ground.', biome: 'Fertile Plains', npcs: ['broker_lysara', 'watchman_pike'], connections: ['saltmoor', 'dustfall', 'crossroads'], icon: '🏛️' },
  { id: 'dustfall', name: 'Dustfall', type: 'ruins', description: 'The largest ruin complex in Aethermoor. Something hums beneath the stone.', biome: 'Ancient Ruins', npcs: ['archivist_nol', 'the_whisperer'], connections: ['graygate', 'badlands'], icon: '🗿' },
  { id: 'crossroads', name: 'The Crossroads Inn', type: 'village', description: 'A sprawling inn at the junction of three trade roads.', biome: 'Fertile Plains', npcs: ['innkeeper_bryn'], connections: ['ashenford', 'ironhold', 'graygate'], icon: '🍺' },
  { id: 'marshend', name: 'Marshend', type: 'village', description: 'A village built on stilts above the marshwater. The Ashen Brotherhood operates here.', biome: 'Dense Forest', npcs: ['shadow_maren'], connections: ['thornwick', 'badlands'], icon: '🌿' },
  { id: 'badlands', name: 'The Badlands', type: 'wilderness', description: 'Cracked earth stretches to the horizon. Something worse moves in the deep ravines.', biome: 'Badlands', npcs: [], connections: ['dustfall', 'marshend'], icon: '💀' },
  { id: 'coldpeak', name: 'Coldpeak', type: 'fortress', description: 'The highest settlement in Aethermoor. The Scholarium maintains an observatory here.', biome: 'Mountain Range', npcs: ['astronomer_vael'], connections: ['ironhold'], icon: '⛰️' },
  { id: 'ruins_of_aether', name: 'Ruins of the Aetherik Temple', type: 'ruins', description: 'The central temple of the old empire. The Arcanist path begins here.', biome: 'Ancient Ruins', npcs: [], connections: ['thornwick'], icon: '✨' },
];

export const INITIAL_NPCS: Npc[] = [
  { id: 'mira', name: 'Mira', title: 'Grain Farmer', location: 'ashenford', faction: 'green', personality: 'Practical, cautious, values loyalty above all.', memories: [], disposition: 10 },
  { id: 'aldric', name: 'Aldric', title: 'Farm Hand', location: 'ashenford', faction: 'none', personality: 'Eager, young, desperate to prove himself.', memories: [], disposition: 20 },
  { id: 'guildmaster_renn', name: 'Guildmaster Renn', title: 'Master of the Saltmoor Trade Guild', location: 'saltmoor', faction: 'amber', personality: 'Shrewd, calculating, respects competence over morality.', memories: [], disposition: 0 },
  { id: 'captain_voss', name: 'Captain Voss', title: 'Tidewarden Harbor Captain', location: 'saltmoor', faction: 'tide', personality: 'Blunt, weather-beaten, judges by actions not words.', memories: [], disposition: 5 },
  { id: 'lord_vane', name: 'Lord Vane', title: 'Commander of the Iron Compact', location: 'ironhold', faction: 'iron', personality: 'Cold, strategic, believes weakness invites destruction.', memories: [], disposition: -10 },
  { id: 'sergeant_kael', name: 'Sergeant Kael', title: 'Gate Commander', location: 'ironhold', faction: 'iron', personality: "Loyal, rigid, secretly doubts the Compact's methods.", memories: [], disposition: 0 },
  { id: 'elder_saya', name: 'Elder Saya', title: 'Greenwarden Council Leader', location: 'thornwick', faction: 'green', personality: 'Patient, wise, remembers the old songs.', memories: [], disposition: 15 },
  { id: 'fen_the_hunter', name: 'Fen', title: 'Master Hunter', location: 'thornwick', faction: 'green', personality: 'Silent, observant, speaks only when necessary.', memories: [], disposition: 0 },
  { id: 'broker_lysara', name: 'Lysara', title: 'Information Broker', location: 'graygate', faction: 'none', personality: 'Charming, dangerous, remembers everything.', memories: [], disposition: 0 },
  { id: 'watchman_pike', name: 'Watchman Pike', title: 'City Watch Captain', location: 'graygate', faction: 'none', personality: 'Tired, just, stretched too thin.', memories: [], disposition: 5 },
  { id: 'archivist_nol', name: 'Archivist Nol', title: 'Lead Researcher, Dustfall Excavation', location: 'dustfall', faction: 'scholar', personality: "Obsessive, brilliant, frightened by what they've found.", memories: [], disposition: 0 },
  { id: 'the_whisperer', name: 'The Whisperer', title: '???', location: 'dustfall', faction: 'none', personality: 'Unknown.', memories: [], disposition: -20 },
  { id: 'innkeeper_bryn', name: 'Bryn', title: 'Innkeeper of the Crossroads', location: 'crossroads', faction: 'none', personality: 'Jovial, shrewd, collects stories like currency.', memories: [], disposition: 15 },
  { id: 'shadow_maren', name: 'Maren', title: 'Fence & Fixer', location: 'marshend', faction: 'ashen', personality: 'Quick-witted, amoral, loyal only to coin.', memories: [], disposition: -5 },
  { id: 'astronomer_vael', name: 'Astronomer Vael', title: 'Star-Reader of Coldpeak', location: 'coldpeak', faction: 'scholar', personality: 'Mystical, distant, speaks in metaphors that turn out to be literal.', memories: [], disposition: 0 },
];

export function generateEvents(locationId: string, season: Season, tick: number): GameEvent[] {
  const events: GameEvent[] = [];
  const loc = LOCATIONS.find(l => l.id === locationId);
  if (!loc) return events;

  const locationEvents: Record<string, GameEvent[]> = {
    ashenford: [
      {
        id: `ashenford_bandits_${tick}`, title: 'Bandit Threat', location: 'ashenford',
        narrative: 'Mira meets you at the village edge, worry carved into her face. "Bandits. On the north road. They hit a grain shipment yesterday."',
        choices: [
          { id: 'hunt_bandits', text: '⚔️ Hunt the bandits down', repEffects: { conquest: 8, exploration: 3 }, factionEffects: { green: 10, iron: 5 }, npcEffects: [{ npcId: 'mira', disposition: 20, memory: 'Defended Ashenford from bandits' }], resultText: 'You track the bandits and scatter them. Ashenford breathes easier tonight.', chronicleText: 'The traveler cleared the bandit camp threatening Ashenford.' },
          { id: 'negotiate_bandits', text: '🕸️ Find the bandits. Negotiate.', repEffects: { diplomacy: 10, trade: 3 }, factionEffects: { ashen: 8, green: 3 }, npcEffects: [{ npcId: 'mira', disposition: 5, memory: 'Negotiated with bandits' }], resultText: 'The bandit leader was a farmer once. You broker a deal: they raid the trade road, not the farms.', chronicleText: 'The traveler negotiated with the north road bandits.' },
          { id: 'trade_grain', text: '⚖️ Buy Mira\'s grain at premium', repEffects: { trade: 8, craft: 2 }, factionEffects: { green: 5, amber: 3 }, npcEffects: [{ npcId: 'mira', disposition: 15, memory: 'Bought grain at premium' }], resultText: 'You buy her harvest at double rate. It won\'t solve the bandits, but it solves Mira\'s problem.', chronicleText: 'The traveler purchased grain at premium during the bandit crisis.' },
          { id: 'ignore_bandits', text: '👤 Not your problem.', repEffects: { exploration: 2 }, npcEffects: [{ npcId: 'mira', disposition: -15, memory: 'Ignored our plea for help' }], resultText: 'Mira watches you leave. She says nothing. She remembers.', chronicleText: 'The traveler passed through Ashenford and left its people to their fate.' },
        ],
      },
      {
        id: `ashenford_harvest_${tick}`, title: 'Harvest Time', location: 'ashenford',
        narrative: 'The fields glow gold with ripe wheat. Aldric wipes sweat. "We need hands. The harvest won\'t wait."',
        choices: [
          { id: 'help_harvest', text: '🌾 Roll up your sleeves', repEffects: { craft: 10, diplomacy: 3 }, factionEffects: { green: 8 }, npcEffects: [{ npcId: 'aldric', disposition: 15, memory: 'Helped with the harvest' }, { npcId: 'mira', disposition: 10, memory: 'Worked the fields alongside us' }], resultText: 'Three days of labor. Your hands blister, then harden. The villagers begin to know you.', chronicleText: 'The traveler labored in Ashenford\'s fields during the harvest.' },
          { id: 'organize_workers', text: '🕸️ Organize efficient labor', repEffects: { diplomacy: 8, craft: 5, trade: 3 }, factionEffects: { green: 5, amber: 3 }, npcEffects: [{ npcId: 'aldric', disposition: 10, memory: 'Reorganized the harvest' }], resultText: 'You restructure harvesting into shifts. Yield increases by a third.', chronicleText: 'The traveler reformed Ashenford\'s harvest methods.' },
        ],
      },
    ],
    saltmoor: [
      {
        id: `saltmoor_guild_${tick}`, title: 'The Guild\'s Proposal', location: 'saltmoor',
        narrative: 'Guildmaster Renn studies you over steepled fingers. "The Guild is offering you a choice."',
        choices: [
          { id: 'join_guild', text: '⚖️ Accept Guild membership', repEffects: { trade: 12, diplomacy: 5 }, factionEffects: { amber: 15, iron: -5 }, npcEffects: [{ npcId: 'guildmaster_renn', disposition: 20, memory: 'Joined the Trade Guild' }], resultText: '"Welcome to the Amber Compact\'s greatest asset."', chronicleText: 'The traveler joined the Saltmoor Trade Guild.' },
          { id: 'counter_offer', text: '🕸️ Counter: percentage of port fees', repEffects: { trade: 8, diplomacy: 8 }, requiresRep: { trade: 20 }, factionEffects: { amber: 5 }, npcEffects: [{ npcId: 'guildmaster_renn', disposition: 10, memory: 'Negotiated aggressively' }], resultText: '"2% of the eastern dock fees. Don\'t make me regret this."', chronicleText: 'The traveler negotiated port revenue with the Trade Guild.' },
          { id: 'refuse_guild', text: '⚔️ "I don\'t answer to guilds."', repEffects: { conquest: 5 }, factionEffects: { amber: -10, ashen: 5 }, npcEffects: [{ npcId: 'guildmaster_renn', disposition: -20, memory: 'Refused the Guild' }], resultText: '"Then you\'ll find the trade routes... less hospitable."', chronicleText: 'The traveler refused the Saltmoor Trade Guild.' },
        ],
      },
    ],
    ironhold: [
      {
        id: `ironhold_trial_${tick}`, title: 'The Iron Trial', location: 'ironhold',
        narrative: 'Lord Vane regards you from an iron throne. "Everyone who enters Ironhold must prove their worth."',
        choices: [
          { id: 'accept_trial', text: '⚔️ Accept the combat trial', repEffects: { conquest: 12 }, factionEffects: { iron: 12 }, npcEffects: [{ npcId: 'lord_vane', disposition: 15, memory: 'Passed the Iron Trial' }, { npcId: 'sergeant_kael', disposition: 10, memory: 'Fought well' }], resultText: 'Three rounds in the iron ring. You bleed. They bleed more. "You may stay."', chronicleText: 'The traveler passed the Iron Trial in Ironhold.' },
          { id: 'challenge_tradition', text: '🕸️ Offer something more valuable', repEffects: { diplomacy: 10, trade: 5 }, requiresRep: { diplomacy: 15 }, factionEffects: { iron: 5, amber: 3 }, npcEffects: [{ npcId: 'lord_vane', disposition: 5, memory: 'Challenged tradition — interesting' }], resultText: 'You present intelligence about border vulnerabilities. "...You may stay."', chronicleText: 'The traveler circumvented the trial with strategic intelligence.' },
          { id: 'refuse_trial', text: '👤 Walk away.', repEffects: {}, factionEffects: { iron: -8 }, npcEffects: [{ npcId: 'lord_vane', disposition: -10, memory: 'Refused the trial' }], resultText: 'The gates close behind you. Ironhold remembers who walks away.', chronicleText: 'The traveler refused the Iron Trial.' },
        ],
      },
    ],
    thornwick: [
      {
        id: `thornwick_spirits_${tick}`, title: 'The Old Songs', location: 'thornwick',
        narrative: 'Elder Saya sits by the standing stones. "The trees are restless. Something moves in the deep wood. Will you listen to the old song?"',
        choices: [
          { id: 'listen_song', text: '🔮 Listen to the old song', repEffects: { arcane: 10, exploration: 5 }, factionEffects: { green: 8, scholar: 5 }, npcEffects: [{ npcId: 'elder_saya', disposition: 20, memory: 'Listened to the old songs' }], resultText: 'The song is in a language you don\'t know. But you understand it.', chronicleText: 'The traveler listened to Elder Saya\'s old song. Something awakened.' },
          { id: 'investigate_woods', text: '🏹 Investigate the deep wood', repEffects: { exploration: 10, conquest: 3 }, factionEffects: { green: 5 }, npcEffects: [{ npcId: 'fen_the_hunter', disposition: 15, memory: 'Brave enough for the deep wood' }], resultText: 'Two days in the deep wood. Tracks that are wrong. Something watches from the canopy.', chronicleText: 'The traveler ventured into the deep wood near Thornwick.' },
        ],
      },
    ],
    graygate: [
      {
        id: `graygate_intelligence_${tick}`, title: 'Whispers in Graygate', location: 'graygate',
        narrative: 'Lysara appears at your table. "I have information three factions would kill for. The price is a favor. Unnamed. Future."',
        choices: [
          { id: 'accept_deal', text: '🕸️ Accept the unnamed favor', repEffects: { diplomacy: 12, exploration: 5 }, npcEffects: [{ npcId: 'broker_lysara', disposition: 15, memory: 'Accepted my deal' }], resultText: 'Details of a secret Iron-Ashen alliance. "Remember. You owe me."', chronicleText: 'The traveler struck a deal with Lysara in Graygate.' },
          { id: 'pay_coin', text: '⚖️ "Name a price."', repEffects: { trade: 8 }, requiresRep: { trade: 15 }, npcEffects: [{ npcId: 'broker_lysara', disposition: 5, memory: 'Insisted on coin' }], resultText: '"Three hundred gold. And my respect." Worth ten times what you spent.', chronicleText: 'The traveler purchased intelligence from Lysara with coin.' },
          { id: 'refuse_deal', text: '👤 Walk away', repEffects: {}, npcEffects: [{ npcId: 'broker_lysara', disposition: -10, memory: 'Refused my offer' }], resultText: '"Someone else will take it."', chronicleText: 'The traveler refused Lysara\'s offer.' },
        ],
      },
    ],
    dustfall: [
      {
        id: `dustfall_ruins_${tick}`, title: 'Beneath the Stones', location: 'dustfall',
        narrative: 'Archivist Nol\'s hands shake. "We found a new chamber. The script — it\'s not Imperial. It\'s older. Much older."',
        choices: [
          { id: 'explore_chamber', text: '🔮 Descend into the chamber', repEffects: { arcane: 15, exploration: 8 }, factionEffects: { scholar: 12 }, npcEffects: [{ npcId: 'archivist_nol', disposition: 20, memory: 'Entered the deep chamber' }], resultText: 'A pedestal. A fragment that pulses with warm light. You touch it. A word you\'ll always remember.', chronicleText: 'The traveler descended into the ancient chamber beneath Dustfall.' },
          { id: 'study_script', text: '📜 Study the inscriptions', repEffects: { arcane: 8, craft: 5 }, factionEffects: { scholar: 8 }, npcEffects: [{ npcId: 'archivist_nol', disposition: 15, memory: 'Studied the script carefully' }], resultText: 'Hours become days. Three scrolls of transcription. The Scholarium wants to meet you.', chronicleText: 'The traveler studied the ancient scripts at Dustfall.' },
          { id: 'loot_ruins', text: '⚖️ Look for things worth selling', repEffects: { trade: 5, exploration: 3 }, factionEffects: { scholar: -10, ashen: 5 }, npcEffects: [{ npcId: 'archivist_nol', disposition: -15, memory: 'Looted the ruins' }], resultText: 'Gold seal, ceremonial dagger, coins. Nol watches with disgust.', chronicleText: 'The traveler looted the Dustfall ruins for profit.' },
        ],
      },
    ],
    crossroads: [
      {
        id: `crossroads_rumors_${tick}`, title: 'Tavern Talk', location: 'crossroads',
        narrative: 'Bryn slides a mug across. "Three things today. Iron Compact mobilizing. Amber raised tariffs. And something came from the Badlands."',
        choices: [
          { id: 'pursue_military', text: '⚔️ Ask about the mobilization', repEffects: { conquest: 5, exploration: 5 }, resultText: '"Watch the east road. Iron patrols have been stopping travelers."', chronicleText: 'The traveler learned of Iron Compact mobilization.' },
          { id: 'pursue_trade', text: '⚖️ Ask about tariffs', repEffects: { trade: 8, diplomacy: 3 }, npcEffects: [{ npcId: 'innkeeper_bryn', disposition: 5, memory: 'Interested in trade intel' }], resultText: '"Mountain salt is about to triple. Get to Coldpeak before word spreads..."', chronicleText: 'The traveler gathered trade intelligence at the Crossroads.' },
          { id: 'pursue_mystery', text: '🔮 Ask about the Badlands', repEffects: { exploration: 8, arcane: 5 }, npcEffects: [{ npcId: 'innkeeper_bryn', disposition: 10, memory: 'Asked about the dark things' }], resultText: '"Three-toed tracks. Deep. And a sound like a word spoken by something without a mouth."', chronicleText: 'The traveler learned of something from the Badlands.' },
        ],
      },
    ],
    marshend: [
      {
        id: `marshend_job_${tick}`, title: 'A Job Offer', location: 'marshend',
        narrative: 'Maren flips a coin. "A caravan needs to move through Iron territory without being searched."',
        choices: [
          { id: 'accept_smuggle', text: '🗡️ Take the smuggling job', repEffects: { trade: 5, conquest: 3 }, factionEffects: { ashen: 12, iron: -8 }, npcEffects: [{ npcId: 'shadow_maren', disposition: 20, memory: 'Took the job — reliable' }], resultText: 'Tense run. Two close calls. Maren pays double. "Consider it a recruitment bonus."', chronicleText: 'The traveler smuggled goods for the Ashen Brotherhood.' },
          { id: 'refuse_smuggle', text: '👤 "I don\'t move goods I can\'t see."', repEffects: { diplomacy: 3 }, factionEffects: { iron: 3, ashen: -5 }, npcEffects: [{ npcId: 'shadow_maren', disposition: -10, memory: 'Too principled' }], resultText: '"Staying clean in Aethermoor is expensive. Eventually, everyone gets dirty."', chronicleText: 'The traveler refused the Brotherhood\'s smuggling offer.' },
        ],
      },
    ],
    badlands: [
      {
        id: `badlands_encounter_${tick}`, title: 'Something in the Dust', location: 'badlands',
        narrative: 'A sound. Not wind. Not animal. A word. The ground vibrates.',
        choices: [
          { id: 'approach_source', text: '🔮 Follow the sound', repEffects: { arcane: 15, exploration: 10 }, resultText: 'A crack in the earth. Crystals that look like text. A name. Not yours. Older.', chronicleText: 'The traveler found the speaking crystals in the Badlands.' },
          { id: 'mark_and_retreat', text: '🏹 Mark and retreat', repEffects: { exploration: 8 }, resultText: 'Wisdom over curiosity. You mark coordinates and retreat.', chronicleText: 'The traveler marked a strange location in the Badlands.' },
        ],
      },
    ],
    coldpeak: [
      {
        id: `coldpeak_stars_${tick}`, title: 'The Stars Speak', location: 'coldpeak',
        narrative: 'Astronomer Vael trembles. "The constellation of the Shepherd has shifted. That hasn\'t happened since the Vanishing."',
        choices: [
          { id: 'carry_message', text: '📜 Carry the message to Dustfall', repEffects: { diplomacy: 8, exploration: 5, arcane: 3 }, factionEffects: { scholar: 10, iron: -3 }, npcEffects: [{ npcId: 'astronomer_vael', disposition: 20, memory: 'Carried the star-message' }], resultText: '"Tell them the Shepherd has moved. They will know what it means."', chronicleText: 'The traveler carried a celestial warning from Coldpeak.' },
          { id: 'read_message', text: '🕸️ Open the message first', repEffects: { arcane: 8, diplomacy: -3 }, npcEffects: [{ npcId: 'astronomer_vael', disposition: -5, memory: 'Read the sealed message' }], resultText: 'Three star positions mapped to three locations. Something is going to happen at the Aetherik Temple. Soon.', chronicleText: 'The traveler read Vael\'s sealed message.' },
        ],
      },
    ],
    ruins_of_aether: [
      {
        id: `ruins_temple_${tick}`, title: 'The Temple Speaks', location: 'ruins_of_aether',
        narrative: 'Impossible silence. The walls are covered in script you now recognize fragments of.',
        choices: [
          { id: 'attempt_reading', text: '🔮 Read the temple walls', repEffects: { arcane: 20 }, requiresRep: { arcane: 20 }, resultText: 'You speak the first sentence of the old language. The temple responds. A new Speaker has emerged.', chronicleText: 'The traveler spoke the old language in the Aetherik Temple.' },
          { id: 'take_fragments', text: '📜 Copy the inscriptions', repEffects: { arcane: 10, craft: 5 }, factionEffects: { scholar: 8 }, resultText: 'Three scrolls of transcription. The most complete record outside the Scholarium\'s vaults.', chronicleText: 'The traveler copied the temple inscriptions.' },
          { id: 'temple_pray', text: '✨ Kneel and listen', repEffects: { arcane: 12, diplomacy: 3 }, resultText: 'One of the Six Forgotten Gods is watching. Not speaking. Watching. Something has changed in you.', chronicleText: 'The traveler knelt in the Aetherik Temple and was noticed.' },
        ],
      },
    ],
  };

  const locEvents = locationEvents[locationId] || [];
  if (season === 'harvest' && locationId === 'ashenford') {
    return [locEvents.find(e => e.id.includes('harvest')) || locEvents[0]].filter(Boolean) as GameEvent[];
  }
  if (locEvents.length > 0) {
    const idx = Math.floor(Math.random() * locEvents.length);
    return [locEvents[idx]];
  }
  return [];
}

export function getWorldEvent(tick: number, season: Season): string | null {
  const events = [
    { minTick: 5, text: '🌾 Grain prices have risen across the plains.' },
    { minTick: 10, text: '⚔️ The Iron Compact has moved soldiers to the Graygate border.' },
    { minTick: 15, text: '🌊 The Tidewarden Fleet reports unusual currents.' },
    { minTick: 20, text: '🔮 The Remnant Scholarium announces a breakthrough at Dustfall.' },
    { minTick: 25, text: '💀 Three more travelers have vanished in the Badlands.' },
    { minTick: 30, text: '🏛️ The Amber Compact raises trade tariffs.' },
    { minTick: 35, text: '🌿 The Greenwarden Covenant reports the forest is expanding.' },
    { minTick: 40, text: '⚔️ Border skirmish between Iron Compact and Greenwarden scouts.' },
    { minTick: 45, text: '🌑 The constellation of the Shepherd continues to shift.' },
    { minTick: 50, text: '✨ Villagers report lights in the Aetherik ruins at night.' },
  ];
  const applicable = events.filter(e => e.minTick === tick);
  return applicable.length > 0 ? applicable[0].text : null;
}

export function getPlayerTitle(rep: Record<string, number>): string {
  const max = Object.entries(rep).sort(([, a], [, b]) => b - a)[0];
  const [key, val] = max;
  if (val < 15) return 'Unknown Traveler';
  if (val < 30) {
    const t: Record<string, string> = { conquest: 'Sellsword', trade: 'Peddler', craft: 'Laborer', diplomacy: 'Messenger', exploration: 'Wanderer', arcane: 'Curious Wanderer' };
    return t[key] || 'Traveler';
  }
  if (val < 50) {
    const t: Record<string, string> = { conquest: 'Warlord', trade: 'Caravan Master', craft: 'Town Founder', diplomacy: 'Informant', exploration: 'Bounty Taker', arcane: 'Ruin Scholar' };
    return t[key] || 'Notable';
  }
  if (val < 75) {
    const t: Record<string, string> = { conquest: 'Territorial Lord', trade: 'Guild Master', craft: 'Regional Lord', diplomacy: 'Broker', exploration: 'Monster Hunter', arcane: 'Weave-Touched' };
    return t[key] || 'Renowned';
  }
  const t: Record<string, string> = { conquest: 'The Unconquered', trade: 'Economic Kingpin', craft: 'The Architect', diplomacy: 'The Kingmaker', exploration: 'The Apex', arcane: 'Speaker of the Age' };
  return t[key] || 'Legend';
}
