import { GameAction } from '../../core/types';

export interface UnoCard {
  id: string;
  color: 'red' | 'yellow' | 'green' | 'blue' | 'black';
  value: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';
}

export interface UnoGameState {
  hands: Map<string, UnoCard[]>;
  deck: UnoCard[];
  discardPile: UnoCard[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  canPlayCard: boolean;
  drewCard: boolean;
}

export interface UnoPlayAction extends GameAction {
  type: 'playCard';
  cardId: string;
  chosenColor?: string;
}

export interface UnoDrawAction extends GameAction {
  type: 'drawCard';
}

export type UnoAction = UnoPlayAction | UnoDrawAction;
