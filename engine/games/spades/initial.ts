/**
 * Spades initial state generator.
 */

import { GameState, Player } from '../../core/types';
import { SeededRNG } from '../../core/random';
import { Deck } from '../../shared/deck';
import { SpadesGameState } from './types';

export function createSpadesInitialState(
  seed: number,
  players: Player[]
): GameState<SpadesGameState> {
  if (players.length !== 4) {
    throw new Error('Spades requires exactly 4 players');
  }

  const rng = new SeededRNG(seed);
  const deck = Deck.standard();
  const shuffled = rng.shuffle(deck);

  const hands: typeof shuffled[] = [];
  for (let i = 0; i < 4; i++) {
    hands.push(shuffled.slice(i * 13, (i + 1) * 13));
  }

  const playerIds = players.map((p) => p.id);

  return {
    gameId: `spades_${Date.now()}_${seed}`,
    gameType: 'spades',
    seed,
    players,
    actionHistory: [],
    createdAt: Date.now(),
    houseRules: {},
    currentTurn: {
      playerId: players[0].id,
      validActions: [],
    },
    gameState: {
      hands,
      bids: new Map(),
      tricks: [],
      currentTrick: [],
      bidPhaseComplete: false,
      scores: new Map(playerIds.map((id) => [id, 0])),
    },
    isGameOver: false,
  };
}
