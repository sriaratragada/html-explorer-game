export interface DialogueOption {
  id: string;
  text: string;
  requiresRep?: Record<string, number>;
  nextNodeId?: string;
  effects?: {
    reputation?: Record<string, number>;
    faction?: Record<string, number>;
    giveItem?: { itemId: string; qty: number };
    startQuest?: string;
  };
  exitText?: string;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  options: DialogueOption[];
}

export interface DialogueTree {
  npcId: string;
  startNodeId: string;
  nodes: Record<string, DialogueNode>;
}

// Templates for job-based NPCs
function genericDialogue(npcId: string, name: string, job: string): DialogueTree {
  const greetings: Record<string, string> = {
    farmer: `${name} wipes dirt from their hands. "Aye? What d'you need?"`,
    merchant: `${name} looks up from their ledger. "Buying or selling?"`,
    guard: `${name} adjusts their grip on the spear. "State your business."`,
    innkeeper: `${name} polishes a mug. "Sit down, stranger. What'll it be?"`,
    smith: `${name} sets down the hammer. "Looking for something forged?"`,
  };

  return {
    npcId,
    startNodeId: 'greet',
    nodes: {
      greet: {
        id: 'greet',
        speaker: name,
        text: greetings[job] ?? `${name} regards you quietly.`,
        options: [
          { id: 'ask_news', text: 'What news?', nextNodeId: 'news' },
          { id: 'ask_trade', text: 'Can we trade?', nextNodeId: 'trade' },
          { id: 'leave', text: 'Farewell.', exitText: `${name} nods.` },
        ],
      },
      news: {
        id: 'news',
        speaker: name,
        text: '"Not much happens here that the road doesn\'t bring. Keep your wits about you."',
        options: [
          { id: 'back', text: 'I see. Anything else?', nextNodeId: 'greet' },
          { id: 'leave2', text: 'Thanks. Farewell.', exitText: `${name} returns to their work.` },
        ],
      },
      trade: {
        id: 'trade',
        speaker: name,
        text: job === 'merchant' ? '"Let\'s see what you\'ve got."' : '"I\'m no merchant, but try the market."',
        options: [
          { id: 'back2', text: 'I\'ll look around.', nextNodeId: 'greet' },
          { id: 'leave3', text: 'Thanks.', exitText: `${name} nods.` },
        ],
      },
    },
  };
}

// Core NPC dialogue trees
export const DIALOGUE_TREES: Record<string, DialogueTree> = {
  mira: {
    npcId: 'mira',
    startNodeId: 'greet',
    nodes: {
      greet: {
        id: 'greet', speaker: 'Mira',
        text: 'Mira looks up from the grain sacks. "Back again? The fields don\'t tend themselves, but I\'ve a moment."',
        options: [
          { id: 'ask_village', text: 'How\'s the village?', nextNodeId: 'village' },
          { id: 'ask_bandits', text: 'Any bandit trouble?', nextNodeId: 'bandits' },
          { id: 'leave', text: 'Just passing through.', exitText: 'Mira returns to her work without a word.' },
        ],
      },
      village: {
        id: 'village', speaker: 'Mira',
        text: '"Ashenford endures. The harvest was thin last season, but we manage. We always manage."',
        options: [
          { id: 'offer_help', text: 'Need any help?', nextNodeId: 'help', effects: { reputation: { diplomacy: 2 } } },
          { id: 'back', text: 'Tell me more.', nextNodeId: 'greet' },
        ],
      },
      bandits: {
        id: 'bandits', speaker: 'Mira',
        text: '"The north road\'s been quiet lately, but I don\'t trust it. They always come back."',
        options: [
          { id: 'volunteer', text: 'I\'ll keep an eye out.', exitText: 'Mira looks grateful. "Be careful."', effects: { reputation: { conquest: 3 } } },
          { id: 'back2', text: 'Anything else?', nextNodeId: 'greet' },
        ],
      },
      help: {
        id: 'help', speaker: 'Mira',
        text: '"If you\'re handy, we could use wood for fence repairs. Bring me 5 and I\'ll make it worth your while."',
        options: [
          { id: 'accept_quest', text: 'Consider it done.', exitText: 'Mira nods firmly. "I\'ll be here."', effects: { startQuest: 'mira_fence_repair' } },
          { id: 'decline', text: 'Maybe later.', exitText: '"Suit yourself."' },
        ],
      },
    },
  },
  innkeeper_bryn: genericDialogue('innkeeper_bryn', 'Bryn', 'innkeeper'),
  guildmaster_renn: genericDialogue('guildmaster_renn', 'Guildmaster Renn', 'merchant'),
};

export function getDialogueTree(npcId: string): DialogueTree | undefined {
  return DIALOGUE_TREES[npcId];
}
