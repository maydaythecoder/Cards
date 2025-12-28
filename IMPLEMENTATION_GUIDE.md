# Card Game Platform - Implementation Guide

## Quick Start

### Running the Example UI
The project includes a fully-functional **Spades game screen** that demonstrates the architecture in action:

```typescript
// In your main app navigation
import { SpadesGameScreen } from './ui/screens/SpadesGameScreen';

// Use it:
<SpadesGameScreen playerId="player_1" onGameEnd={(winner) => console.log(winner)} />
```

### What the Example Shows

The `SpadesGameScreen` component demonstrates:

1. **Game Engine Integration** - Uses `SpadesReducer` and `createSpadesInitialState`
2. **Real-time State Management** - Updates UI when state changes
3. **Bidding Phase** - Players select and place bids (0-13)
4. **Playing Phase** - Players play cards from their hand
5. **Turn Management** - Enforces valid actions per turn
6. **Card Selection** - Interactive card selection with visual feedback
7. **Game End Detection** - Shows winner overlay
8. **Error Handling** - Displays invalid action messages

### Key Files

#### Engine
- `engine/core/types.ts` - Base types for all games
- `engine/core/random.ts` - Seeded RNG for determinism
- `engine/core/reducer.ts` - Base reducer pattern
- `engine/games/spades/reducer.ts` - Spades rules
- `engine/shared/deck.ts` - Card dealing utilities

#### Networking
- `net/session-manager.ts` - Handles reconnection
- `net/action-broadcaster.ts` - Abstract transport layer

#### UI
- `ui/screens/SpadesGameScreen.tsx` - **Main example** (fully working)
- `ui/components/Card/Card.tsx` - Generic card component
- `ui/components/Card/CardHand.tsx` - Hand renderer
- `ui/hooks/useGameState.ts` - State management hook

---

## Architecture Overview

```
React Native UI Layer
        ↓
    useGameState Hook
        ↓
    Game Engine (Pure Logic)
        ↓
    Reducer Pattern (Deterministic)
        ↓
    Action-Based Sync (Network)
```

### Flow: Player Action → Engine Update → UI Render

```typescript
// 1. User clicks card
const handlePlayCard = () => {
  const action = {
    type: 'playCard',
    cardId: selectedCard.id,
    playerId: currentPlayer.id,
    timestamp: Date.now(),
    gameId: gameState.gameId,
  };

  // 2. Reducer validates & applies action
  const newState = reducer.reduce(gameState, action);

  // 3. Update UI state
  setGameState(newState);

  // 4. Broadcast to other players (optional)
  await broadcastAction(action);
};
```

---

## Game State Structure

Every game state follows this pattern:

```typescript
interface GameState<T> {
  gameId: string;
  gameType: 'spades' | 'poker' | 'turub' | 'uno';
  
  // Immutable
  seed: number;                    // For deterministic replay
  players: Player[];               // All players
  actionHistory: GameAction[];     // Complete action log
  createdAt: number;
  houseRules: HouseRules;
  
  // Current state
  currentTurn: {
    playerId: string;              // Whose turn?
    validActions: GameAction[];    // Legal actions
  };
  
  gameState: T;  // Game-specific (e.g., SpadesState)
  
  isGameOver: boolean;
  winner?: string;
}
```

### Spades State Example

```typescript
interface SpadesGameState {
  hands: Card[][];                          // Per-player hands
  bids: Map<string, number>;                // Player → bid
  tricks: Array<{                           // Won tricks
    winner: string;
    cards: Array<{playerId, card}>;
  }>;
  currentTrick: Array<{playerId, card}>;   // In-progress trick
  bidPhaseComplete: boolean;
  scores: Map<string, number>;
}
```

---

## Creating a New Game

### Step 1: Define Types
```typescript
// engine/games/mynewgame/types.ts
export interface MyGameState {
  hands: Card[][];
  // ... game-specific fields
}
```

### Step 2: Create Reducer
```typescript
// engine/games/mynewgame/reducer.ts
export class MyGameReducer extends GameReducer<GameState<MyGameState>> {
  applyAction(state, action) {
    // Implement game logic
  }

  getValidActions(state, playerId) {
    // Return legal actions for player
  }

  isGameOver(state) {
    // Check win condition
  }

  getWinner(state) {
    // Return winner ID
  }

  initialState(seed, players) {
    // Setup new game
  }
}
```

