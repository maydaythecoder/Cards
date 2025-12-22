import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface GameCardProps {
  title?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'accent' | 'secondary';
  style?: ViewStyle;
}

export function GameCard({
  title,
  children,
  onPress,
  variant = 'default',
  style,
}: GameCardProps) {
  const variantStyles = {
    default: styles.defaultCard,
    accent: styles.accentCard,
    secondary: styles.secondaryCard,
  };

  const CardWrapper = onPress ? Pressable : View;

  return (
    <CardWrapper
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        variantStyles[variant],
        onPress && pressed && styles.pressed,
        style,
      ]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  defaultCard: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333333',
  },
  accentCard: {
    backgroundColor: 'rgba(255, 0, 107, 0.1)',
    borderColor: '#FF006B',
  },
  secondaryCard: {
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    borderColor: '#00D9FF',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  pressed: {
    opacity: 0.8,
  },
});
