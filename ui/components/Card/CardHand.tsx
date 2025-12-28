/**
 * Card hand component - renders a player's hand.
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card } from '../../engine/core/types';
import { CardComponent } from './Card';

export interface CardHandProps {
  cards: Card[];
  onSelectCard?: (card: Card) => void;
  selectedCardIds?: string[];
  orientation?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
}

export const CardHand: React.FC<CardHandProps> = ({
  cards,
  onSelectCard,
  selectedCardIds = [],
  orientation = 'horizontal',
  size = 'medium',
}) => {
  const isSelected = (card: Card) => selectedCardIds.includes(card.id);

  return (
    <ScrollView
      horizontal={orientation === 'horizontal'}
      scrollEnabled={cards.length > 6}
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      style={styles.container}
    >
      <View style={[styles.hand, styles[`hand_${orientation}`]]}>
        {cards.map((card) => (
          <CardComponent
            key={card.id}
            card={card}
            size={size}
            isSelected={isSelected(card)}
            onPress={onSelectCard}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  hand_horizontal: {
    gap: 8,
  },
  hand_vertical: {
    flexDirection: 'column',
    gap: 8,
  },
});
