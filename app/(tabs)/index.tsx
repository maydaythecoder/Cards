import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ThemeToggle from '@/components/ThemeToggle';
import { StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
      <ThemedView style={styles.Container}>
        <ThemedText style={styles.Text}>
         Home
       </ThemedText>
       <ThemeToggle />
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  Container: {
    // backgroundColor: '#000000',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  Text: {
    alignContent: 'center',
  }
});
