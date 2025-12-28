import { useState } from 'react';
import { StyleSheet, Pressable, ScrollView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ThemeToggle from '@/components/ThemeToggle';
import { SpadesGameScreen } from '@/ui/screens/SpadesGameScreen';

type Screen = 'menu' | 'spades' | 'game';

export default function HomeScreen() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [selectedPlayerId, setSelectedPlayerId] = useState('p1');

  if (currentScreen === 'spades') {
    return (
      <SpadesGameScreen
        playerId={selectedPlayerId}
        onGameEnd={(winner) => {
          setCurrentScreen('menu');
        }}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>🎴 Card Games</ThemedText>
          <ThemedText style={styles.subtitle}>Choose a game to play</ThemedText>
        </View>

        {/* Game Selection */}
        <View style={styles.gamesContainer}>
          {/* Spades Game */}
          <Pressable
            style={styles.gameCard}
            onPress={() => {
              setSelectedPlayerId('p1');
              setCurrentScreen('spades');
            }}
          >
            <ThemedText style={styles.gameCardTitle}>♠️ Spades</ThemedText>
            <ThemedText style={styles.gameCardSubtitle}>4 Players • Trick-taking</ThemedText>
            <ThemedText style={styles.gameCardDescription}>
              Classic card game. Bid tricks and try to win exactly what you bid!
            </ThemedText>
            <View style={styles.playButton}>
              <ThemedText style={styles.playButtonText}>Play Now →</ThemedText>
            </View>
          </Pressable>

          {/* Coming Soon: Poker */}
          <View style={[styles.gameCard, styles.comingSoon]}>
            <ThemedText style={styles.gameCardTitle}>🎰 Texas Hold'em</ThemedText>
            <ThemedText style={styles.gameCardSubtitle}>6 Players • Betting</ThemedText>
            <ThemedText style={styles.gameCardDescription}>
              Coming soon! Bluff your way to victory in the world's most popular card game.
            </ThemedText>
            <View style={[styles.playButton, styles.disabledButton]}>
              <ThemedText style={styles.playButtonText}>Coming Soon</ThemedText>
            </View>
          </View>

          {/* Coming Soon: UNO */}
          <View style={[styles.gameCard, styles.comingSoon]}>
            <ThemedText style={styles.gameCardTitle}>🌈 UNO</ThemedText>
            <ThemedText style={styles.gameCardSubtitle}>10 Players • Action Cards</ThemedText>
            <ThemedText style={styles.gameCardDescription}>
              Coming soon! Fast-paced game with wild cards and surprises!
            </ThemedText>
            <View style={[styles.playButton, styles.disabledButton]}>
              <ThemedText style={styles.playButtonText}>Coming Soon</ThemedText>
            </View>
          </View>

          {/* Coming Soon: Turub */}
          <View style={[styles.gameCard, styles.comingSoon]}>
            <ThemedText style={styles.gameCardTitle}>👑 Turub</ThemedText>
            <ThemedText style={styles.gameCardSubtitle}>10 Players • Trump Game</ThemedText>
            <ThemedText style={styles.gameCardDescription}>
              Coming soon! Traditional game with custom rules and trump suits.
            </ThemedText>
            <View style={[styles.playButton, styles.disabledButton]}>
              <ThemedText style={styles.playButtonText}>Coming Soon</ThemedText>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <ThemedText style={styles.featuresTitle}>Features</ThemedText>
          <View style={styles.featuresList}>
            <ThemedText style={styles.featureItem}>✓ Offline-first gameplay</ThemedText>
            <ThemedText style={styles.featureItem}>✓ Deterministic RNG (fair shuffling)</ThemedText>
            <ThemedText style={styles.featureItem}>✓ AI players (no cheating!)</ThemedText>
            <ThemedText style={styles.featureItem}>✓ Instant reconnection</ThemedText>
            <ThemedText style={styles.featureItem}>✓ Action-based multiplayer</ThemedText>
          </View>
        </View>

        {/* Theme Toggle */}
        <View style={styles.themeToggleContainer}>
          <ThemeToggle />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  gamesContainer: {
    gap: 16,
    marginBottom: 32,
  },
  gameCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0066cc',
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
  },
  comingSoon: {
    opacity: 0.6,
  },
  gameCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gameCardSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  gameCardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.8,
  },
  playButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#0066cc',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  playButtonText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  featuresSection: {
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 14,
    opacity: 0.8,
  },
  themeToggleContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
