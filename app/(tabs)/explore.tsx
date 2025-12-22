import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet } from 'react-native';

export default function ExploreScreen() {
  return (
    <ThemedView style={styles.Container}>
        <ThemedText>
         Explore
       </ThemedText>    </ThemedView>
  );
}

const styles = StyleSheet.create({
  Container: {
    backgroundColor: '#000000',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
