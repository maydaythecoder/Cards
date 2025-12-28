import { Card, GameState } from '../../core/types';
import { PokerGameState } from './types';

export function getPokerPlayerView(
  state: GameState<PokerGameState>,
  viewingPlayerId: string
): GameState<PokerGameState> {
  const gs = state.gameState;
  const filteredHands = new Map<string, Card[]>();

  for (const [playerId, cards] of gs.hands) {
    if (playerId === viewingPlayerId) {
      filteredHands.set(playerId, cards);
    } else {
      if (gs.bettingRound === 'showdown') {
        filteredHands.set(playerId, cards);
      } else {
        filteredHands.set(playerId, Array(cards.length).fill({ hidden: true } as any));
      }
    }
  }

  return {
    ...state,
    gameState: {
      ...gs,
      hands: filteredHands,
    },
  };
}
