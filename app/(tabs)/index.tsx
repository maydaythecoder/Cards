import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
      <ThemedView style={styles.Container}>
        <ThemedText>
         Home
       </ThemedText>
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  Container: {
    backgroundColor: '#000000',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
