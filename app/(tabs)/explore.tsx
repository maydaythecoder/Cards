import { Button, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';

export default function TabTwoScreen() {
  return (
    <ThemedView style={styles.Body}>
      <Button title='Hello'></Button>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  Body: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
});
