import { Location, Npc, GameEvent, Season } from './gameTypes';

export const SEASON_NAMES: Record<Season, string> = {
  thaw: 'The Thaw',
  summer: 'High Summer',
  harvest: 'The Harvest',
  dark: 'The Long Dark',
};

export const SEASON_ICONS: Record<Season, string> = {
  thaw: '🌱',
  summer: '☀️',
  harvest: '🍂',
  dark: '❄️',
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
  ashen: { name: 'The Ashen Brotherhood', motto: 'Chaos is not an enemy. It\'s a client.', icon: '🗡️', colorClass: 'text-faction-ashen' },
  tide: { name: 'The Tidewarden Fleet', motto: 'Every sea is ours.', icon: '🌊', colorClass: 'text-faction-tide' },
};

export const LOCATIONS: Location[] = [
  {
    id: 'ashenford',
    name: 'Ashenford',
    type: 'village',
    description: 'A farming village on the fertile plains. Smoke rises from modest chimneys. The villagers eye you with cautious curiosity — strangers bring either trade or trouble.',
    biome: 'Fertile Plains',
    npcs: ['mira', 'aldric'],
    connections: ['thornwick', 'saltmoor', 'crossroads'],
    icon: '🏘️',
  },
  {
    id: 'saltmoor',
    name: 'Saltmoor',
    type: 'city',
    description: 'A coastal trade city where salt air mingles with the smell of coin. The Amber Compact\'s banners fly from every merchant hall. Ships crowd the harbor like restless beasts.',
    biome: 'Coastal Region',
    npcs: ['guildmaster_renn', 'captain_voss'],
    connections: ['ashenford', 'graygate', 'ironhold'],
    icon: '🏙️',
  },
  {
    id: 'ironhold',
    name: 'Ironhold',
    type: 'fortress',
    description: 'A mountain fortress carved from living rock. The Iron Compact\'s stronghold radiates an oppressive order. Soldiers patrol in formations precise enough to measure time by.',
    biome: 'Mountain Range',
    npcs: ['lord_vane', 'sergeant_kael'],
    connections: ['saltmoor', 'coldpeak', 'crossroads'],
    icon: '🏰',
  },
  {
    id: 'thornwick',
    name: 'Thornwick',
    type: 'village',
    description: 'Deep forest village where the Greenwarden Covenant holds quiet sway. Ancient trees lean over moss-covered roofs. The village council meets in a circle of standing stones.',
    biome: 'Dense Forest',
    npcs: ['elder_saya', 'fen_the_hunter'],
    connections: ['ashenford', 'marshend', 'ruins_of_aether'],
    icon: '🌲',
  },
  {
    id: 'graygate',
    name: 'Graygate',
    type: 'city',
    description: 'A crossroads city where every faction maintains a presence. The neutral ground. Spies drink beside merchants, and soldiers gamble with scholars. Information is the local currency.',
    biome: 'Fertile Plains',
    npcs: ['broker_lysara', 'watchman_pike'],
    connections: ['saltmoor', 'dustfall', 'crossroads'],
    icon: '🏛️',
  },
  {
    id: 'dustfall',
    name: 'Dustfall',
    type: 'ruins',
    description: 'The largest ruin complex in Aethermoor. Remnant Scholarium tents cluster around crumbling imperial arches. Something hums beneath the stone — felt in the teeth, not the ears.',
    biome: 'Ancient Ruins',
    npcs: ['archivist_nol', 'the_whisperer'],
    connections: ['graygate', 'badlands'],
    icon: '🗿',
  },
  {
    id: 'crossroads',
    name: 'The Crossroads Inn',
    type: 'village',
    description: 'A sprawling inn at the junction of three trade roads. Travelers share rumors over bitter ale. The innkeeper knows more than any spymaster and sells none of it — unless the price is right.',
    biome: 'Fertile Plains',
    npcs: ['innkeeper_bryn'],
    connections: ['ashenford', 'ironhold', 'graygate'],
    icon: '🍺',
  },
  {
    id: 'marshend',
    name: 'Marshend',
    type: 'village',
    description: 'A village built on stilts above the marshwater. The Ashen Brotherhood operates here under a thin veneer of respectability. The locals pretend not to notice.',
    biome: 'Dense Forest',
    npcs: ['shadow_maren'],
    connections: ['thornwick', 'badlands'],
    icon: '🌿',
  },
  {
    id: 'badlands',
    name: 'The Badlands',
    type: 'wilderness',
    description: 'Cracked earth stretches to the horizon. Bandit camps dot the ridgelines. Something older and worse moves in the deep ravines. Three villages reported missing travelers last season.',
    biome: 'Badlands',
    npcs: [],
    connections: ['dustfall', 'marshend'],
    icon: '💀',
  },
  {
    id: 'coldpeak',
    name: 'Coldpeak',
    type: 'fortress',
    description: 'The highest settlement in Aethermoor. The air thins. The Scholarium maintains an observatory here, tracking stars that the old empire believed spoke prophecy.',
    biome: 'Mountain Range',
    npcs: ['astronomer_vael'],
    connections: ['ironhold'],
    icon: '⛰️',
  },
  {
    id: 'ruins_of_aether',
    name: 'Ruins of the Aetherik Temple',
    type: 'ruins',
    description: 'The central temple of the old empire. When the priests vanished, this is where the silence began. The walls are covered in script that shifts when you look away. The Arcanist path begins here.',
    biome: 'Ancient Ruins',
    npcs: [],
    connections: ['thornwick'],
    icon: '✨',
  },
];

