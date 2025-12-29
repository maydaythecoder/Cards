/**
 * Game screen component - renders a game using the engine.
 */

import { GameReducer } from '@/engine/core/reducer';
import { GameState } from '@/engine/core/types';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface GameScreenProps {
  gameState: GameState;
  reducer: GameReducer;
  currentPlayerId: string;
  onAction: (action: any) => void;
  renderGameBoard: (state: GameState) => React.ReactNode;
  renderActions: (state: GameState, onSelect: (action: any) => void) => React.ReactNode;
}

/**
 * Generic game screen that works with any game.
 * Delegates rendering to game-specific components.
 */
export const GameScreen: React.FC<GameScreenProps> = ({
  gameState,
  reducer,
  currentPlayerId,
  onAction,
  renderGameBoard,
  renderActions,
}) => {
  const [selectedAction, setSelectedAction] = useState<any>(null);

  const isCurrentPlayer = gameState.currentTurn.playerId === currentPlayerId;
  const validActions = reducer.getValidActions(gameState, currentPlayerId);

  const handlePlayAction = () => {
    if (!selectedAction) return;

    try {
      onAction(selectedAction);
      setSelectedAction(null);
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Game board */}
      <View style={styles.board}>{renderGameBoard(gameState)}</View>

      {/* Current player indicator */}
      <View style={styles.turnIndicator}>
        <Text style={styles.turnText}>
          Current: {gameState.players.find((p) => p.id === gameState.currentTurn.playerId)?.name}
        </Text>
        {isCurrentPlayer && <Text style={styles.yourTurnText}>YOUR TURN</Text>}
      </View>

      {/* Action buttons */}
      {isCurrentPlayer && (
        <View style={styles.actionsContainer}>
          {renderActions(gameState, setSelectedAction)}

          <Pressable
            style={[styles.playButton, !selectedAction && styles.playButtonDisabled]}
            disabled={!selectedAction}
            onPress={handlePlayAction}
          >
            <Text style={styles.playButtonText}>Play Action</Text>
          </Pressable>
        </View>
      )}

      {/* Game over */}
      {gameState.isGameOver && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverText}>Game Over!</Text>
          <Text style={styles.winnerText}>
            Winner: {gameState.players.find((p) => p.id === gameState.winner)?.name}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  board: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  turnIndicator: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    alignItems: 'center',
  },
  turnText: {
    fontSize: 16,
    fontWeight: '500',
  },
  yourTurnText: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: 'bold',
    marginTop: 4,
  },
  actionsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  playButton: {
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  playButtonDisabled: {
    backgroundColor: '#ccc',
  },
  playButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  winnerText: {
    fontSize: 20,
    color: 'white',
    marginTop: 12,
  },
});