### Step 3: Create Initial State
```typescript
// engine/games/mynewgame/initial.ts
export function createMyGameInitialState(seed: number, players: Player[]) {
  const rng = new SeededRNG(seed);
  // ... deal cards, setup state
  return {
    gameId: `mygame_${Date.now()}`,
    gameType: 'mynewgame',
    // ... rest of GameState
  };
}
```

### Step 4: Create Player View (for hidden info)
```typescript
// engine/games/mynewgame/view.ts
export function getMyGamePlayerView(state, viewingPlayerId) {
  // Filter hidden information (e.g., opponent cards)
  return state;  // Or modified state with hidden cards
}
```

### Step 5: Register Game
```typescript
// config/games.ts
export const GAME_REGISTRY = {
  mynewgame: {
    id: 'mynewgame',
    name: 'My New Game',
    playerCount: 4,
    reducer: new MyGameReducer(),
    getPlayerView: getMyGamePlayerView,
    initialStateFactory: createMyGameInitialState,
  },
};
```

### Step 6: Create UI Screen
```typescript
// ui/screens/MyGameScreen.tsx
export const MyGameScreen: React.FC = ({ playerId }) => {
  const [gameState, setGameState] = useState(null);
  const reducer = new MyGameReducer();

  useEffect(() => {
    const players = createPlayerList();
    const seed = Math.random() * 1000000;
    const initial = createMyGameInitialState(seed, players);
    setGameState(initial);
  }, []);

  const handleAction = (action) => {
    const newState = reducer.reduce(gameState, action);
    setGameState(newState);
  };

  // Render game board and actions
};
```

---

## Deterministic State Replay

The engine is **100% deterministic**: same seed + same actions = identical state.

This enables:

1. **Reconnection without state sync**
2. **Instant replay of games**
3. **Server-side validation**

```typescript
// Example: Player A and Player B have different action histories
// Player A goes offline. Gets these actions while offline:
const newActions = [action4, action5, action6];

// Rebuild from scratch
const state = reducer.rebuild(seed, players, [...oldActions, ...newActions]);
// Result: both players have identical state!
```

---

## Multiplayer Sync (Action-Based)

The network layer transmits **only actions**, not full state.

### Action Flow
```
Player A plays card
      ↓
Local state updates immediately
      ↓
Action broadcast to Player B, C, D
      ↓
Each player applies same action
      ↓
All states converge (deterministically)
```

### Bandwidth Comparison
- **Full-State Sync**: ~5-10KB per state update (wasteful)
- **Action-Only**: ~200 bytes per action (efficient)

### Implementation
```typescript
// Send action to others
const broadcastAction = async (action) => {
  const message: NetworkMessage = {
    type: 'action',
    gameId: state.gameId,
    payload: action,
    timestamp: Date.now(),
    fromPlayerId: playerId,
  };

  await broadcaster.send(message);
};

// Receive action from others
broadcaster.onMessage((msg) => {
  if (msg.type === 'action') {
    const action = msg.payload as GameAction;
    const newState = reducer.reduce(state, action);
    setGameState(newState);
  }
});
```

---

## AI Players

AI never accesses hidden information. It only:
1. Uses `getValidActions()` to find legal moves
2. Implements strategy based on public state
3. Returns a legal action

```typescript
export class MyGameAI extends SimpleRuleBasedAI {
  protected selectBestAction(state, legalActions) {
    // Strategy logic here
    // Can see: public cards, pot size, etc.
    // Cannot see: opponent hole cards
    return legalActions[bestIndex];
  }
}
```

**Usage:**
```typescript
const ai = new SpadesAI(reducer, 'ai_player_id');
const action = await ai.getAction(playerView);  // playerView has hidden info filtered
```

---

## Performance Tips

1. **Avoid Deep Clones** - Use spread operator for immutability
   ```typescript
   // Good
   const newState = { ...state, gameState: { ...gs, hands: [...hands] } };
   
   // Avoid
   const newState = JSON.parse(JSON.stringify(state));
   ```

2. **Memoize Expensive Calculations**
   ```typescript
   const validActions = useMemo(
     () => reducer.getValidActions(state, playerId),
     [state, playerId]
   );
   ```

3. **Batch Network Messages**
   - Send multiple actions in one message if <100ms apart

4. **Lazy Render Player Hands**
   ```typescript
   // Only render for current player
   {playerId === currentPlayerId && <CardHand cards={hand} />}
   ```

---

## Testing

### Unit Tests (Per Game)
```typescript
// engine/games/spades/__tests__/reducer.test.ts
import { SpadesReducer } from '../reducer';

describe('Spades Reducer', () => {
  it('should validate bids correctly', () => {
    const reducer = new SpadesReducer();
    const state = createSpadesInitialState(12345, players);
    
    const action = { type: 'placeBid', bid: 5, ... };
    const newState = reducer.reduce(state, action);
    
    expect(newState.gameState.bids.get('p1')).toBe(5);
  });
});
```

