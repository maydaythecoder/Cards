/**
 * Session manager - handles reconnection and action validation.
 */

import { GameAction, GameState } from '../engine/core/types';
import { GameReducer } from '../engine/core/reducer';
import { GameSession } from './types';

export class SessionManager {
  private session: GameSession;
  private reducer: GameReducer<any>;

  constructor(session: GameSession, reducer: GameReducer<any>) {
    this.session = session;
    this.reducer = reducer;
  }

  validateIncomingAction(action: GameAction): boolean {
    const state = this.getCurrentState();
    const validActions = this.reducer.getValidActions(state, action.playerId);
    return validActions.some((a) => this.actionsEqual(a, action));
  }

  async handleReconnection(newActions: GameAction[]): Promise<GameState> {
    const allActions = [...this.session.actionHistory, ...newActions];

    const state = this.reducer.rebuild(
      this.session.seed,
      this.session.players,
      allActions
    );

    this.session.actionHistory = allActions;

    return state;
  }

  addAction(action: GameAction): void {
    this.session.actionHistory.push(action);
  }

  getCurrentState(): GameState {
    return this.reducer.rebuild(
      this.session.seed,
      this.session.players,
      this.session.actionHistory
    );
  }

  getSession(): GameSession {
    return this.session;
  }

  private actionsEqual(a: GameAction, b: GameAction): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }
}
