import { PlayerState, EchoItem } from '../types/gameState';
import { Card } from '../types/card';

export function gainEchoes(player: PlayerState, amount: number, sourceCard?: Card): PlayerState {
  const newCount = player.echoPool + amount;
  const newFragments = [...player.echoFragments];
  
  if (sourceCard && sourceCard.type === 'Spell') {
    newFragments.unshift({
      id: `echo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sourceCardName: sourceCard.name,
      spellEffectSnippet: sourceCard.description.slice(0, 45),
      costToReplay: Math.max(1, Math.floor(sourceCard.cost / 2)),
      effect: sourceCard.effects?.[0]
    });
    // Keep max 5 recent echoes
    if (newFragments.length > 5) newFragments.pop();
  }

  return {
    ...player,
    echoPool: newCount,
    echoFragments: newFragments
  };
}

export function canConsumeEchoes(player: PlayerState, cost: number): boolean {
  return player.echoPool >= cost;
}

export function consumeEchoes(player: PlayerState, cost: number): { success: boolean; newPlayer: PlayerState } {
  if (player.echoPool < cost) {
    return { success: false, newPlayer: player };
  }

  return {
    success: true,
    newPlayer: {
      ...player,
      echoPool: player.echoPool - cost,
      stats: {
        ...player.stats,
        echoesConsumed: player.stats.echoesConsumed + cost
      }
    }
  };
}
