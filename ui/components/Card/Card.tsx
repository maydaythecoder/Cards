/**
 * Card component - reusable across all games.
 * Shows front or back, selected state, and handles presses.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Suit } from '../../engine/core/types';

export interface CardComponentProps {
  card: Card | { hidden: true };
  isSelected?: boolean;
  onPress?: (card: Card) => void;
  size?: 'small' | 'medium' | 'large';
  faceDown?: boolean;
  disabled?: boolean;
}

export const CardComponent: React.FC<CardComponentProps> = ({
  card,
  isSelected = false,
  onPress,
  size = 'medium',
  faceDown = false,
  disabled = false,
}) => {
  const isHidden = 'hidden' in card;

  // Card back (face down)
  if (faceDown || isHidden) {
    return <View style={[styles.card, styles[`card_${size}`], styles.cardBack]} />;
  }

  const suitColor =
    card.suit === Suit.Hearts || card.suit === Suit.Diamonds ? 'red' : 'black';

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress(card);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.card,
        styles[`card_${size}`],
        isSelected && styles.cardSelected,
        disabled && styles.cardDisabled,
      ]}
    >
      {/* Top-left corner */}
      <View style={styles.corner}>
        <Text style={[styles.cornerText, { color: suitColor }]}>{card.rank}</Text>
        <Text style={[styles.suitSymbol, { color: suitColor }]}>
          {getSuitSymbol(card.suit)}
        </Text>
      </View>

      {/* Center */}
      <View style={styles.center}>
        <Text style={[styles.centerText, { color: suitColor }]}>
          {getSuitSymbol(card.suit)}
        </Text>
      </View>

      {/* Bottom-right corner (rotated) */}
      <View style={[styles.corner, styles.cornerBottom]}>
        <Text style={[styles.cornerText, { color: suitColor }]}>{card.rank}</Text>
        <Text style={[styles.suitSymbol, { color: suitColor }]}>
          {getSuitSymbol(card.suit)}
        </Text>
      </View>
    </Pressable>
  );
};

function getSuitSymbol(suit: Suit): string {
  const symbols: Record<Suit, string> = {
    [Suit.Hearts]: '♥',
    [Suit.Diamonds]: '♦',
    [Suit.Clubs]: '♣',
    [Suit.Spades]: '♠',
  };
  return symbols[suit];
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  card_small: {
    width: 60,
    height: 90,
    padding: 4,
  },
  card_medium: {
    width: 80,
    height: 120,
    padding: 6,
  },
  card_large: {
    width: 100,
    height: 150,
    padding: 8,
  },
  cardBack: {
    backgroundColor: '#003d99',
    borderColor: '#001a4d',
  },
  cardSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
    borderColor: '#0066cc',
    borderWidth: 3,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  corner: {
    alignItems: 'center',
  },
  cornerBottom: {
    transform: [{ rotate: '180deg' }],
  },
  cornerText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  suitSymbol: {
    fontSize: 12,
    fontWeight: '600',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    fontSize: 36,
    fontWeight: '600',
  },
});