export const INITIAL_NPCS: Npc[] = [
  {
    id: 'mira',
    name: 'Mira',
    title: 'Grain Farmer',
    location: 'ashenford',
    faction: 'green',
    personality: 'Practical, cautious, values loyalty above all.',
    memories: [],
    disposition: 10,
  },
  {
    id: 'aldric',
    name: 'Aldric',
    title: 'Farm Hand',
    location: 'ashenford',
    faction: 'none',
    personality: 'Eager, young, desperate to prove himself.',
    memories: [],
    disposition: 20,
  },
  {
    id: 'guildmaster_renn',
    name: 'Guildmaster Renn',
    title: 'Master of the Saltmoor Trade Guild',
    location: 'saltmoor',
    faction: 'amber',
    personality: 'Shrewd, calculating, respects competence over morality.',
    memories: [],
    disposition: 0,
  },
  {
    id: 'captain_voss',
    name: 'Captain Voss',
    title: 'Tidewarden Harbor Captain',
    location: 'saltmoor',
    faction: 'tide',
    personality: 'Blunt, weather-beaten, judges by actions not words.',
    memories: [],
    disposition: 5,
  },
  {
    id: 'lord_vane',
    name: 'Lord Vane',
    title: 'Commander of the Iron Compact',
    location: 'ironhold',
    faction: 'iron',
    personality: 'Cold, strategic, believes weakness invites destruction.',
    memories: [],
    disposition: -10,
  },
  {
    id: 'sergeant_kael',
    name: 'Sergeant Kael',
    title: 'Gate Commander',
    location: 'ironhold',
    faction: 'iron',
    personality: 'Loyal, rigid, secretly doubts the Compact\'s methods.',
    memories: [],
    disposition: 0,
  },
  {
    id: 'elder_saya',
    name: 'Elder Saya',
    title: 'Greenwarden Council Leader',
    location: 'thornwick',
    faction: 'green',
    personality: 'Patient, wise, remembers the old songs.',
    memories: [],
    disposition: 15,
  },
  {
    id: 'fen_the_hunter',
    name: 'Fen',
    title: 'Master Hunter',
    location: 'thornwick',
    faction: 'green',
    personality: 'Silent, observant, speaks only when necessary.',
    memories: [],
    disposition: 0,
  },
  {
    id: 'broker_lysara',
    name: 'Lysara',
    title: 'Information Broker',
    location: 'graygate',
    faction: 'none',
    personality: 'Charming, dangerous, remembers everything.',
    memories: [],
    disposition: 0,
  },
  {
    id: 'watchman_pike',
    name: 'Watchman Pike',
    title: 'City Watch Captain',
    location: 'graygate',
    faction: 'none',
    personality: 'Tired, just, stretched too thin.',
    memories: [],
    disposition: 5,
  },
  {
    id: 'archivist_nol',
    name: 'Archivist Nol',
    title: 'Lead Researcher, Dustfall Excavation',
    location: 'dustfall',
    faction: 'scholar',
    personality: 'Obsessive, brilliant, frightened by what they\'ve found.',
    memories: [],
    disposition: 0,
  },
  {
    id: 'the_whisperer',
    name: 'The Whisperer',
    title: '???',
    location: 'dustfall',
    faction: 'none',
    personality: 'Unknown.',
    memories: [],
    disposition: -20,
  },
  {
    id: 'innkeeper_bryn',
    name: 'Bryn',
    title: 'Innkeeper of the Crossroads',
    location: 'crossroads',
    faction: 'none',
    personality: 'Jovial, shrewd, collects stories like currency.',
    memories: [],
    disposition: 15,
  },
  {
    id: 'shadow_maren',
    name: 'Maren',
    title: 'Fence & Fixer',
    location: 'marshend',
    faction: 'ashen',
    personality: 'Quick-witted, amoral, loyal only to coin.',
    memories: [],
    disposition: -5,
  },
  {
    id: 'astronomer_vael',
    name: 'Astronomer Vael',
    title: 'Star-Reader of Coldpeak',
    location: 'coldpeak',
    faction: 'scholar',
    personality: 'Mystical, distant, speaks in metaphors that turn out to be literal.',
    memories: [],
    disposition: 0,
  },
];

