import { ExpeditionRun, ExpeditionNode, NodeType } from '../types/pve';
import { Binder } from '../types/binder';
import { Card } from '../types/card';
import { getRandomEnemy, PVE_ENEMIES } from '../data/pveEnemies';
import { getRandomEvent } from '../data/pveEvents';
import { getRandomTreasures } from '../data/pveTreasures';

export function createNewExpedition(binder: Binder, startingDeck: Card[]): ExpeditionRun {
  const nodes: ExpeditionNode[] = [];

  // Generate 6 Steps
  // Step 1: 2 Combat choices
  nodes.push(
    {
      id: 'node-1-a',
      tier: 1,
      step: 1,
      type: 'Combat',
      title: 'Scout Encounter',
      description: 'A wandering patrol of the outer ruins.',
      connectedToIds: ['node-2-a', 'node-2-b'],
      isCompleted: false,
      isCurrent: true,
      isAvailable: true,
      enemy: getRandomEnemy(false, false)
    },
    {
      id: 'node-1-b',
      tier: 1,
      step: 1,
      type: 'Combat',
      title: 'Frontier Skirmish',
      description: 'Hostile wildlife corrupted by planar leaks.',
      connectedToIds: ['node-2-a', 'node-2-b'],
      isCompleted: false,
      isCurrent: false,
      isAvailable: true,
      enemy: getRandomEnemy(false, false)
    }
  );

  // Step 2: Event or Merchant
  nodes.push(
    {
      id: 'node-2-a',
      tier: 1,
      step: 2,
      type: 'Event',
      title: 'Whispering Chamber',
      description: 'An ancient narrative crossroad.',
      connectedToIds: ['node-3-a', 'node-3-b'],
      isCompleted: false,
      isCurrent: false,
      isAvailable: false,
      event: getRandomEvent()
    },
    {
      id: 'node-2-b',
      tier: 1,
      step: 2,
      type: 'Merchant',
      title: 'Planar Bazaar',
      description: 'A traveling peddler selling rare curiosities.',
      connectedToIds: ['node-3-a', 'node-3-b'],
      isCompleted: false,
      isCurrent: false,
      isAvailable: false,
      treasuresOffered: getRandomTreasures(3)
    }
  );

  // Step 3: Elite or Combat
  nodes.push(
    {
      id: 'node-3-a',
      tier: 2,
      step: 3,
      type: 'Elite',
      title: 'Elite Guardian',
      description: 'A heavily armored planar terror with heightened rewards.',
      connectedToIds: ['node-4-a'],
      isCompleted: false,
      isCurrent: false,
      isAvailable: false,
      enemy: getRandomEnemy(true, false)
    },
    {
      id: 'node-3-b',
      tier: 2,
      step: 3,
      type: 'Combat',
      title: 'Vanguard Ambush',
      description: 'A reinforced garrison defending the pass.',
      connectedToIds: ['node-4-a'],
      isCompleted: false,
      isCurrent: false,
      isAvailable: false,
      enemy: getRandomEnemy(false, false)
    }
  );

  // Step 4: Treasure Chamber
  nodes.push({
    id: 'node-4-a',
    tier: 2,
    step: 4,
    type: 'Treasure',
    title: 'The Gilded Vault',
    description: 'An undisturbed reliquary chest brimming with ancient artifacts.',
    connectedToIds: ['node-5-a', 'node-5-b'],
    isCompleted: false,
    isCurrent: false,
    isAvailable: false,
    treasuresOffered: getRandomTreasures(3)
  });

  // Step 5: Rift or Event
  nodes.push(
    {
      id: 'node-5-a',
      tier: 3,
      step: 5,
      type: 'Rift',
      title: 'Reality Fracture',
      description: 'A swirling cosmic vortex that bestows massive planar echoes.',
      connectedToIds: ['node-6-boss'],
      isCompleted: false,
      isCurrent: false,
      isAvailable: false,
      event: getRandomEvent()
    },
    {
      id: 'node-5-b',
      tier: 3,
      step: 5,
      type: 'Merchant',
      title: 'Final Outpost',
      description: 'Prepare your deck before facing the lord of this realm.',
      connectedToIds: ['node-6-boss'],
      isCompleted: false,
      isCurrent: false,
      isAvailable: false,
      treasuresOffered: getRandomTreasures(3)
    }
  );

  // Step 6: Major Boss
  const bosses = PVE_ENEMIES.filter(e => e.isBoss);
  const randomBoss = bosses[Math.floor(Math.random() * bosses.length)] || bosses[0];
  nodes.push({
    id: 'node-6-boss',
    tier: 3,
    step: 6,
    type: 'Boss',
    title: `ARCHON: ${randomBoss.name}`,
    description: randomBoss.customMechanicDescription,
    connectedToIds: [],
    isCompleted: false,
    isCurrent: false,
    isAvailable: false,
    enemy: randomBoss
  });

  return {
    id: `exp-${Date.now()}`,
    binder,
    deck: [...startingDeck],
    currentHealth: binder.startingHealth,
    maxHealth: binder.maxHealth,
    gold: 75,
    essence: 40,
    treasures: [],
    nodes,
    currentNodeId: 'node-1-a',
    stepIndex: 1,
    status: 'active',
    battlesWon: 0,
    elitesDefeated: 0
  };
}
