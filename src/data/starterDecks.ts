import { Card } from '../types/card';
import { ALL_CARDS, getCardById } from './cards';

export interface DeckDefinition {
  id: string;
  name: string;
  binderId: string;
  faction: string;
  description: string;
  archetype: string;
  cardIds: string[];
}

export const STARTER_DECKS: DeckDefinition[] = [
  {
    id: 'deck-lyra-starter',
    name: 'Planar Distortion',
    binderId: 'lyra-voss',
    faction: 'Aetherbound',
    description: 'Bends reality through constant Veil shifts and cascades of spell Echoes.',
    archetype: 'Veilshift Tempo',
    cardIds: [
      'aeth-01', 'aeth-01', 'aeth-02', 'aeth-02', 'aeth-03', 'aeth-03', 'aeth-04', 'aeth-04',
      'aeth-05', 'aeth-05', 'aeth-06', 'aeth-06', 'aeth-07', 'aeth-08', 'aeth-09', 'aeth-10',
      'aeth-11', 'aeth-12', 'aeth-13', 'aeth-14', 'aeth-15', 'aeth-16', 'aeth-17', 'aeth-18',
      'neu-01', 'neu-01', 'neu-03', 'neu-05', 'neu-08', 'aeth-19'
    ]
  },
  {
    id: 'deck-kael-starter',
    name: 'Molten Bastion',
    binderId: 'kael-drake',
    faction: 'AshenCitadel',
    description: 'An impenetrable wall of molten plate and devastating counter-strikes.',
    archetype: 'Armor Control',
    cardIds: [
      'ash-01', 'ash-01', 'ash-02', 'ash-02', 'ash-03', 'ash-03', 'ash-04', 'ash-04',
      'ash-05', 'ash-05', 'ash-06', 'ash-07', 'ash-08', 'ash-08', 'ash-09', 'ash-10',
      'ash-11', 'ash-12', 'ash-13', 'ash-14', 'ash-15', 'ash-16', 'ash-17', 'ash-18',
      'neu-02', 'neu-02', 'neu-04', 'neu-10', 'neu-15', 'ash-19'
    ]
  },
  {
    id: 'deck-mira-starter',
    name: 'Canopy Swarm',
    binderId: 'mira-thorn',
    faction: 'ViridianHive',
    description: 'Overwhelms foes with self-replicating fungal spores and lethal venom.',
    archetype: 'Spore Token Swarm',
    cardIds: [
      'vir-01', 'vir-01', 'vir-02', 'vir-02', 'vir-03', 'vir-03', 'vir-04', 'vir-04',
      'vir-05', 'vir-05', 'vir-06', 'vir-07', 'vir-08', 'vir-08', 'vir-09', 'vir-10',
      'vir-11', 'vir-12', 'vir-13', 'vir-14', 'vir-15', 'vir-16', 'vir-17', 'vir-18',
      'neu-01', 'neu-03', 'neu-04', 'neu-08', 'neu-09', 'vir-19'
    ]
  },
  {
    id: 'deck-nox-starter',
    name: 'Grave Harvest',
    binderId: 'nox-revenant',
    faction: 'UmbralRemnant',
    description: 'Sacrifices friendly thralls for relentless graveyard recursion and Echo burst.',
    archetype: 'Deathrattle Sacrifice',
    cardIds: [
      'umb-01', 'umb-01', 'umb-02', 'umb-02', 'umb-03', 'umb-03', 'umb-04', 'umb-04',
      'umb-05', 'umb-05', 'umb-06', 'umb-07', 'umb-08', 'umb-09', 'umb-10', 'umb-11',
      'umb-12', 'umb-13', 'umb-14', 'umb-15', 'umb-16', 'umb-17', 'umb-18', 'umb-19',
      'neu-01', 'neu-02', 'neu-03', 'neu-06', 'neu-07', 'umb-20'
    ]
  },
  {
    id: 'deck-orin-starter',
    name: 'Clockwork Orrery',
    binderId: 'orin-vale',
    faction: 'ChronocastArchive',
    description: 'Forecasts upcoming turns and executes unstoppable delayed rituals.',
    archetype: 'Ritual Countdown',
    cardIds: [
      'chr-01', 'chr-01', 'chr-02', 'chr-02', 'chr-03', 'chr-03', 'chr-04', 'chr-04',
      'chr-05', 'chr-05', 'chr-06', 'chr-07', 'chr-08', 'chr-09', 'chr-10', 'chr-11',
      'chr-12', 'chr-13', 'chr-14', 'chr-15', 'chr-16', 'chr-17', 'chr-18', 'chr-19',
      'neu-02', 'neu-03', 'neu-06', 'neu-10', 'neu-15', 'chr-20'
    ]
  },
  {
    id: 'deck-seraphine-starter',
    name: 'Solar Ascension',
    binderId: 'seraphine-starforged',
    faction: 'AstralAscendancy',
    description: 'Sustains through radiant divine shields and summons awe-inspiring celestial champions.',
    archetype: 'Celestial Ramp & Shield',
    cardIds: [
      'ast-01', 'ast-01', 'ast-02', 'ast-02', 'ast-03', 'ast-03', 'ast-04', 'ast-04',
      'ast-05', 'ast-05', 'ast-06', 'ast-07', 'ast-08', 'ast-09', 'ast-10', 'ast-11',
      'ast-12', 'ast-13', 'ast-14', 'ast-15', 'ast-16', 'ast-17', 'ast-18', 'ast-19',
      'neu-02', 'neu-03', 'neu-09', 'neu-10', 'neu-14', 'ast-20'
    ]
  }
];

export function getDeckCards(deck: DeckDefinition): Card[] {
  const cards: Card[] = [];
  for (const id of deck.cardIds) {
    const c = getCardById(id);
    if (c) cards.push({ ...c });
  }
  return cards;
}
