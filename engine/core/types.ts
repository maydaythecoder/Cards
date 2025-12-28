/**
 * Core type definitions for the game engine.
 * These types are shared across all games.
 */

export enum Suit {
  Hearts = 'H',
  Diamonds = 'D',
  Clubs = 'C',
  Spades = 'S',
}

export enum Rank {
  Ace = 'A',
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
  Ten = 'T',
  Jack = 'J',
  Queen = 'Q',
  King = 'K',
}

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export interface GameAction {
  type: string;
  playerId: string;
  timestamp: number;
  gameId: string;
  seqNum?: number;
}

export interface Player {
  id: string;
  name: string;
  isAI: boolean;
  isLocal: boolean;
  isConnected: boolean;
}

export interface HouseRules {
  allowUndoTurns?: boolean;
  spectatorMode?: boolean;
  chatEnabled?: boolean;
  [key: string]: any;
}

export interface GameState<T extends Record<string, any> = any> {
  gameId: string;
  gameType: 'spades' | 'poker' | 'turub' | 'uno';
  seed: number;
  players: Player[];
  actionHistory: GameAction[];
  createdAt: number;
  houseRules: HouseRules;
  currentTurn: {
    playerId: string;
    validActions: GameAction[];
  };
  gameState: T;
  isGameOver: boolean;
  winner?: string;
}
