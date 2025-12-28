import { Card, GameAction } from '../../core/types';

export interface PokerGameState {
  hands: Map<string, Card[]>;
  communityCards: Card[];
  bettingRound: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  pot: number;
  currentBet: number;
  bets: Map<string, number>;
  folded: Set<string>;
  smallBlind: string;
  bigBlind: string;
  dealer: string;
  deck: Card[];
}

export interface PokerBetAction extends GameAction {
  type: 'bet' | 'call' | 'check' | 'raise' | 'fold' | 'allIn';
  amount?: number;
}

export enum HandRank {
  HighCard = 0,
  OnePair = 1,
  TwoPair = 2,
  ThreeOfAKind = 3,
  Straight = 4,
  Flush = 5,
  FullHouse = 6,
  FourOfAKind = 7,
  StraightFlush = 8,
  RoyalFlush = 9,
}
