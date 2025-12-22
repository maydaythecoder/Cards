import { StyleSheet } from 'react-native';
import {Colors} from '@/constants/theme';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
      <ThemedView style={styles.Container}>

      </ThemedView>
  );
}

const styles = StyleSheet.create({
  Container: {
    backgroundColor: Colors.dark.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
