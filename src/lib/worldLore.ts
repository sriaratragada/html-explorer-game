import { ContinentId } from './mapGenerator';

export interface ContinentLore {
  name: string;
  title: string;
  description: string;
  color: string;
}

export const CONTINENT_LORE: Record<ContinentId, ContinentLore> = {
  auredia: {
    name: 'Auredia',
    title: 'The Grand Kingdom',
    description: 'A unified realm of temperate plains, oak forests, and winding rivers. The capital Highmarch sits at its heart, ringed by vassal castles and farming villages connected by the densest road network in the known world. Under one banner and one crown, Auredia projects stability — though cracks run deeper than the throne admits.',
    color: '#c9a84c',
  },
  trivalen: {
    name: 'Trivalen',
    title: 'The Warring Continent',
    description: 'Three kingdoms locked in perpetual struggle. Korrath claims the iron-rich northern mountains, Vell controls the fertile southern coast, and the Sarnak Khanate dominates the eastern steppe. Between them lies contested ground — scorched fields, ruined castles, and bounty boards that never empty.',
    color: '#a05050',
  },
  uloren: {
    name: 'Uloren',
    title: 'The Unexplored',
    description: 'A mist-shrouded landmass where no roads have been cut and no maps agreed upon. Dense primeval forest blankets everything below the treeline; above it, unnamed peaks vanish into cloud. Scattered villages cling to existence beside standing stones no one carved and ruins no one built. Uloren does not welcome visitors.',
    color: '#5a7a8a',
  },
};

export interface KingdomLore {
  name: string;
  ruler: string;
  motto: string;
  description: string;
}

export const KINGDOM_LORE: Record<string, KingdomLore> = {
  auredia_crown: {
    name: 'The Grand Kingdom of Auredia',
    ruler: 'King Aldric III',
    motto: 'One crown, one road, one people.',
    description: 'The oldest unbroken dynasty in the known world. Auredia\'s strength is its road network and its bureaucracy — every village pays tax, every lord answers the call, and the Amber Compact ensures trade flows freely. Beneath the surface, noble houses jockey for influence and the Brotherhood operates in the shadows.',
  },
  korrath: {
    name: 'Kingdom of Korrath',
    ruler: 'Warlord-King Thane Rusk',
    motto: 'Iron remembers.',
    description: 'A mountain kingdom built on mines and forges. Korrath fields the heaviest infantry on any continent, clad in iron from Deepmine and tempered in the cold of Frostmarch. They view the other Trivalen kingdoms with contempt and Auredia with suspicion.',
  },
  vell: {
    name: 'Kingdom of Vell',
    ruler: 'Queen Serala the Merchant',
    motto: 'The tide brings all things.',
    description: 'A coastal realm whose wealth comes from grain, fish, and the shipping lanes that connect Trivalen to the wider world. Vell fights with gold more often than steel, buying mercenaries and negotiating treaties that always favour the harbour.',
  },
  sarnak: {
    name: 'The Sarnak Khanate',
    ruler: 'Khan Torven',
    motto: 'What the wind touches, we ride.',
    description: 'Steppe horsemen who consider settled life a form of slow death. The Khanate controls the eastern grasslands of Trivalen through speed and cavalry supremacy. Their economy is raiding, tribute, and the horse trade.',
  },
};
