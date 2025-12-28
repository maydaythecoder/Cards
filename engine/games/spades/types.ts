/**
 * Spades game types.
 */

import { Card, GameAction, Suit } from '../../core/types';

export interface SpadesGameState {
  hands: Card[][];
  bids: Map<string, number>;
  tricks: Array<{
    winner: string;
    cards: Array<{ playerId: string; card: Card }>;
  }>;
  currentTrick: Array<{ playerId: string; card: Card }>;
  bidPhaseComplete: boolean;
  scores: Map<string, number>;
  ledSuit?: Suit;
}

export interface SpadesBidAction extends GameAction {
  type: 'placeBid';
  bid: number;
}

export interface SpadesPlayCardAction extends GameAction {
  type: 'playCard';
  cardId: string;
}

export type SpadesAction = SpadesBidAction | SpadesPlayCardAction;
