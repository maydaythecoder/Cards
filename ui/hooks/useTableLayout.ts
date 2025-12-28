/**
 * Game table layout hook - positions players around circular table.
 */

import { useEffect, useState } from 'react';
import { Dimensions, LayoutChangeEvent } from 'react-native';

export interface PlayerPosition {
  id: string;
  x: number;
  y: number;
  angle: number;
}

/**
 * Calculate positions for N players around a circular table.
 */
export function useTableLayout(playerCount: number) {
  const [positions, setPositions] = useState<Map<string, PlayerPosition>>(new Map());
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  useEffect(() => {
    const calculatePositions = () => {
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      const radius = Math.min(centerX, centerY) * 0.65;

      const newPositions = new Map<string, PlayerPosition>();
      const angleStep = (2 * Math.PI) / playerCount;

      for (let i = 0; i < playerCount; i++) {
        const angle = i * angleStep - Math.PI / 2; // Start at top
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        newPositions.set(`player_${i}`, {
          id: `player_${i}`,
          x,
          y,
          angle: (angle * 180) / Math.PI,
        });
      }

      setPositions(newPositions);
    };

    calculatePositions();
  }, [playerCount, dimensions]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  return { positions, dimensions, handleLayout };
}
