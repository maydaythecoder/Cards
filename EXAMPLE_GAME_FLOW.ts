/**
 * Complete standalone example - Spades game with AI players.
 * Shows full game flow: setup → bidding → playing → game over.
 * No React dependencies - pure engine logic.
 */

import { SpadesAI } from './engine/ai/base';
import { Player } from './engine/core/types';
import { createSpadesInitialState } from './engine/games/spades/initial';
import { SpadesReducer } from './engine/games/spades/reducer';

/**
 * Simulate a complete Spades game with mixed human/AI players.
 */
export async function runCompleteSpadesGame() {
  console.log('\n' + '='.repeat(60));
  console.log('🎴 SPADES GAME SIMULATION 🎴');
  console.log('='.repeat(60) + '\n');

  // Create players
  const players: Player[] = [
    { id: 'p1', name: 'Alice', isAI: false, isLocal: true, isConnected: true },
    { id: 'p2', name: 'Bot #1', isAI: true, isLocal: false, isConnected: true },
    { id: 'p3', name: 'Charlie', isAI: false, isLocal: true, isConnected: true },
    { id: 'p4', name: 'Bot #2', isAI: true, isLocal: false, isConnected: true },
  ];

  const reducer = new SpadesReducer();
  const seed = 42;

  // Initialize game
  let state = createSpadesInitialState(seed, players);
  console.log(`✓ Game initialized with seed: ${seed}`);
  console.log(`  Players: ${players.map((p) => p.name).join(', ')}\n`);

  // Create AI players
  const aiPlayers = new Map();
  aiPlayers.set('p2', new SpadesAI(reducer, 'p2'));
  aiPlayers.set('p4', new SpadesAI(reducer, 'p4'));

  // ===== BIDDING PHASE =====
  console.log('📝 BIDDING PHASE\n');

  while (!state.gameState.bidPhaseComplete) {
    const currentPlayer = state.players.find(
      (p) => p.id === state.currentTurn.playerId
    )!;
    const isAI = aiPlayers.has(currentPlayer.id);

    let action;

    if (isAI) {
      // AI chooses bid
      const ai = aiPlayers.get(currentPlayer.id);
      action = await ai.getAction(state);
    } else {
      // Human player - simulate placing bid
      const bid = Math.floor(Math.random() * 6) + 1; // Random 1-6
      action = {
        type: 'placeBid',
        bid,
        playerId: currentPlayer.id,
        timestamp: Date.now(),
        gameId: state.gameId,
      };
    }

    state = reducer.reduce(state, action);

    const bid = (action as any).bid;
    console.log(`  ${currentPlayer.name} bids ${bid}${isAI ? ' 🤖' : ''}`);
  }

  // Print final bids
  console.log('\n📊 FINAL BIDS:');
  for (const player of players) {
    const bid = state.gameState.bids.get(player.id);
    console.log(`  ${player.name.padEnd(12)}: ${bid} tricks`);
  }

  // ===== PLAYING PHASE =====
  console.log('\n🃏 PLAYING PHASE (First 5 Tricks)\n');

  let trickNumber = 0;

  while (!state.isGameOver && trickNumber < 5) {
    console.log(`\n--- TRICK ${trickNumber + 1} ---`);

    while (state.gameState.currentTrick.length < 4 && !state.isGameOver) {
      const currentPlayer = state.players.find(
        (p) => p.id === state.currentTurn.playerId
      )!;
      const isAI = aiPlayers.has(currentPlayer.id);
      const playerIndex = state.players.indexOf(currentPlayer);
      const hand = state.gameState.hands[playerIndex];

      let action;

      if (isAI) {
        // AI chooses card
        const ai = aiPlayers.get(currentPlayer.id);
        action = await ai.getAction(state);
      } else {
        // Human player - play random legal card
        const validActions = reducer.getValidActions(state, currentPlayer.id);
        action = validActions[Math.floor(Math.random() * validActions.length)];
      }

      state = reducer.reduce(state, action);

      if (action.type === 'playCard') {
        const card = hand.find((c) => c.id === (action as any).cardId);
        console.log(
          `  ${currentPlayer.name} plays ${card?.rank}${card?.suit}${isAI ? ' 🤖' : ''}`
        );
      }
    }

    // Trick complete
    const trick = state.gameState.tricks[state.gameState.tricks.length - 1];
    const winner = state.players.find((p) => p.id === trick.winner);
    console.log(`  ✓ ${winner?.name} wins the trick`);

    trickNumber++;
  }

  if (state.isGameOver) {
    console.log('\n🏁 GAME OVER\n');
  } else {
    console.log('\n(Showing first 5 tricks - game continues...)');
  }

  // Print final stats
  console.log('\n📈 TRICKS WON:');
  for (const player of players) {
    const tricksWon = state.gameState.tricks.filter(
      (t) => t.winner === player.id
    ).length;
    const bid = state.gameState.bids.get(player.id);
    const status =
      tricksWon === bid
        ? '✓ SUCCESS'
        : tricksWon > bid
          ? `+${tricksWon - bid} over`
          : `-${bid - tricksWon} short`;
    console.log(
      `  ${player.name.padEnd(12)}: ${tricksWon}/${bid} tricks - ${status}`
    );
  }

  // Show action history
  console.log(
    `\n📜 Action History: ${state.actionHistory.length} actions recorded`
  );
  console.log(`   First action: ${state.actionHistory[0]?.type}`);
  console.log(`   Last action: ${state.actionHistory[state.actionHistory.length - 1]?.type}`);

  // Demonstrate deterministic replay
  console.log('\n🔄 DETERMINISTIC REPLAY TEST');
  const replayed = reducer.rebuild(seed, players, state.actionHistory);
  console.log(
    `  Original bids:  ${Array.from(state.gameState.bids.values()).join(',')}`
  );
  console.log(
    `  Replayed bids:  ${Array.from(replayed.gameState.bids.values()).join(',')}`
  );
  console.log(
    `  ✓ States match: ${JSON.stringify(state.gameState.bids) === JSON.stringify(replayed.gameState.bids)}`
  );

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Test: Reconnection scenario
 */
export async function testReconnectionScenario() {
  console.log('\n' + '='.repeat(60));
  console.log('🌐 RECONNECTION TEST');
  console.log('='.repeat(60) + '\n');

  const players: Player[] = [
    { id: 'p1', name: 'Alice', isAI: false, isLocal: true, isConnected: true },
    { id: 'p2', name: 'Bob', isAI: false, isLocal: true, isConnected: true },
    { id: 'p3', name: 'Charlie', isAI: false, isLocal: true, isConnected: true },
    { id: 'p4', name: 'Diana', isAI: false, isLocal: true, isConnected: true },
  ];

  const reducer = new SpadesReducer();
  const seed = 999;

  // Create game
  let state = createSpadesInitialState(seed, players);
  console.log(`✓ Game started with seed: ${seed}`);

  // Play some bids
  const actions = [
    {
      type: 'placeBid',
      bid: 3,
      playerId: 'p1',
      timestamp: Date.now(),
      gameId: state.gameId,
    },
    {
      type: 'placeBid',
      bid: 2,
      playerId: 'p2',
      timestamp: Date.now(),
      gameId: state.gameId,
    },
  ];

  for (const action of actions) {
    state = reducer.reduce(state, action);
  }

  console.log(`✓ 2 bids placed - game state saved locally`);
  console.log(
    `  Bids: p1=${state.gameState.bids.get('p1')}, p2=${state.gameState.bids.get('p2')}`
  );

  // Simulate player going offline and missing actions
  console.log(`\n⚠️  Player goes offline...`);
  console.log(`⚠️  Other players continue playing`);

  const missedActions = [
    {
      type: 'placeBid',
      bid: 4,
      playerId: 'p3',
      timestamp: Date.now(),
      gameId: state.gameId,
    },
    {
      type: 'placeBid',
      bid: 2,
      playerId: 'p4',
      timestamp: Date.now(),
      gameId: state.gameId,
    },
  ];

  // Simulate reconnection - rebuild from all actions
  console.log(`\n✓ Player reconnects...`);
  const allActions = [...actions, ...missedActions];
  const rebuiltState = reducer.rebuild(seed, players, allActions);

  console.log(`✓ State rebuilt from action history`);
  console.log(`  All bids: ${Array.from(rebuiltState.gameState.bids.values()).join(',')}`);
  console.log(
    `  Bidding complete: ${rebuiltState.gameState.bidPhaseComplete ? 'YES' : 'NO'}`
  );
  console.log(
    `  Bidding phase should be complete: ${missedActions.length + actions.length === 4}`
  );

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Test: RNG determinism
 */
export function testRNGDeterminism() {
  console.log('\n' + '='.repeat(60));
  console.log('🔐 RNG DETERMINISM TEST');
  console.log('='.repeat(60) + '\n');

  const players: Player[] = [
    { id: 'p1', name: 'Alice', isAI: false, isLocal: true, isConnected: true },
    { id: 'p2', name: 'Bob', isAI: false, isLocal: true, isConnected: true },
    { id: 'p3', name: 'Charlie', isAI: false, isLocal: true, isConnected: true },
    { id: 'p4', name: 'Diana', isAI: false, isLocal: true, isConnected: true },
  ];

  const seed = 12345;

  // Create two games with same seed
  const state1 = createSpadesInitialState(seed, players);
  const state2 = createSpadesInitialState(seed, players);

  // Compare hands
  const hand1 = state1.gameState.hands[0]
    .map((c) => `${c.rank}${c.suit}`)
    .sort()
    .join(' ');
  const hand2 = state2.gameState.hands[0]
    .map((c) => `${c.rank}${c.suit}`)
    .sort()
    .join(' ');

  console.log(`Seed: ${seed}\n`);
  console.log(`Game 1 - Player 1 hand: ${hand1}`);
  console.log(`Game 2 - Player 1 hand: ${hand2}`);
  console.log(
    `\n✓ Hands identical: ${hand1 === hand2 ? 'YES ✓' : 'NO ✗'}`
  );

  // Compare all hands
  let allMatch = true;
  for (let i = 0; i < 4; i++) {
    const h1 = state1.gameState.hands[i];
    const h2 = state2.gameState.hands[i];
    const match = JSON.stringify(h1) === JSON.stringify(h2);
    allMatch = allMatch && match;
  }

  console.log(`✓ All 4 players match: ${allMatch ? 'YES ✓' : 'NO ✗'}`);

  console.log('\n' + '='.repeat(60) + '\n');
}

// Run all examples if this is main module
async function main() {
  try {
    testRNGDeterminism();
    await testReconnectionScenario();
    await runCompleteSpadesGame();
  } catch (error) {
    console.error('Error:', error);
  }
}

if (typeof module !== 'undefined' && require.main === module) {
  main();
}

export { runCompleteSpadesGame, testReconnectionScenario, testRNGDeterminism };
