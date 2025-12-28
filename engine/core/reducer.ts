/**
 * Base reducer class - all game reducers extend this.
 */

import { GameAction, GameState, Player } from './types';

export abstract class GameReducer<T extends GameState = GameState> {
  abstract applyAction(state: T, action: GameAction): T;
  abstract getValidActions(state: T, playerId: string): GameAction[];
  abstract isGameOver(state: T): boolean;
  abstract getWinner(state: T): string | undefined;
  abstract initialState(seed: number, players: Player[]): T;

  reduce(state: T, action: GameAction): T {
    const validActions = this.getValidActions(state, action.playerId);
    const isValid = validActions.some((a) => this.actionsEqual(a, action));

    if (!isValid) {
      throw new Error(`Invalid action: ${action.type} for player ${action.playerId}`);
    }

    let newState = this.applyAction(state, action);

    newState = {
      ...newState,
      actionHistory: [...state.actionHistory, action],
      isGameOver: this.isGameOver(newState),
      winner: this.getWinner(newState),
    } as T;

    return newState;
  }

  rebuild(seed: number, players: Player[], actions: GameAction[]): T {
    let state = this.initialState(seed, players);

    for (const action of actions) {
      state = this.applyAction(state, action);
    }

    state = {
      ...state,
      actionHistory: actions,
      isGameOver: this.isGameOver(state),
      winner: this.getWinner(state),
    } as T;

    return state;
  }

  protected actionsEqual(a: GameAction, b: GameAction): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }
}
