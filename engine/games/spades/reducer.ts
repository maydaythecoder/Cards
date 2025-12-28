/**
 * Spades reducer - core game logic.
 */

import { GameAction, GameState, Player, Suit } from '../../core/types';
import { GameReducer } from '../../core/reducer';
import { SpadesGameState, SpadesBidAction, SpadesPlayCardAction } from './types';
import { createSpadesInitialState } from './initial';

export class SpadesReducer extends GameReducer<GameState<SpadesGameState>> {
  applyAction(
    state: GameState<SpadesGameState>,
    action: GameAction
  ): GameState<SpadesGameState> {
    const gs = state.gameState;

    if (action.type === 'placeBid') {
      const bidAction = action as unknown as SpadesBidAction;
      const playerIndex = state.players.findIndex((p) => p.id === action.playerId);

      const newBids = new Map(gs.bids);
      newBids.set(action.playerId, bidAction.bid);

      const bidPhaseComplete = newBids.size === state.players.length;

      return {
        ...state,
        gameState: {
          ...gs,
          bids: newBids,
          bidPhaseComplete,
        },
        currentTurn: {
          playerId: this.getNextPlayer(state, playerIndex),
          validActions: [],
        },
      };
    }

    if (action.type === 'playCard') {
      const playAction = action as unknown as SpadesPlayCardAction;
      const playerIndex = state.players.findIndex((p) => p.id === action.playerId);

      const newHands = gs.hands.map((hand, idx) => {
        if (idx === playerIndex) {
          return hand.filter((c) => c.id !== playAction.cardId);
        }
        return hand;
      });

      const card = gs.hands[playerIndex].find((c) => c.id === playAction.cardId)!;
      const newTrick = [...gs.currentTrick, { playerId: action.playerId, card }];

      let newTricks = gs.tricks;
      let newCurrentTrick = newTrick;
      let nextPlayerId = this.getNextPlayer(state, playerIndex);

      if (newTrick.length === 4) {
        const trickWinner = this.determineTrickWinner(newTrick, gs.ledSuit);
        newTricks = [
          ...gs.tricks,
          {
            winner: trickWinner,
            cards: newTrick,
          },
        ];
        newCurrentTrick = [];
        nextPlayerId = trickWinner;
      }

      return {
        ...state,
        gameState: {
          ...gs,
          hands: newHands,
          currentTrick: newCurrentTrick,
          tricks: newTricks,
          ledSuit: newTrick.length === 1 ? card.suit : gs.ledSuit,
        },
        currentTurn: {
          playerId: nextPlayerId,
          validActions: [],
        },
      };
    }

    return state;
  }

  getValidActions(
    state: GameState<SpadesGameState>,
    playerId: string
  ): GameAction[] {
    const gs = state.gameState;
    const playerIndex = state.players.findIndex((p) => p.id === playerId);

    if (!gs.bidPhaseComplete && !gs.bids.has(playerId)) {
      return Array.from({ length: 14 }, (_, i) => ({
        type: 'placeBid',
        bid: i,
        playerId,
        timestamp: Date.now(),
        gameId: state.gameId,
      })) as any[];
    }

    const hand = gs.hands[playerIndex];
    if (hand.length === 0) {
      return [];
    }

    return hand.map((card) => ({
      type: 'playCard',
      cardId: card.id,
      playerId,
      timestamp: Date.now(),
      gameId: state.gameId,
    })) as any[];
  }

  isGameOver(state: GameState<SpadesGameState>): boolean {
    return state.gameState.tricks.length === 13;
  }

  getWinner(state: GameState<SpadesGameState>): string | undefined {
    if (!this.isGameOver(state)) return undefined;

    const scores = new Map<string, number>();
    for (const player of state.players) {
      scores.set(player.id, 0);
    }

    for (const trick of state.gameState.tricks) {
      const winnerScore = scores.get(trick.winner) || 0;
      scores.set(trick.winner, winnerScore + 1);
    }

    let winner = state.players[0].id;
    let maxTricks = scores.get(winner) || 0;

    for (const [playerId, tricks] of scores) {
      if (tricks > maxTricks) {
        maxTricks = tricks;
        winner = playerId;
      }
    }

    return winner;
  }

  initialState(seed: number, players: Player[]): GameState<SpadesGameState> {
    return createSpadesInitialState(seed, players);
  }

  private getNextPlayer(state: GameState<SpadesGameState>, currentIndex: number): string {
    return state.players[(currentIndex + 1) % state.players.length].id;
  }

  private determineTrickWinner(
    trick: Array<{ playerId: string; card: any }>,
    ledSuit: Suit | undefined
  ): string {
    let winner = trick[0];
    let highestSpade = -1;

    for (const play of trick) {
      if (play.card.suit === Suit.Spades) {
        const rankValue = this.getRankValue(play.card.rank);
        if (rankValue > highestSpade) {
          highestSpade = rankValue;
          winner = play;
        }
      } else if (play.card.suit === ledSuit && highestSpade === -1) {
        const rankValue = this.getRankValue(play.card.rank);
        const winnerValue = this.getRankValue(winner.card.rank);
        if (rankValue > winnerValue) {
          winner = play;
        }
      }
    }

    return winner.playerId;
  }

  private getRankValue(rank: string): number {
    const values: Record<string, number> = {
      A: 14,
      K: 13,
      Q: 12,
      J: 11,
      T: 10,
      9: 9,
      8: 8,
      7: 7,
      6: 6,
      5: 5,
      4: 4,
      3: 3,
      2: 2,
    };
    return values[rank] || 0;
  }
}
