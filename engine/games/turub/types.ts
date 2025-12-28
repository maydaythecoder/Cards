import { Card, GameAction } from '../../core/types';

export interface TurubGameState {
  hands: Card[][];
  bids: Map<string, number>;
  tricks: Array<{
    winner: string;
    cards: Array<{ playerId: string; card: Card }>;
  }>;
  currentTrick: Array<{ playerId: string; card: Card }>;
  bidPhaseComplete: boolean;
  scores: Map<string, number>;
  trump: Card['suit'];
}

export interface TurubBidAction extends GameAction {
  type: 'placeBid';
  bid: number;
}

export interface TurubPlayCardAction extends GameAction {
  type: 'playCard';
  cardId: string;
}

export type TurubAction = TurubBidAction | TurubPlayCardAction;
