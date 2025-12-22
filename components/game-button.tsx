import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

interface GameButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export function GameButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  size = 'medium',
  style,
}: GameButtonProps) {
  const variantStyles = {
    primary: styles.primaryButton,
    secondary: styles.secondaryButton,
    danger: styles.dangerButton,
  };

  const sizeStyles = {
    small: styles.smallButton,
    medium: styles.mediumButton,
    large: styles.largeButton,
  };

  const sizeFontStyles = {
    small: styles.smallText,
    medium: styles.mediumText,
    large: styles.largeText,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variantStyles[variant],
        sizeStyles[size],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={[styles.text, sizeFontStyles[size]]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  primaryButton: {
    backgroundColor: '#FF006B',
    borderColor: '#FF006B',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#00D9FF',
  },
  dangerButton: {
    backgroundColor: '#FF006B',
    borderColor: '#FF006B',
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  smallText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mediumText: {
    fontSize: 14,
    fontWeight: '600',
  },
  largeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});
