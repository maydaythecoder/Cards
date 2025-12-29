/**
 * Custom hook for game state management.
 * Coordinates engine, local state, and networking.
 */

import { GameReducer } from '@/engine/core/reducer';
import { GameAction, GameState } from '@/engine/core/types';
import { useCallback, useState } from 'react';

export function useGameState(
  initialState: GameState,
  reducer: GameReducer,
  onAction?: (action: GameAction) => Promise<void>
) {
  const [state, setState] = useState<GameState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const applyAction = useCallback(
    async (action: GameAction) => {
      setIsProcessing(true);
      try {
        // Validate action
        const validActions = reducer.getValidActions(state, action.playerId);
        const isValid = validActions.some(
          (a) => JSON.stringify(a) === JSON.stringify(action)
        );

        if (!isValid) {
          throw new Error(`Invalid action: ${action.type}`);
        }

        // Apply to local state
        const newState = reducer.reduce(state, action);
        setState(newState);

        // Broadcast to other players
        if (onAction) {
          await onAction(action);
        }

        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [state, reducer, onAction]
  );

  /**
   * Handle incoming action from network.
   */
  const receiveAction = useCallback(
    (action: GameAction) => {
      try {
        const newState = reducer.reduce(state, action);
        setState(newState);
      } catch (err) {
        console.error('Failed to apply remote action:', err);
      }
    },
    [state, reducer]
  );

  return {
    state,
    applyAction,
    receiveAction,
    error,
    isProcessing,
  };
}
