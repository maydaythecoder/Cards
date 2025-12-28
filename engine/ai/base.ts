/**
 * Base AI interface and implementations.
 */

import { GameState, GameAction } from '../core/types';
import { GameReducer } from '../core/reducer';

export abstract class AIPlayer {
  protected reducer: GameReducer<any>;
  protected playerId: string;

  constructor(reducer: GameReducer<any>, playerId: string) {
    this.reducer = reducer;
    this.playerId = playerId;
  }

  abstract getAction(playerView: GameState): Promise<GameAction>;
}

export class SimpleRuleBasedAI extends AIPlayer {
  async getAction(playerView: GameState): Promise<GameAction> {
    const legalActions = this.reducer.getValidActions(playerView, this.playerId);

    if (legalActions.length === 0) {
      throw new Error(`No legal actions for player ${this.playerId}`);
    }

    return this.selectBestAction(playerView, legalActions);
  }

  protected selectBestAction(
    state: GameState,
    legalActions: GameAction[]
  ): GameAction {
    return legalActions[Math.floor(Math.random() * legalActions.length)];
  }
}

export class SpadesAI extends SimpleRuleBasedAI {
  protected selectBestAction(
    state: GameState,
    legalActions: GameAction[]
  ): GameAction {
    const gs = state.gameState as any;

    if (legalActions[0].type === 'placeBid') {
      const playerIndex = state.players.findIndex((p) => p.id === this.playerId);
      const hand = gs.hands[playerIndex];
      const spadeCount = hand.filter((c: any) => c.suit === 'S').length;
      const bid = Math.max(1, Math.min(spadeCount, 13));

      return {
        ...legalActions[0],
        bid,
      };
    }

    return legalActions[0];
  }
}

export class UnoAI extends SimpleRuleBasedAI {
  protected selectBestAction(
    state: GameState,
    legalActions: GameAction[]
  ): GameAction {
    return legalActions[Math.floor(Math.random() * legalActions.length)];
  }
}

export class PokerAI extends SimpleRuleBasedAI {
  protected selectBestAction(
    state: GameState,
    legalActions: GameAction[]
  ): GameAction {
    const passAction = legalActions.find((a) => a.type === 'check' || a.type === 'fold');
    return passAction || legalActions[0];
  }
}