### Integration Tests
```typescript
// __tests__/integration.test.ts
describe('Full Game Flow', () => {
  it('should complete a full Spades round', () => {
    // Play bidding phase
    // Play all tricks
    // Verify winner
  });
});
```

### Determinism Tests
```typescript
it('should produce identical state with same seed', () => {
  const state1 = createSpadesInitialState(seed, players);
  const state2 = createSpadesInitialState(seed, players);
  
  expect(state1.gameState.hands).toEqual(state2.gameState.hands);
});
```

---

## Debugging

### Log Game State
```typescript
console.log('Current state:', {
  gameId: state.gameId,
  phase: state.gameState.bidPhaseComplete ? 'playing' : 'bidding',
  turn: state.currentTurn.playerId,
  actionCount: state.actionHistory.length,
});
```

### Trace Action Execution
```typescript
const traceAction = (action) => {
  console.log('Before:', state.gameState.bids);
  const newState = reducer.reduce(state, action);
  console.log('After:', newState.gameState.bids);
  console.log('Valid next actions:', reducer.getValidActions(newState, nextPlayer));
};
```

### Replay Game
```typescript
// Rebuild entire game from start
const replayed = reducer.rebuild(seed, players, actionHistory);
// Should be identical to current state
```

---

## Common Pitfalls

### ❌ Mutating State
```typescript
// Wrong
state.gameState.hands[0].push(newCard);

// Right
const newHands = [...state.gameState.hands];
newHands[0] = [...newHands[0], newCard];
```

### ❌ AI Accessing Hidden Info
```typescript
// Wrong - AI sees opponent cards
const opponentCards = state.gameState.hands.get(opponent);

// Right - Use filtered view
const view = getPlayerView(state, aiPlayerId);
// Now opponent cards are hidden
```

### ❌ Non-Deterministic Seeding
```typescript
// Wrong
const seed = Math.random();  // Different every time!

// Right
const seed = Date.now();  // Fixed for session
```

### ❌ Forgetting Action History
```typescript
// Wrong - history is lost
setState(newState);

// Right - always use reducer.reduce() which updates history
const newState = reducer.reduce(state, action);
setState(newState);
```

---

## Next Steps

1. **Run SpadesGameScreen** - Test the working example
2. **Add Poker Game** - Follow the Spades pattern
3. **Implement Networking** - Use `SessionManager` + `ActionBroadcaster`
4. **Deploy** - EAS Build → TestFlight/Google Play

---

## File Reference

```
engine/
├── core/
│   ├── types.ts              ← Card, GameState, GameAction
│   ├── random.ts             ← SeededRNG
│   └── reducer.ts            ← Base GameReducer
├── games/
│   ├── spades/
│   │   ├── types.ts
│   │   ├── initial.ts
│   │   ├── reducer.ts        ← Spades rules
│   │   └── view.ts           ← No hidden info in Spades
│   ├── poker/
│   │   ├── types.ts
│   │   ├── view.ts           ← Hides hole cards
│   │   └── ...
│   ├── turub/                ← 10-player game
│   └── uno/                  ← Action card game
├── ai/
│   └── base.ts               ← AIPlayer base class
└── shared/
    └── deck.ts               ← Deck creation & shuffling

ui/
├── screens/
│   └── SpadesGameScreen.tsx  ← **WORKING EXAMPLE** ✓
├── components/
│   ├── Card/
│   │   ├── Card.tsx          ← Generic card display
│   │   └── CardHand.tsx      ← Hand renderer
│   └── Actions/
│       └── ActionButtons.tsx ← Action selection UI
└── hooks/
    ├── useGameState.ts       ← State + reducer coordination
    ├── useTableLayout.ts     ← Position calculations
    └── usePlayerView.ts      ← Hidden info filtering

net/
├── types.ts                  ← NetworkMessage, GameSession
├── session-manager.ts        ← Reconnection & validation
└── action-broadcaster.ts     ← Abstract transport

config/
└── games.ts                  ← Game registry
```

---

## Support

- **Determinism Issues?** → Check `SeededRNG` is used for shuffling
- **Validation Errors?** → Use `getValidActions()` before `reduce()`
- **Hidden Info Leaking?** → Call `getPlayerView()` before sending state to UI
- **Network Sync?** → Use `SessionManager.rebuild()` on reconnect
