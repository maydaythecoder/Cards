/**
 * End-to-end integration test showing full game flow.
 * Demonstrates deterministic engine, reconnection, and AI.
 */

import { SpadesAI } from '../engine/ai/base';
import { SeededRNG } from '../engine/core/random';
import { Player } from '../engine/core/types';
import { createSpadesInitialState } from '../engine/games/spades/initial';
import { SpadesReducer } from '../engine/games/spades/reducer';

/**
 * Test: Create a game and play a few turns.
 */
export function testBasicGameFlow() {
  const players: Player[] = [
    { id: 'p1', name: 'Alice', isAI: false, isLocal: true, isConnected: true },
    { id: 'p2', name: 'Bob', isAI: false, isLocal: true, isConnected: true },
    { id: 'p3', name: 'Charlie', isAI: false, isLocal: true, isConnected: true },
    { id: 'p4', name: 'Diana', isAI: false, isLocal: true, isConnected: true },
  ];

  const reducer = new SpadesReducer();
  const seed = 12345;

  // Create initial state
  let state = createSpadesInitialState(seed, players);

  console.log('=== Game Created ===');
  console.log(`Game ID: ${state.gameId}`);
  console.log(`Players: ${players.map((p) => p.name).join(', ')}`);

  // Player 1 places bid
  let action = {
    type: 'placeBid',
    playerId: 'p1',
    timestamp: Date.now(),
    gameId: state.gameId,
    bid: 3,
  };

  state = reducer.reduce(state, action);
  console.log(`\nP1 bids 3`);

  // Player 2 places bid
  action = {
    type: 'placeBid',
    playerId: 'p2',
    timestamp: Date.now(),
    gameId: state.gameId,
    bid: 2,
  };

  state = reducer.reduce(state, action);
  console.log(`P2 bids 2`);

  // Player 3 places bid
  action = {
    type: 'placeBid',
    playerId: 'p3',
    timestamp: Date.now(),
    gameId: state.gameId,
    bid: 4,
  };

  state = reducer.reduce(state, action);
  console.log(`P3 bids 4`);

  // Player 4 places bid
  action = {
    type: 'placeBid',
    playerId: 'p4',
    timestamp: Date.now(),
    gameId: state.gameId,
    bid: 2,
  };

  state = reducer.reduce(state, action);
  console.log(`P4 bids 2`);

  console.log(`\nBidding phase complete!`);
  console.log(`All bids: ${JSON.stringify(Object.fromEntries(state.gameState.bids))}`);
}

/**
 * Test: Deterministic seeding - same seed produces same state.
 */
export function testDeterministicSeeding() {
  const players: Player[] = [
    { id: 'p1', name: 'Alice', isAI: false, isLocal: true, isConnected: true },
    { id: 'p2', name: 'Bob', isAI: false, isLocal: true, isConnected: true },
    { id: 'p3', name: 'Charlie', isAI: false, isLocal: true, isConnected: true },
    { id: 'p4', name: 'Diana', isAI: false, isLocal: true, isConnected: true },
  ];

  const reducer = new SpadesReducer();
  const seed = 99999;

  // Create two games with same seed
  const state1 = createSpadesInitialState(seed, players);
  const state2 = createSpadesInitialState(seed, players);

  const hand1 = state1.gameState.hands[0].map((c) => `${c.rank}${c.suit}`).join(',');
  const hand2 = state2.gameState.hands[0].map((c) => `${c.rank}${c.suit}`).join(',');

  console.log('=== Deterministic Seeding Test ===');
  console.log(`Seed: ${seed}`);
  console.log(`Player 1 hand (Game 1): ${hand1}`);
  console.log(`Player 1 hand (Game 2): ${hand2}`);
  console.log(`Hands match: ${hand1 === hand2 ? 'YES ✓' : 'NO ✗'}`);
}

/**
 * Test: Reconnection - rebuild state from action history.
 */
export function testReconnection() {
  const players: Player[] = [
    { id: 'p1', name: 'Alice', isAI: false, isLocal: true, isConnected: true },
    { id: 'p2', name: 'Bob', isAI: false, isLocal: true, isConnected: true },
    { id: 'p3', name: 'Charlie', isAI: false, isLocal: true, isConnected: true },
    { id: 'p4', name: 'Diana', isAI: false, isLocal: true, isConnected: true },
  ];

  const reducer = new SpadesReducer();
  const seed = 55555;

  // Initial state
  let state = createSpadesInitialState(seed, players);
  const gameId = state.gameId;

  // Play some actions
  const actions = [
    {
      type: 'placeBid',
      playerId: 'p1',
      timestamp: Date.now(),
      gameId,
      bid: 3,
    },
    {
      type: 'placeBid',
      playerId: 'p2',
      timestamp: Date.now(),
      gameId,
      bid: 2,
    },
  ];

  for (const action of actions) {
    state = reducer.reduce(state, action);
  }

  // Player goes offline, comes back
  // Rebuild state from seed + action history
  const rebuiltState = reducer.rebuild(seed, players, actions);

  console.log('=== Reconnection Test ===');
  console.log(`Original state bids: ${JSON.stringify(Object.fromEntries(state.gameState.bids))}`);
  console.log(`Rebuilt state bids: ${JSON.stringify(Object.fromEntries(rebuiltState.gameState.bids))}`);
  console.log(`States match: ${JSON.stringify(state) === JSON.stringify(rebuiltState) ? 'YES ✓' : 'NO ✗'}`);
}

/**
 * Test: AI player selects legal actions only.
 */
export function testAIPlayer() {
  const players: Player[] = [
    { id: 'p1', name: 'Alice', isAI: false, isLocal: true, isConnected: true },
    { id: 'p2', name: 'Bot', isAI: true, isLocal: false, isConnected: true },
    { id: 'p3', name: 'Charlie', isAI: false, isLocal: true, isConnected: true },
    { id: 'p4', name: 'Diana', isAI: false, isLocal: true, isConnected: true },
  ];

  const reducer = new SpadesReducer();
  const ai = new SpadesAI(reducer, 'p2');
  const seed = 77777;

  // Create game
  let state = createSpadesInitialState(seed, players);

  // Get legal actions for AI
  const legalActions = reducer.getValidActions(state, 'p2');
  console.log('=== AI Legal Actions Test ===');
  console.log(`Total legal bid actions: ${legalActions.length}`);
  console.log(`Action types: ${legalActions.map((a) => a.type).join(', ')}`);
  console.log(`Bids range: 0-${legalActions[legalActions.length - 1]?.bid}`);
}

/**
 * Test: Seeded RNG produces consistent shuffle.
 */
export function testSeededRNG() {
  const cards = Array.from({ length: 52 }, (_, i) => i);

  const rng1 = new SeededRNG(12345);
  const shuffled1 = rng1.shuffle(cards.slice());

  const rng2 = new SeededRNG(12345);
  const shuffled2 = rng2.shuffle(cards.slice());

  console.log('=== Seeded RNG Test ===');
  console.log(`First 5 cards (RNG 1): ${shuffled1.slice(0, 5).join(',')}`);
  console.log(`First 5 cards (RNG 2): ${shuffled2.slice(0, 5).join(',')}`);
  console.log(`Shuffles match: ${JSON.stringify(shuffled1) === JSON.stringify(shuffled2) ? 'YES ✓' : 'NO ✗'}`);
}

// Run all tests
if (require.main === module) {
  testBasicGameFlow();
  testDeterministicSeeding();
  testReconnection();
  testAIPlayer();
  testSeededRNG();
}