export function generateEvents(locationId: string, season: Season, tick: number): GameEvent[] {
  const events: GameEvent[] = [];
  const loc = LOCATIONS.find(l => l.id === locationId);
  if (!loc) return events;

  // Location-specific events
  const locationEvents: Record<string, GameEvent[]> = {
    ashenford: [
      {
        id: `ashenford_bandits_${tick}`,
        title: 'Bandit Threat',
        narrative: 'Mira meets you at the village edge, worry carved into her face. "Bandits. On the north road. They hit a grain shipment yesterday. If they come here..." She trails off, looking at your weapons.',
        location: 'ashenford',
        choices: [
          {
            id: 'hunt_bandits',
            text: '⚔️ Hunt the bandits down',
            repEffects: { conquest: 8, exploration: 3 },
            factionEffects: { green: 10, iron: 5 },
            npcEffects: [{ npcId: 'mira', disposition: 20, memory: 'Defended Ashenford from bandits' }],
            resultText: 'You track the bandits to their camp and scatter them into the badlands. Three don\'t run fast enough. Ashenford breathes easier tonight.',
            chronicleText: 'The traveler cleared the bandit camp threatening Ashenford. The village remembers.',
          },
          {
            id: 'negotiate_bandits',
            text: '🕸️ Find the bandits. Negotiate.',
            repEffects: { diplomacy: 10, trade: 3 },
            factionEffects: { ashen: 8, green: 3 },
            npcEffects: [{ npcId: 'mira', disposition: 5, memory: 'Negotiated with bandits — unconventional' }],
            resultText: 'The bandit leader is surprisingly articulate. They were farmers once, before the Iron Compact taxed their village into starvation. You broker a deal: they raid the trade road, not the farms. A moral gray area you\'ll have to live with.',
            chronicleText: 'The traveler negotiated with the north road bandits. The raids continued — but not on Ashenford.',
          },
          {
            id: 'trade_grain',
            text: '⚖️ Offer to buy Mira\'s grain at premium to help',
            repEffects: { trade: 8, craft: 2 },
            factionEffects: { green: 5, amber: 3 },
            npcEffects: [{ npcId: 'mira', disposition: 15, memory: 'Bought grain at premium during shortage' }],
            resultText: 'You buy what\'s left of her harvest at double the market rate. It won\'t solve the bandit problem, but it solves Mira\'s problem. For now.',
            chronicleText: 'The traveler purchased grain at premium in Ashenford during the bandit crisis.',
          },
          {
            id: 'ignore_bandits',
            text: '👤 Not your problem. Move on.',
            repEffects: { exploration: 2 },
            npcEffects: [{ npcId: 'mira', disposition: -15, memory: 'Ignored Ashenford\'s plea for help' }],
            resultText: 'Mira watches you leave. She says nothing. She remembers.',
            chronicleText: 'The traveler passed through Ashenford and left its people to their fate.',
          },
        ],
      },
      {
        id: `ashenford_harvest_${tick}`,
        title: 'Harvest Time',
        narrative: 'The fields around Ashenford glow gold with ripe wheat. Aldric wipes sweat from his forehead. "We need hands. The harvest won\'t wait, and half the village is still rebuilding from last season."',
        location: 'ashenford',
        choices: [
          {
            id: 'help_harvest',
            text: '🌾 Roll up your sleeves and help',
            repEffects: { craft: 10, diplomacy: 3 },
            factionEffects: { green: 8 },
            npcEffects: [
              { npcId: 'aldric', disposition: 15, memory: 'Helped with the harvest' },
              { npcId: 'mira', disposition: 10, memory: 'Worked the fields alongside us' },
            ],
            resultText: 'Three days of honest labor. Your hands blister, then harden. The villagers begin to nod at you differently — not as a stranger passing through, but as someone who stayed.',
            chronicleText: 'The traveler labored in Ashenford\'s fields during the harvest. The village began to know them.',
          },
          {
            id: 'organize_workers',
            text: '🕸️ Organize a more efficient labor system',
            repEffects: { diplomacy: 8, craft: 5, trade: 3 },
            factionEffects: { green: 5, amber: 3 },
            npcEffects: [{ npcId: 'aldric', disposition: 10, memory: 'Reorganized the harvest workflow' }],
            resultText: 'You restructure the harvesting into shifts with rest rotations. Yield increases by a third. Aldric is impressed. The village council takes notice.',
            chronicleText: 'The traveler reformed Ashenford\'s harvest methods, increasing yield significantly.',
          },
        ],
      },
    ],
    saltmoor: [
      {
        id: `saltmoor_guild_${tick}`,
        title: 'The Guild\'s Proposal',
        narrative: 'Guildmaster Renn\'s office smells of ink and expensive wine. He studies you over steepled fingers. "You\'ve been moving goods through our territory. Ordinarily, that would be a problem. But I see potential. The Guild is offering you a choice."',
        location: 'saltmoor',
        choices: [
          {
            id: 'join_guild',
            text: '⚖️ Accept membership in the Trade Guild',
            repEffects: { trade: 12, diplomacy: 5 },
            factionEffects: { amber: 15, iron: -5 },
            npcEffects: [{ npcId: 'guildmaster_renn', disposition: 20, memory: 'Joined the Trade Guild' }],
            resultText: 'Renn smiles — a calculated expression. "Welcome to the Amber Compact\'s greatest asset. Your routes are now protected. Your prices, negotiable. Your enemies... well. Let\'s discuss that over wine."',
            chronicleText: 'The traveler joined the Saltmoor Trade Guild under Guildmaster Renn\'s sponsorship.',
          },
          {
            id: 'counter_offer',
            text: '🕸️ Counter-offer: You want a percentage of port fees',
            repEffects: { trade: 8, diplomacy: 8 },
            requiresRep: { trade: 20 },
            factionEffects: { amber: 5 },
            npcEffects: [{ npcId: 'guildmaster_renn', disposition: 10, memory: 'Negotiated aggressively — with skill' }],
            resultText: 'Renn\'s eyebrows rise a fraction. "You understand how this works. Good. 2% of the eastern dock fees. Don\'t make me regret this."',
            chronicleText: 'The traveler negotiated port revenue sharing with the Saltmoor Trade Guild.',
          },
          {
            id: 'refuse_guild',
            text: '⚔️ "I don\'t answer to guilds."',
            repEffects: { conquest: 5 },
            factionEffects: { amber: -10, ashen: 5 },
            npcEffects: [{ npcId: 'guildmaster_renn', disposition: -20, memory: 'Refused the Guild — boldly' }],
            resultText: 'Renn\'s smile fades. "Then you\'ll find the trade routes... less hospitable. No hard feelings. Business is business." You leave knowing the Amber Compact has a long memory.',
            chronicleText: 'The traveler refused the Saltmoor Trade Guild. An enemy was made quietly.',
          },
        ],
      },
      {
        id: `saltmoor_ship_${tick}`,
        title: 'Troubled Waters',
        narrative: 'Captain Voss is shouting orders on the dock. A Tidewarden cargo vessel limps into harbor with a shattered mast. "Pirates," Voss growls. "Third ship this month. Someone\'s paying them to target our routes."',
        location: 'saltmoor',
        choices: [
          {
            id: 'volunteer_patrol',
            text: '⚔️ Volunteer for the naval patrol',
            repEffects: { conquest: 8, exploration: 5 },
            factionEffects: { tide: 12, amber: 3 },
            npcEffects: [{ npcId: 'captain_voss', disposition: 20, memory: 'Volunteered to fight pirates' }],
            resultText: 'Two days at sea. You find the pirate nest in a hidden cove. What follows is brutal and efficient. Voss claps you on the shoulder with a hand like a ship\'s timber. "You\'ll do."',
            chronicleText: 'The traveler joined a Tidewarden patrol and destroyed a pirate cove.',
          },
          {
            id: 'investigate_funding',
            text: '🕸️ Investigate who\'s funding the pirates',
            repEffects: { diplomacy: 10, exploration: 5 },
            factionEffects: { tide: 8, iron: -3 },
            npcEffects: [{ npcId: 'captain_voss', disposition: 15, memory: 'Uncovered the pirate conspiracy' }],
            resultText: 'Three days of asking questions in harbor taverns. Following coin trails. The answer is uncomfortable: the Iron Compact is funding the raids to destabilize Tidewarden trade leverage. You bring this to Voss. His face darkens. "This changes things."',
            chronicleText: 'The traveler uncovered Iron Compact funding behind the pirate raids on Tidewarden shipping.',
          },
        ],
      },
    ],
    ironhold: [
      {
        id: `ironhold_trial_${tick}`,
        title: 'The Iron Trial',
        narrative: 'Lord Vane\'s hall is cold stone and torchlight. He regards you from an iron throne. "Everyone who enters Ironhold must prove their worth. I don\'t care about your reputation elsewhere. Here, you prove yourself. Or you leave."',
        location: 'ironhold',
        choices: [
          {
            id: 'accept_trial',
            text: '⚔️ Accept the combat trial',
            repEffects: { conquest: 12 },
            factionEffects: { iron: 12 },
            npcEffects: [
              { npcId: 'lord_vane', disposition: 15, memory: 'Passed the Iron Trial with honor' },
              { npcId: 'sergeant_kael', disposition: 10, memory: 'Fought well in the trial' },
            ],
            resultText: 'Three rounds in the iron ring against Vane\'s best. You bleed. They bleed more. When it ends, Vane nods once — the highest praise in Ironhold. "You may stay."',
            chronicleText: 'The traveler passed the Iron Trial in Ironhold and won Lord Vane\'s grudging respect.',
          },
          {
            id: 'challenge_tradition',
            text: '🕸️ "What if I offer something more valuable than fighting?"',
            repEffects: { diplomacy: 10, trade: 5 },
            requiresRep: { diplomacy: 15 },
            factionEffects: { iron: 5, amber: 3 },
            npcEffects: [{ npcId: 'lord_vane', disposition: 5, memory: 'Challenged the trial tradition — interesting' }],
            resultText: 'Vane\'s eyes narrow. You present intelligence about Iron Compact border vulnerabilities that only an outsider would spot. He reads. His jaw tightens. "...You may stay. And we will talk more."',
            chronicleText: 'The traveler circumvented Ironhold\'s trial by offering strategic intelligence. Lord Vane was intrigued.',
          },
          {
            id: 'refuse_trial',
            text: '👤 Walk away. This isn\'t worth it.',
            repEffects: {},
            factionEffects: { iron: -8 },
            npcEffects: [{ npcId: 'lord_vane', disposition: -10, memory: 'Refused the trial — coward or pragmatist?' }],
            resultText: 'You turn and leave. The gates close behind you. Ironhold remembers who walks away.',
            chronicleText: 'The traveler refused the Iron Trial and departed Ironhold.',
          },
        ],
      },
    ],
    thornwick: [
      {
        id: `thornwick_spirits_${tick}`,
        title: 'The Old Songs',
        narrative: 'Elder Saya sits by the standing stones, eyes closed. When she opens them, they glint like the forest itself is watching through her. "The trees are restless. Something moves in the deep wood. Something that was sleeping." She pauses. "Will you listen to the old song?"',
        location: 'thornwick',
        choices: [
          {
            id: 'listen_song',
            text: '🔮 Listen to the old song',
            repEffects: { arcane: 10, exploration: 5 },
            factionEffects: { green: 8, scholar: 5 },
            npcEffects: [{ npcId: 'elder_saya', disposition: 20, memory: 'Listened to the old songs — showed reverence' }],
            resultText: 'The song is in a language you don\'t know. But you understand it. Not the words — the shape. The feeling. When it ends, you see the forest differently. Paths you didn\'t notice before. Patterns in the bark that might be writing.',
            chronicleText: 'The traveler listened to Elder Saya\'s old song in Thornwick. Something awakened in them.',
          },
          {
            id: 'investigate_woods',
            text: '🏹 Investigate what\'s moving in the deep wood',
            repEffects: { exploration: 10, conquest: 3 },
            factionEffects: { green: 5 },
            npcEffects: [
              { npcId: 'fen_the_hunter', disposition: 15, memory: 'Brave enough to enter the deep wood' },
              { npcId: 'elder_saya', disposition: 5, memory: 'Went to face what stirs in the forest' },
            ],
            resultText: 'Fen joins you silently. Two days in the deep wood. You find tracks that are wrong — too large, with too many digits. Something watches from the canopy. You find a clearing where the ground hums. You mark it on your map and return. Fen nods. "Now you know."',
            chronicleText: 'The traveler ventured into the deep wood near Thornwick and found signs of something ancient.',
          },
        ],
      },
    ],
    graygate: [
      {
        id: `graygate_intelligence_${tick}`,
        title: 'Whispers in Graygate',
        narrative: 'Lysara finds you at a corner table. She doesn\'t sit — she appears. "I have something. Information that three factions would kill for. I\'m offering it to you first because you\'re interesting." Her smile doesn\'t reach her eyes. "The price is a favor. Unnamed. Future. Do we have a deal?"',
        location: 'graygate',
        choices: [
          {
            id: 'accept_deal',
            text: '🕸️ Accept the unnamed favor',
            repEffects: { diplomacy: 12, exploration: 5 },
            npcEffects: [{ npcId: 'broker_lysara', disposition: 15, memory: 'Accepted my deal — bold or foolish' }],
            resultText: 'She slides a folded paper across the table. It contains details of a secret alliance forming between the Iron Compact and the Ashen Brotherhood. If true, this changes everything. "Remember," she whispers. "You owe me."',
            chronicleText: 'The traveler struck a deal with Lysara the broker in Graygate. The favor remains unnamed.',
          },
          {
            id: 'pay_coin',
            text: '⚖️ "I don\'t do unnamed favors. Name a price."',
            repEffects: { trade: 8 },
            requiresRep: { trade: 15 },
            npcEffects: [{ npcId: 'broker_lysara', disposition: 5, memory: 'Insisted on coin over favors — smart' }],
            resultText: 'Her smile sharpens. "Three hundred gold. And my respect, which is worth more." You pay. The intelligence is real — and worth ten times what you spent.',
            chronicleText: 'The traveler purchased intelligence from Lysara with coin instead of promises.',
          },
          {
            id: 'refuse_deal',
            text: '👤 Walk away',
            repEffects: {},
            npcEffects: [{ npcId: 'broker_lysara', disposition: -10, memory: 'Refused my offer — cautious or cowardly' }],
            resultText: 'She shrugs. "Someone else will take it. They always do." You wonder, later, what you missed.',
            chronicleText: 'The traveler refused Lysara\'s offer in Graygate.',
          },
        ],
      },
    ],
    dustfall: [
      {
        id: `dustfall_ruins_${tick}`,
        title: 'Beneath the Stones',
        narrative: 'Archivist Nol\'s hands shake as they spread ancient blueprints across the research table. "We found a new chamber. Below the main temple. The script on the walls — it\'s not Imperial. It\'s older. Much older." They look up. "We need someone to go down there. Someone who isn\'t afraid."',
        location: 'dustfall',
        choices: [
          {
            id: 'explore_chamber',
            text: '🔮 Descend into the ancient chamber',
            repEffects: { arcane: 15, exploration: 8 },
            factionEffects: { scholar: 12 },
            npcEffects: [
              { npcId: 'archivist_nol', disposition: 20, memory: 'Brave enough to enter the deep chamber' },
            ],
            resultText: 'The air grows thick. Your torch flickers but doesn\'t die. The walls are covered in symbols that seem to move at the edges of your vision. In the deepest chamber, you find a pedestal. On it, a fragment of stone that pulses with warm light. When you touch it, you hear a word you don\'t understand. But you remember it. You will always remember it.',
            chronicleText: 'The traveler descended into the ancient chamber beneath Dustfall and touched something that remembered them back.',
          },
          {
            id: 'study_script',
            text: '📜 Study the surface inscriptions first',
            repEffects: { arcane: 8, craft: 5 },
            factionEffects: { scholar: 8 },
            npcEffects: [{ npcId: 'archivist_nol', disposition: 15, memory: 'Methodical researcher — studied the script carefully' }],
            resultText: 'Hours become days. The script is a mix of Imperial administration and something else — a language that encodes meaning into the shape of the letters themselves. You copy three fragments. Nol is ecstatic. The Scholarium sends word that they want to meet you.',
            chronicleText: 'The traveler studied the ancient scripts at Dustfall. The Remnant Scholarium took notice.',
          },
          {
            id: 'loot_ruins',
            text: '⚖️ Look for things worth selling',
            repEffects: { trade: 5, exploration: 3 },
            factionEffects: { scholar: -10, ashen: 5 },
            npcEffects: [{ npcId: 'archivist_nol', disposition: -15, memory: 'Treated the ruins as a market — philistine' }],
            resultText: 'You find several imperial artifacts: a gold seal, a ceremonial dagger, coins with faces the Scholarium would study for years. You pocket them. Nol watches with barely concealed disgust.',
            chronicleText: 'The traveler looted the Dustfall ruins for profit. The Scholarium will remember this.',
          },
        ],
      },
    ],
    crossroads: [
      {
        id: `crossroads_rumors_${tick}`,
        title: 'Tavern Talk',
        narrative: 'Bryn slides a mug across the counter and leans in. "Heard three things today. The Iron Compact is mobilizing soldiers near Graygate. The Amber Compact just raised tariffs on mountain trade. And something..." He glances around. "Something came out of the Badlands last night. The patrol that found it didn\'t come back."',
        location: 'crossroads',
        choices: [
          {
            id: 'pursue_military',
            text: '⚔️ Head toward Graygate to see the mobilization',
            repEffects: { conquest: 5, exploration: 5 },
            resultText: 'Bryn nods. "If you\'re heading that way, watch the east road. Iron Compact patrols have been stopping travelers." You file this away and drain your mug.',
            chronicleText: 'The traveler learned of Iron Compact mobilization near Graygate from the Crossroads innkeeper.',
          },
          {
            id: 'pursue_trade',
            text: '⚖️ Ask about the tariff changes',
            repEffects: { trade: 8, diplomacy: 3 },
            npcEffects: [{ npcId: 'innkeeper_bryn', disposition: 5, memory: 'Interested in trade intelligence — useful person' }],
            resultText: 'Bryn knows the tariff rates, the exemptions, and which merchants are panicking. "Mountain salt is about to triple. If you can get to Coldpeak before word spreads..." He lets the sentence finish itself.',
            chronicleText: 'The traveler gathered trade intelligence at the Crossroads Inn.',
          },
          {
            id: 'pursue_mystery',
            text: '🔮 Ask about what came from the Badlands',
            repEffects: { exploration: 8, arcane: 5 },
            npcEffects: [{ npcId: 'innkeeper_bryn', disposition: 10, memory: 'Asked about the dark things — brave or foolish' }],
            resultText: 'Bryn\'s smile fades. "The patrol found tracks. Three-toed. Deep impressions — heavy. And a sound. They described a sound like a word spoken by something that doesn\'t have a mouth." He pauses. "The Scholarium sent someone to investigate. They haven\'t reported back either."',
            chronicleText: 'The traveler learned of something emerging from the Badlands. The mystery deepens.',
          },
        ],
      },
    ],
    marshend: [
      {
        id: `marshend_job_${tick}`,
        title: 'A Job Offer',
        narrative: 'Maren is waiting on the dock, flipping a coin. "I have work. Pays well. Doesn\'t require questions. A caravan needs to move through Iron Compact territory without being searched. The contents are none of your business."',
        location: 'marshend',
        choices: [
          {
            id: 'accept_smuggle',
            text: '🗡️ Take the smuggling job',
            repEffects: { trade: 5, conquest: 3 },
            factionEffects: { ashen: 12, iron: -8 },
            npcEffects: [{ npcId: 'shadow_maren', disposition: 20, memory: 'Took the job — reliable' }],
            resultText: 'The run is tense. Two close calls with Iron Compact checkpoints. Your pulse doesn\'t return to normal until you\'re clear. Maren pays double what she promised. "Consider it a recruitment bonus. The Brotherhood could use you."',
            chronicleText: 'The traveler smuggled goods through Iron Compact territory for the Ashen Brotherhood.',
          },
          {
            id: 'refuse_smuggle',
            text: '👤 "I don\'t move goods I can\'t see."',
            repEffects: { diplomacy: 3 },
            factionEffects: { iron: 3, ashen: -5 },
            npcEffects: [{ npcId: 'shadow_maren', disposition: -10, memory: 'Too principled — or too cautious' }],
            resultText: 'Maren shrugs. "Your loss. But you should know — staying clean in Aethermoor is expensive. Eventually, everyone gets their hands dirty."',
            chronicleText: 'The traveler refused the Ashen Brotherhood\'s smuggling offer in Marshend.',
          },
        ],
      },
    ],
    badlands: [
      {
        id: `badlands_encounter_${tick}`,
        title: 'Something in the Dust',
        narrative: 'The wind carries grit and whispers. You\'ve been walking for hours. Then — a sound. Not wind. Not animal. A word. Spoken by something that shouldn\'t be able to speak. The ground beneath your feet vibrates with a frequency that makes your teeth ache.',
        location: 'badlands',
        choices: [
          {
            id: 'approach_source',
            text: '🔮 Follow the sound to its source',
            repEffects: { arcane: 15, exploration: 10 },
            resultText: 'You find a crack in the earth. Inside, crystals grow in patterns that look like text. When you reach toward them, the word becomes clearer. It is a name. Not yours. Older. When you withdraw your hand, the crystals dim. But you know the word now. It settles into your memory like a stone into water.',
            chronicleText: 'The traveler found the speaking crystals in the Badlands. The old language speaks to those who listen.',
          },
          {
            id: 'mark_and_retreat',
            text: '🏹 Mark the location and retreat',
            repEffects: { exploration: 8 },
            resultText: 'Wisdom over curiosity. You mark the coordinates and retreat before the vibration worsens. Later, at the Crossroads, you learn that three other people have heard the same sound. None of them came back the same.',
            chronicleText: 'The traveler marked a strange location in the Badlands but chose caution over curiosity.',
          },
        ],
      },
    ],
    coldpeak: [
      {
        id: `coldpeak_stars_${tick}`,
        title: 'The Stars Speak',
        narrative: 'Astronomer Vael doesn\'t look at you when you enter. She\'s staring at star charts, hands trembling. "The constellation of the Shepherd has shifted. That hasn\'t happened since the Vanishing." She finally meets your eyes. "Something is about to change. I need someone to carry a message to the Scholarium. Someone who won\'t be intercepted by the Iron Compact."',
        location: 'coldpeak',
        choices: [
          {
            id: 'carry_message',
            text: '📜 Carry the message to Dustfall',
            repEffects: { diplomacy: 8, exploration: 5, arcane: 3 },
            factionEffects: { scholar: 10, iron: -3 },
            npcEffects: [{ npcId: 'astronomer_vael', disposition: 20, memory: 'Carried the star-message faithfully' }],
            resultText: 'Vael seals the message with wax impressed by a symbol you almost recognize. "Tell them the Shepherd has moved. They will know what it means. I pray they know what to do about it."',
            chronicleText: 'The traveler carried a celestial warning from Coldpeak to the Remnant Scholarium.',
          },
          {
            id: 'read_message',
            text: '🕸️ Open the message first',
            repEffects: { arcane: 8, diplomacy: -3 },
            npcEffects: [{ npcId: 'astronomer_vael', disposition: -5, memory: 'Read the sealed message — untrustworthy' }],
            resultText: 'The message describes a mathematical relationship between three star positions and three locations in Aethermoor — one of which is the Ruins of the Aetherik Temple. Something is going to happen there. Soon.',
            chronicleText: 'The traveler read Vael\'s sealed message and learned of a celestial convergence.',
          },
        ],
      },
    ],
    ruins_of_aether: [
      {
        id: `ruins_temple_${tick}`,
        title: 'The Temple Speaks',
        narrative: 'The Aetherik Temple stands in impossible silence. Not quiet — silence. As if sound itself is holding its breath. The walls are covered in script that you now recognize fragments of. From Dustfall. From the Badlands. From the old song. It\'s the same language. And standing here, you can almost read it.',
        location: 'ruins_of_aether',
        choices: [
          {
            id: 'attempt_reading',
            text: '🔮 Attempt to read the temple walls',
            repEffects: { arcane: 20 },
            requiresRep: { arcane: 20 },
            resultText: 'The words assemble. Not in your mind — in the air. You speak the first sentence of the old language. The temple responds. Lights trace the walls like veins carrying blood. Something ancient becomes aware of you. Not hostile. Not friendly. Aware. The Arcanist path has truly begun.',
            chronicleText: 'The traveler spoke the old language in the Aetherik Temple. The Forgotten Gods stirred. A new Speaker has emerged.',
          },
          {
            id: 'take_fragments',
            text: '📜 Copy the wall inscriptions carefully',
            repEffects: { arcane: 10, craft: 5 },
            factionEffects: { scholar: 8 },
            resultText: 'Hours of careful transcription. Your copies fill three scrolls. This is the most complete record of the old language outside the Scholarium\'s deepest vaults. They will want this. Others will want to stop them from having it.',
            chronicleText: 'The traveler copied the temple inscriptions. Knowledge of the old language grows.',
          },
          {
            id: 'temple_pray',
            text: '✨ Kneel and listen',
            repEffects: { arcane: 12, diplomacy: 3 },
            resultText: 'You kneel. The silence deepens. Then — not a voice, but a pressure. A presence. One of the Six Forgotten Gods is watching. Not speaking. Not commanding. Watching. When you rise, something has changed in you. You can feel the threads of the world, faintly, like a distant song.',
            chronicleText: 'The traveler knelt in the Aetherik Temple and was noticed by something divine.',
          },
        ],
      },
    ],
  };

  const locEvents = locationEvents[locationId] || [];
  
  // Filter by season
  if (season === 'harvest' && locationId === 'ashenford') {
    return [locEvents.find(e => e.id.includes('harvest')) || locEvents[0]].filter(Boolean) as GameEvent[];
  }
  
  // Return a random event for the location
  if (locEvents.length > 0) {
    const idx = Math.floor(Math.random() * locEvents.length);
    return [locEvents[idx]];
  }

  return [];
}

