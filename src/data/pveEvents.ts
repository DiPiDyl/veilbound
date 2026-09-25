import { NarrativeEvent } from '../types/pve';

export const PVE_EVENTS: NarrativeEvent[] = [
  {
    id: 'evt-01',
    title: 'The Whispering Monolith',
    location: 'Shattered Outer Boundary',
    narration: 'You discover an obsidian pillar vibrating with indigo luminescence. Strange whispers emanate from the stone, reciting prophecies in forgotten tongues.',
    flavorQuote: '"Knowledge has a price, traveler, but ignorance costs everything."',
    choices: [
      {
        id: 'c1',
        text: 'Touch the monolith to attune your mind.',
        outcomeDescription: 'You gain deep planar knowledge! Gain 3 Echoes and 25 Gold, but lose 4 Health.',
        effect: { gainEchoes: 3, goldChange: 25, healthChange: -4 }
      },
      {
        id: 'c2',
        text: 'Chisel away a luminous rune fragment.',
        outcomeDescription: 'You acquire a rare fragment. Gain 50 Gold.',
        effect: { goldChange: 50 }
      },
      {
        id: 'c3',
        text: 'Step away respectfully.',
        outcomeDescription: 'You take a breath and recover your vitality. Heal 6 Health.',
        effect: { healthChange: 6 }
      }
    ]
  },
  {
    id: 'evt-02',
    title: 'The Slag Pit Blacksmith',
    location: 'Ashen Outskirts',
    narration: 'A solitary blacksmith hammers away at glowing magma-iron atop a stone anvil. He does not turn his head as you approach, his hammer striking with rhythmic thunder.',
    flavorQuote: '"Steel forged in tears breaks easily. Steel forged in blood endures."',
    choices: [
      {
        id: 'c1',
        text: 'Pay 40 Gold to temper your armor.',
        outcomeDescription: 'Your vitality is hardened permanently! +8 Max Health.',
        effect: { goldChange: -40, maxHealthChange: 8, healthChange: 8 }
      },
      {
        id: 'c2',
        text: 'Sacrifice 6 Health to fuel his crucible.',
        outcomeDescription: 'The smith nods in grim approval and gifts you a rare card.',
        effect: { healthChange: -6, addRandomCard: true, cardRarityFilter: 'Rare' }
      },
      {
        id: 'c3',
        text: 'Leave him to his labor.',
        outcomeDescription: 'You continue on your path.',
        effect: {}
      }
    ]
  },
  {
    id: 'evt-03',
    title: 'The Bioluminescent Spring',
    location: 'Deep Rootsea Canopy',
    narration: 'Glowing water pools inside the hollow of a titanic petrified cypress. Bioluminescent spores drift lazily across the surface like floating stars.',
    flavorQuote: '"Drink of the earth, or drown in its embrace."',
    choices: [
      {
        id: 'c1',
        text: 'Drink deeply from the spring.',
        outcomeDescription: 'A warm surge rushes through your veins! Restore 14 Health.',
        effect: { healthChange: 14 }
      },
      {
        id: 'c2',
        text: 'Bottle the glowing spores to use as reagents.',
        outcomeDescription: 'You collect potent reagents! Gain 40 Gold and 2 Echoes.',
        effect: { goldChange: 40, gainEchoes: 2 }
      },
      {
        id: 'c3',
        text: 'Wash your face and meditate in silence.',
        outcomeDescription: 'Your mind clears. Gain 5 Max Health.',
        effect: { maxHealthChange: 5, healthChange: 5 }
      }
    ]
  },
  {
    id: 'evt-04',
    title: 'The Catacomb Altar',
    location: 'Umbral Crypt Entrance',
    narration: 'A bone altar sits adorned with silver candelabras and dried nightshade. A spectral phantom points silently toward a basin of dark liquid.',
    flavorQuote: '"The dead ask so little, yet give so lavishly."',
    choices: [
      {
        id: 'c1',
        text: 'Offer 8 of your current Health to the spirits.',
        outcomeDescription: 'The altar flares with violet flame! Obtain an Epic card and 4 Echoes.',
        effect: { healthChange: -8, addRandomCard: true, cardRarityFilter: 'Epic', gainEchoes: 4 }
      },
      {
        id: 'c2',
        text: 'Offer 35 Gold in tithe.',
        outcomeDescription: 'The spirits accept your coin. Restore 10 Health.',
        effect: { goldChange: -35, healthChange: 10 }
      },
      {
        id: 'c3',
        text: 'Overturn the unholy altar.',
        outcomeDescription: 'A cursed shockwave hits you! Lose 4 Health, but find 45 Gold hidden in the rubble.',
        effect: { healthChange: -4, goldChange: 45 }
      }
    ]
  },
  {
    id: 'evt-05',
    title: 'The Clockwork Automaton in Disrepair',
    location: 'Abandoned Orrery Chamber',
    narration: 'A massive brass clockwork knight lies slumped against the wall, its mainspring ticking weakly and cogs jammed with crystal shards.',
    flavorQuote: '"Core... integrity... failing... need... lubrication..."',
    choices: [
      {
        id: 'c1',
        text: 'Spend 30 Gold on oils and gear repair.',
        outcomeDescription: 'The automaton salutes you and awards a rare defensive card!',
        effect: { goldChange: -30, addRandomCard: true, cardRarityFilter: 'Rare' }
      },
      {
        id: 'c2',
        text: 'Salvage its brass core for scrap.',
        outcomeDescription: 'You harvest valuable mechanism parts! Gain 60 Gold.',
        effect: { goldChange: 60 }
      },
      {
        id: 'c3',
        text: 'Wind its temporal key without parts.',
        outcomeDescription: 'The clockwork springs loose, grazing you for 3 damage, but reveals a hidden treasure!',
        effect: { healthChange: -3, addTreasureId: 'tr-15' }
      }
    ]
  },
  {
    id: 'evt-06',
    title: 'The Solar Shrine',
    location: 'High Sun Peak',
    narration: 'A towering pillar of golden marble captures the midday sun, focusing heat into a radiant aura that repels the darkness of the surrounding canyons.',
    flavorQuote: '"Stand in the light, and leave no shadow behind."',
    choices: [
      {
        id: 'c1',
        text: 'Kneel and pray for celestial guidance.',
        outcomeDescription: 'Divine warmth washes over you! Fully restore your Health.',
        effect: { healthChange: 30 }
      },
      {
        id: 'c2',
        text: 'Touch the solar focal crystal with your bare hand.',
        outcomeDescription: 'The intense heat singes your fingers for 5 damage, but imparts radiant power! Gain 50 Gold and an Epic card.',
        effect: { healthChange: -5, goldChange: 50, addRandomCard: true, cardRarityFilter: 'Epic' }
      },
      {
        id: 'c3',
        text: 'Bask quietly in the warm rays.',
        outcomeDescription: 'You rest peacefully. Gain +4 Max Health.',
        effect: { maxHealthChange: 4, healthChange: 4 }
      }
    ]
  },
  {
    id: 'evt-07',
    title: 'The Wandering Planar Merchant',
    location: 'Rift Crossroad',
    narration: 'A cloaked wanderer leading a floating pack-beast laden with brass trunks waves at you. "Looking for exotic wares from beyond the Veil?"',
    choices: [
      {
        id: 'c1',
        text: 'Purchase a Mystery Treasure (60 Gold).',
        outcomeDescription: 'You purchase an exquisite curiosity!',
        effect: { goldChange: -60, addTreasureId: 'tr-01' }
      },
      {
        id: 'c2',
        text: 'Purchase a Rare Card Pack (35 Gold).',
        outcomeDescription: 'You open the sealed parcel!',
        effect: { goldChange: -35, addRandomCard: true, cardRarityFilter: 'Rare' }
      },
      {
        id: 'c3',
        text: '"Just passing through, merchant."',
        outcomeDescription: 'You bid the traveler farewell.',
        effect: {}
      }
    ]
  },
  {
    id: 'evt-08',
    title: 'The Cracked Mirror Room',
    location: 'Hall of Echoes',
    narration: 'Every surface of this hexagonal chamber is lined with cracked silver mirrors. Your reflection mimics you, but smiles when you frown.',
    choices: [
      {
        id: 'c1',
        text: 'Touch the center mirror.',
        outcomeDescription: 'Reality fractures! Shift the Veil to Fractured, gain 4 Echoes, and lose 3 Health.',
        effect: { gainEchoes: 4, healthChange: -3, shiftVeilTo: 'Fractured' }
      },
      {
        id: 'c2',
        text: 'Shatter the mirror with your weapon.',
        outcomeDescription: 'You destroy the illusion! Gain 40 Gold from polished shards.',
        effect: { goldChange: 40 }
      },
      {
        id: 'c3',
        text: 'Cover your eyes and walk through backward.',
        outcomeDescription: 'You safely navigate the perceptual maze. Gain 2 Echoes.',
        effect: { gainEchoes: 2 }
      }
    ]
  },
  {
    id: 'evt-09',
    title: 'The Starfall Crater',
    location: 'Outer Wasteland',
    narration: 'A smoking impact crater glows with celestial blue stardust. In the center lies a meteorite pulsing with cosmic energy.',
    choices: [
      {
        id: 'c1',
        text: 'Extract the radiant meteorite core.',
        outcomeDescription: 'You secure the stellar fragment! Gain an Epic treasure.',
        effect: { addTreasureId: 'tr-06', healthChange: -5 }
      },
      {
        id: 'c2',
        text: 'Scoop up glowing stardust.',
        outcomeDescription: 'The celestial dust purifies your body! Heal 12 Health.',
        effect: { healthChange: 12 }
      },
      {
        id: 'c3',
        text: 'Sell the celestial coordinates to travelers.',
        outcomeDescription: 'You pocket easy coin. Gain 45 Gold.',
        effect: { goldChange: 45 }
      }
    ]
  },
  {
    id: 'evt-10',
    title: 'The Forgotten Library Vault',
    location: 'Chronocast Archives Sub-level',
    narration: 'Shelves of leather-bound grimoires stretch into the shadows. A sealed bronze tome bears the inscription: "The First Rule of Reality."',
    choices: [
      {
        id: 'c1',
        text: 'Pry open the bronze lock.',
        outcomeDescription: 'A burst of temporal feedback zaps you for 4 damage, but you decipher ancient cards! Gain 2 Rare cards.',
        effect: { healthChange: -4, addRandomCard: true, cardRarityFilter: 'Rare' }
      },
      {
        id: 'c2',
        text: 'Read the marginalia notes left by past scholars.',
        outcomeDescription: 'You gain valuable strategic foresight! Gain 3 Echoes and 30 Gold.',
        effect: { gainEchoes: 3, goldChange: 30 }
      },
      {
        id: 'c3',
        text: 'Close the vault door and lock it.',
        outcomeDescription: 'Some secrets are best left undisturbed. Restore 6 Health.',
        effect: { healthChange: 6 }
      }
    ]
  },
  {
    id: 'evt-11',
    title: 'The Hive Queen\'s Nursery',
    location: 'Viridian Hive Subterrane',
    narration: 'You stumble into a nursery chamber lined with pulsing amber pupae. A worker insect watches you curiously, awaiting your intent.',
    choices: [
      {
        id: 'c1',
        text: 'Adopt an abandoned spore pupa.',
        outcomeDescription: 'The pupa imprints on you! Receive a living treasure.',
        effect: { addTreasureId: 'tr-10', healthChange: -2 }
      },
      {
        id: 'c2',
        text: 'Harvest royal jelly secretions.',
        outcomeDescription: 'Potent healing nectar! Restore 16 Health.',
        effect: { healthChange: 16 }
      },
      {
        id: 'c3',
        text: 'Back away slowly without sudden movements.',
        outcomeDescription: 'You escape unnoticed. Gain 20 Gold.',
        effect: { goldChange: 20 }
      }
    ]
  },
  {
    id: 'evt-12',
    title: 'The Cursed Duelist\'s Blade',
    location: 'Ruined Gladiator Arena',
    narration: 'An antique rapier is plunged hilt-deep into a stone pedestal, wrapped in rusted chains that weep black ichor.',
    choices: [
      {
        id: 'c1',
        text: 'Pull the cursed blade free with all your might.',
        outcomeDescription: 'The sword bonds to your blood! Lose 8 Health, but gain a lethal weapon treasure.',
        effect: { healthChange: -8, addTreasureId: 'tr-18' }
      },
      {
        id: 'c2',
        text: 'Purify the pedestal with sacred oils.',
        outcomeDescription: 'The dark spirits disperse into calm mist. Gain 5 Max Health.',
        effect: { maxHealthChange: 5, healthChange: 5 }
      },
      {
        id: 'c3',
        text: 'Scrap the chains for silver.',
        outcomeDescription: 'Gain 35 Gold.',
        effect: { goldChange: 35 }
      }
    ]
  }
];

export function getRandomEvent(): NarrativeEvent {
  return PVE_EVENTS[Math.floor(Math.random() * PVE_EVENTS.length)] || PVE_EVENTS[0];
}
