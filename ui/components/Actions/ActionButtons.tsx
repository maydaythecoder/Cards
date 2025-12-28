/**
 * Action buttons component - reusable action UI for any game.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GameAction } from '../../engine/core/types';

export interface ActionButtonsProps {
  actions: GameAction[];
  selectedAction: GameAction | null;
  onSelectAction: (action: GameAction) => void;
  disabled?: boolean;
  vertical?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  actions,
  selectedAction,
  onSelectAction,
  disabled = false,
  vertical = false,
}) => {
  const renderAction = (action: GameAction) => {
    const isSelected =
      selectedAction && JSON.stringify(selectedAction) === JSON.stringify(action);

    let label = action.type;

    // Format label based on action type
    if (action.type === 'playCard') {
      label = `Play Card`;
    } else if (action.type === 'placeBid') {
      const bidAction = action as any;
      label = `Bid ${bidAction.bid}`;
    }

    return (
      <Pressable
        key={`${action.type}-${action.playerId}-${Date.now()}`}
        style={[
          styles.button,
          isSelected && styles.buttonSelected,
          disabled && styles.buttonDisabled,
        ]}
        onPress={() => onSelectAction(action)}
        disabled={disabled}
      >
        <Text
          style={[
            styles.buttonText,
            isSelected && styles.buttonTextSelected,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  if (vertical) {
    return (
      <View style={styles.containerVertical}>
        {actions.map(renderAction)}
      </View>
    );
  }

  return (
    <View style={styles.containerHorizontal}>
      {actions.map(renderAction)}
    </View>
  );
};

const styles = StyleSheet.create({
  containerHorizontal: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  containerVertical: {
    flexDirection: 'column',
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0066cc',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0066cc',
    minWidth: 80,
    alignItems: 'center',
  },
  buttonSelected: {
    backgroundColor: '#ffeb3b',
    borderColor: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  buttonTextSelected: {
    color: '#000',
  },
});
