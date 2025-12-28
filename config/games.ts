/**
 * Game registry - metadata about each game.
 */

import { SpadesReducer } from '../engine/games/spades/reducer';
import { getSpadesPlayerView } from '../engine/games/spades/view';

export interface GameRegistry {
  id: string;
  name: string;
  playerCount: number;
  reducer: any;
  getPlayerView: (state: any, playerId: string) => any;
  initialStateFactory: (seed: number, players: any[]) => any;
}

export const GAME_REGISTRY: Record<string, GameRegistry> = {
  spades: {
    id: 'spades',
    name: 'Spades',
    playerCount: 4,
    reducer: new SpadesReducer(),
    getPlayerView: getSpadesPlayerView,
    initialStateFactory: (seed, players) => {
      const { createSpadesInitialState } = require('../engine/games/spades/initial');
      return createSpadesInitialState(seed, players);
    },
  },
  // TODO: Add poker, uno, turub
};

export function getGameRegistry(gameType: string): GameRegistry {
  const registry = GAME_REGISTRY[gameType];
  if (!registry) {
    throw new Error(`Unknown game type: ${gameType}`);
  }
  return registry;
}
