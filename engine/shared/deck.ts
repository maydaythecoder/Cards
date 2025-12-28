/**
 * Shared Card and Deck utilities used by all games.
 */

import { Card, Rank, Suit } from '../core/types';
import { SeededRNG } from '../core/random';

export class Deck {
  static standard(): Card[] {
    const cards: Card[] = [];
    let id = 0;

    for (const suit of Object.values(Suit)) {
      for (const rank of Object.values(Rank)) {
        cards.push({
          suit,
          rank,
          id: `${suit}${rank}-${id++}`,
        });
      }
    }

    return cards;
  }

  static dealToPlayers(
    deck: Card[],
    playerIds: string[],
    cardsPerPlayer: number,
    rng: SeededRNG
  ): Map<string, Card[]> {
    const totalCards = playerIds.length * cardsPerPlayer;
    const shuffled = rng.shuffle(deck.slice(0, totalCards));

    const hands = new Map<string, Card[]>();

    for (let i = 0; i < playerIds.length; i++) {
      const hand = shuffled.slice(i * cardsPerPlayer, (i + 1) * cardsPerPlayer);
      hands.set(playerIds[i], hand);
    }

    return hands;
  }

  static toString(card: Card): string {
    return `${card.rank}${card.suit}`;
  }

  static fromString(str: string): Omit<Card, 'id'> {
    const rank = str[0] as Rank;
    const suit = str[1] as Suit;
    return { rank, suit };
  }
}
