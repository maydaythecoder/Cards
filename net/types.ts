/**
 * Networking types - messages, sessions, actions.
 */

import { GameAction, Player } from '../engine/core/types';

export interface NetworkMessage {
  type: 'action' | 'sync-request' | 'sync-response' | 'ack' | 'reconnect';
  gameId: string;
  payload: any;
  timestamp: number;
  fromPlayerId: string;
  seqNum?: number;
}

export interface GameSession {
  gameId: string;
  playerId: string;
  seed: number;
  players: Player[];
  actionHistory: GameAction[];
  createdAt: number;
}

export interface SyncRequest {
  gameId: string;
  lastKnownActionIndex: number;
}

export interface SyncResponse {
  gameId: string;
  actions: GameAction[];
}