export function getWorldEvent(tick: number, season: Season): string | null {
  const events = [
    { minTick: 5, text: '🌾 Grain prices have risen across the plains. The harvest was below expectations.' },
    { minTick: 10, text: '⚔️ The Iron Compact has moved soldiers to the Graygate border. Tensions escalate.' },
    { minTick: 15, text: '🌊 The Tidewarden Fleet reports unusual currents. Fishing yields have halved.' },
    { minTick: 20, text: '🔮 The Remnant Scholarium announces a breakthrough at Dustfall. Details are classified.' },
    { minTick: 25, text: '💀 Three more travelers have vanished in the Badlands. The Brotherhood denies involvement.' },
    { minTick: 30, text: '🏛️ The Amber Compact raises trade tariffs. Smaller merchants protest. Some go bankrupt.' },
    { minTick: 35, text: '🌿 The Greenwarden Covenant reports the deep forest is expanding. Trees grow where no seeds were planted.' },
    { minTick: 40, text: '⚔️ A border skirmish between the Iron Compact and Greenwarden scouts. No casualties. Yet.' },
    { minTick: 45, text: '🌑 Astronomer Vael publishes a warning: the constellation of the Shepherd continues to shift.' },
    { minTick: 50, text: '✨ Villagers near the Aetherik Temple report lights in the ruins at night. The old language hums louder.' },
  ];
  
  const applicable = events.filter(e => e.minTick === tick);
  return applicable.length > 0 ? applicable[0].text : null;
}

