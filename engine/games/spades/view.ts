/**
 * Spades player view - no hidden information in Spades.
 */

import { GameState } from '../../core/types';
import { SpadesGameState } from './types';

export function getSpadesPlayerView(
  state: GameState<SpadesGameState>,
  viewingPlayerId: string
): GameState<SpadesGameState> {
  return state;
}
