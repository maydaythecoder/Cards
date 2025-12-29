/**
 * Spades Game Screen - Complete working example
 * Demonstrates:
 * - Game engine integration
 * - Real-time state management
 * - Player turn handling
 * - Card selection and play
 */

import { GameState, Player } from '@/engine/core/types';
import { createSpadesInitialState } from '@/engine/games/spades/initial';
import { SpadesReducer } from '@/engine/games/spades/reducer';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { CardComponent } from '../components/Card/Card';
import { CardHand } from '../components/Card/CardHand';
import { useTableLayout } from '../hooks/useTableLayout';

export interface SpadesGameScreenProps {
  playerId: string;
  onGameEnd?: (winnerId: string) => void;
}

/**
 * Complete Spades game implementation using engine.
 */
export const SpadesGameScreen: React.FC<SpadesGameScreenProps> = ({
  playerId,
  onGameEnd,
}) => {
  // Initialize game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedBid, setSelectedBid] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [gamePhase, setGamePhase] = useState<'setup' | 'bidding' | 'playing' | 'over'>(
    'setup'
  );

  const reducer = new SpadesReducer();
  const { positions } = useTableLayout(4);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, []);

  // Monitor game state changes
  useEffect(() => {
    if (!gameState) return;

    if (gameState.isGameOver) {
      setGamePhase('over');
      onGameEnd?.(gameState.winner || '');
    } else if (gameState.gameState.bidPhaseComplete) {
      setGamePhase('playing');
    } else {
      setGamePhase('bidding');
    }
  }, [gameState]);

  const initializeGame = () => {
    try {
      const players: Player[] = [
        { id: 'p1', name: 'Alice', isAI: false, isLocal: true, isConnected: true },
        { id: 'p2', name: 'Bob', isAI: false, isLocal: true, isConnected: true },
        { id: 'p3', name: 'Charlie', isAI: false, isLocal: true, isConnected: true },
        { id: 'p4', name: 'Diana', isAI: false, isLocal: true, isConnected: true },
      ];

      const seed = Math.floor(Math.random() * 1000000);
      const initialState = createSpadesInitialState(seed, players);
      setGameState(initialState);
      setError('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to initialize game';
      setError(msg);
    }
  };

  const handlePlaceBid = (bid: number) => {
    if (!gameState || gameState.currentTurn.playerId !== playerId) {
      setError('Not your turn to bid');
      return;
    }

    try {
      const action = {
        type: 'placeBid',
        bid,
        playerId,
        timestamp: Date.now(),
        gameId: gameState.gameId,
      };

      const newState = reducer.reduce(gameState, action);
      setGameState(newState);
      setSelectedBid(null);
      setError('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid bid';
      setError(msg);
    }
  };

  const handlePlayCard = () => {
    if (!gameState || !selectedCardId) {
      setError('Select a card to play');
      return;
    }

    if (gameState.currentTurn.playerId !== playerId) {
      setError('Not your turn');
      return;
    }

    try {
      const action = {
        type: 'playCard',
        cardId: selectedCardId,
        playerId,
        timestamp: Date.now(),
        gameId: gameState.gameId,
      };

      const newState = reducer.reduce(gameState, action);
      setGameState(newState);
      setSelectedCardId(null);
      setError('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Cannot play that card';
      setError(msg);
    }
  };

  if (!gameState) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Initializing game...</Text>
      </View>
    );
  }

  const currentPlayer = gameState.players.find((p) => p.id === gameState.currentTurn.playerId);
  const myPlayer = gameState.players.find((p) => p.id === playerId);
  const playerIndex = gameState.players.findIndex((p) => p.id === playerId);
  const myHand = gameState.gameState.hands[playerIndex] || [];
  const isMyTurn = gameState.currentTurn.playerId === playerId;
  const biddingPhase = !gameState.gameState.bidPhaseComplete;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Spades</Text>
        <Text style={styles.phase}>
          {gamePhase === 'bidding' && '📝 Bidding Phase'}
          {gamePhase === 'playing' && '🃏 Playing Phase'}
          {gamePhase === 'over' && '🏆 Game Over'}
        </Text>
      </View>

      {/* Game board - show other players' cards */}
      <View style={styles.board}>
        <View style={styles.tableContainer}>
          {/* Center of table - current trick */}
          <View style={styles.centerTable}>
            <Text style={styles.centerText}>Current Trick</Text>
            <View style={styles.trickCards}>
              {gameState.gameState.currentTrick.length > 0 ? (
                gameState.gameState.currentTrick.map((play, idx) => (
                  <View key={idx} style={styles.trickedCard}>
                    <CardComponent
                      card={play.card}
                      size="small"
                      disabled
                    />
                    <Text style={styles.trickPlayerName}>
                      {gameState.players.find((p) => p.id === play.playerId)?.name}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Waiting for plays...</Text>
              )}
            </View>

            {/* Bids display */}
            {biddingPhase && (
              <View style={styles.bidsContainer}>
                <Text style={styles.bidsTitle}>Bids</Text>
                {gameState.players.map((p) => {
                  const bid = gameState.gameState.bids.get(p.id);
                  return (
                    <Text key={p.id} style={styles.bidLine}>
                      {p.name}: {bid !== undefined ? bid : '—'}
                    </Text>
                  );
                })}
              </View>
            )}

            {/* Tricks summary */}
            {!biddingPhase && (
              <View style={styles.tricksContainer}>
                <Text style={styles.tricksTitle}>Tricks Won</Text>
                {gameState.players.map((p) => {
                  const tricks = gameState.gameState.tricks.filter(
                    (t) => t.winner === p.id
                  ).length;
                  return (
                    <Text key={p.id} style={styles.trickLine}>
                      {p.name}: {tricks}
                    </Text>
                  );
                })}
              </View>
            )}
          </View>

          {/* Other players around table */}
          {gameState.players
            .filter((p) => p.id !== playerId)
            .map((player) => {
              const pos = positions.get(`player_${gameState.players.indexOf(player)}`);
              if (!pos) return null;

              const otherPlayerIndex = gameState.players.indexOf(player);
              const otherHand = gameState.gameState.hands[otherPlayerIndex];

              return (
                <View
                  key={player.id}
                  style={[
                    styles.playerSeat,
                    {
                      left: pos.x - 40,
                      top: pos.y - 60,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.playerName,
                      isMyTurn && gameState.currentTurn.playerId === player.id
                        ? styles.currentPlayerName
                        : undefined,
                    ]}
                  >
                    {player.name}
                  </Text>
                  <View style={styles.handCount}>
                    <Text style={styles.handCountText}>{otherHand.length} 🃏</Text>
                  </View>

                  {biddingPhase && gameState.gameState.bids.has(player.id) && (
                    <View style={styles.bidBadge}>
                      <Text style={styles.bidBadgeText}>
                        Bid: {gameState.gameState.bids.get(player.id)}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
        </View>
      </View>

      {/* Current turn info */}
      <View style={styles.turnInfo}>
        <Text style={styles.turnText}>
          Current Turn: <Text style={styles.turnPlayerName}>{currentPlayer?.name}</Text>
        </Text>
        {isMyTurn && (
          <Text style={styles.yourTurnText}>👉 YOUR TURN</Text>
        )}
      </View>

      {/* Action panel */}
      <View style={styles.actionPanel}>
        {biddingPhase && isMyTurn && (
          <View>
            <Text style={styles.actionTitle}>Place Your Bid (0-13)</Text>
            <View style={styles.bidButtons}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Array.from({ length: 14 }, (_, i) => i).map((bid) => (
                  <Pressable
                    key={bid}
                    style={[
                      styles.bidButton,
                      selectedBid === bid && styles.bidButtonSelected,
                    ]}
                    onPress={() => setSelectedBid(bid)}
                  >
                    <Text
                      style={[
                        styles.bidButtonText,
                        selectedBid === bid && styles.bidButtonTextSelected,
                      ]}
                    >
                      {bid}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <Pressable
              style={[styles.playButton, !selectedBid && styles.playButtonDisabled]}
              disabled={selectedBid === null}
              onPress={() => handlePlaceBid(selectedBid!)}
            >
              <Text style={styles.playButtonText}>Bid {selectedBid}</Text>
            </Pressable>
          </View>
        )}

        {!biddingPhase && isMyTurn && (
          <View>
            <Text style={styles.actionTitle}>Play a Card</Text>
            <Pressable
              style={[styles.playButton, !selectedCardId && styles.playButtonDisabled]}
              disabled={!selectedCardId}
              onPress={handlePlayCard}
            >
              <Text style={styles.playButtonText}>Play Card</Text>
            </Pressable>
          </View>
        )}

        {!isMyTurn && (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>
              Waiting for {currentPlayer?.name}...
            </Text>
          </View>
        )}
      </View>

      {/* My hand */}
      <View style={styles.handContainer}>
        <Text style={styles.handTitle}>My Hand ({myHand.length})</Text>
        <CardHand
          cards={myHand}
          selectedCardIds={selectedCardId ? [selectedCardId] : []}
          onSelectCard={(card) => setSelectedCardId(card.id)}
          size="medium"
        />
      </View>

      {/* Error display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => setError('')}>
            <Text style={styles.errorDismiss}>Dismiss</Text>
          </Pressable>
        </View>
      )}

      {/* Game over overlay */}
      {gameState.isGameOver && (
        <View style={styles.gameOverOverlay}>
          <View style={styles.gameOverContent}>
            <Text style={styles.gameOverTitle}>Game Over!</Text>
            <Text style={styles.gameOverText}>
              Winner: {gameState.players.find((p) => p.id === gameState.winner)?.name}
            </Text>
            <Pressable style={styles.restartButton} onPress={initializeGame}>
              <Text style={styles.restartButtonText}>Play Again</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a5f34',
  },
  header: {
    padding: 16,
    backgroundColor: '#0d3d1f',
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  phase: {
    fontSize: 14,
    color: '#b3e5b3',
    marginTop: 4,
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  board: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableContainer: {
    width: Dimensions.get('window').width - 40,
    height: 300,
    position: 'relative',
  },
  centerTable: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -80,
    marginLeft: -100,
    width: 200,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  centerText: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  trickCards: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 12,
  },
  trickedCard: {
    alignItems: 'center',
  },
  trickPlayerName: {
    color: '#fff',
    fontSize: 10,
    marginTop: 4,
  },
  emptyText: {
    color: '#ccc',
    fontSize: 12,
  },
  bidsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#fff',
  },
  bidsTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bidLine: {
    color: '#b3e5b3',
    fontSize: 12,
  },
  tricksContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#fff',
  },
  tricksTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  trickLine: {
    color: '#b3e5b3',
    fontSize: 12,
  },
  playerSeat: {
    position: 'absolute',
    alignItems: 'center',
  },
  playerName: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  currentPlayerName: {
    color: '#ffeb3b',
    fontSize: 14,
  },
  handCount: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  handCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  bidBadge: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bidBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  turnInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
  },
  turnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  turnPlayerName: {
    color: '#ffeb3b',
    fontWeight: 'bold',
  },
  yourTurnText: {
    color: '#4ade80',
    marginTop: 4,
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionPanel: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#fff',
  },
  actionTitle: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 12,
  },
  bidButtons: {
    marginBottom: 12,
    height: 40,
  },
  bidButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#0066cc',
  },
  bidButtonSelected: {
    backgroundColor: '#ffeb3b',
    borderColor: '#fff',
  },
  bidButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  bidButtonTextSelected: {
    color: '#000',
  },
  playButton: {
    backgroundColor: '#4ade80',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  playButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  playButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  waitingContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  waitingText: {
    color: '#b3e5b3',
    fontSize: 14,
    fontStyle: 'italic',
  },
  handContainer: {
    backgroundColor: '#0d3d1f',
    borderTopWidth: 2,
    borderTopColor: '#fff',
    padding: 12,
    maxHeight: 160,
  },
  handTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    flex: 1,
    marginRight: 12,
  },
  errorDismiss: {
    color: '#fff',
    fontWeight: 'bold',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverContent: {
    backgroundColor: '#1a5f34',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffeb3b',
    marginBottom: 12,
  },
  gameOverText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 24,
  },
  restartButton: {
    backgroundColor: '#4ade80',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  restartButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