export function getPlayerTitle(rep: Record<string, number>): string {
  const max = Object.entries(rep).sort(([, a], [, b]) => b - a)[0];
  const [key, val] = max;
  
  if (val < 15) return 'Unknown Traveler';
  if (val < 30) {
    const titles: Record<string, string> = {
      conquest: 'Sellsword', trade: 'Peddler', craft: 'Laborer',
      diplomacy: 'Messenger', exploration: 'Wanderer', arcane: 'Curious Wanderer',
    };
    return titles[key] || 'Traveler';
  }
  if (val < 50) {
    const titles: Record<string, string> = {
      conquest: 'Warlord', trade: 'Caravan Master', craft: 'Town Founder',
      diplomacy: 'Informant', exploration: 'Bounty Taker', arcane: 'Ruin Scholar',
    };
    return titles[key] || 'Notable';
  }
  if (val < 75) {
    const titles: Record<string, string> = {
      conquest: 'Territorial Lord', trade: 'Guild Master', craft: 'Regional Lord',
      diplomacy: 'Broker', exploration: 'Monster Hunter', arcane: 'Weave-Touched',
    };
    return titles[key] || 'Renowned';
  }
  const titles: Record<string, string> = {
    conquest: 'The Unconquered', trade: 'Economic Kingpin', craft: 'The Architect',
    diplomacy: 'The Kingmaker', exploration: 'The Apex', arcane: 'Speaker of the Age',
  };
  return titles[key] || 'Legend';
}
