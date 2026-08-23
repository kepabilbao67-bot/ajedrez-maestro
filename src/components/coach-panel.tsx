import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export interface CoachPanelProps {
  readonly coachMessage: string | null;
  readonly contextualMessage: string;
  readonly coachLoading: boolean;
  readonly thinking: boolean;
  readonly hintLevel: number;
  readonly canAnalyze: boolean;
  readonly onRequestHint: () => void;
  readonly onAnalyzeGame: () => void;
}

export function CoachPanel({
  coachMessage,
  contextualMessage,
  coachLoading,
  thinking,
  hintLevel,
  canAnalyze,
  onRequestHint,
  onAnalyzeGame,
}: CoachPanelProps) {
  const isHintDisabled = coachLoading || thinking;
  const isAnalyzeDisabled = isHintDisabled || !canAnalyze;

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isHintDisabled }}
        disabled={isHintDisabled}
        onPress={onRequestHint}
        style={({ pressed }) => [styles.coachButton, isHintDisabled && styles.disabledButton, pressed && styles.pressed]}
      >
        <Text style={styles.coachButtonText}>{coachLoading ? 'Analizando…' : `Pista · nivel ${hintLevel}`}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isAnalyzeDisabled }}
        disabled={isAnalyzeDisabled}
        onPress={onAnalyzeGame}
        style={({ pressed }) => [styles.coachButton, isAnalyzeDisabled && styles.disabledButton, pressed && styles.pressed]}
      >
        <Text style={styles.coachButtonText}>Analizar partida</Text>
      </Pressable>

      {coachMessage ? (
        <Animated.View entering={FadeIn.duration(180)} style={styles.coachCard}>
          <Text selectable style={styles.coachTitle}>Profesor IA</Text>
          <Text selectable style={styles.coachText}>{coachMessage}</Text>
        </Animated.View>
      ) : (
        <View style={styles.coachCard}>
          <Text selectable style={styles.coachTitle}>Profesor IA</Text>
          <Text selectable style={styles.coachText}>{contextualMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 440, gap: 8 },
  coachButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: '#22362C',
    borderWidth: 1,
    borderColor: '#3B5A49',
  },
  coachButtonText: { color: '#F6E6BD', fontSize: 14, fontWeight: '800' },
  disabledButton: { opacity: 0.5 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  coachCard: {
    width: '100%',
    gap: 5,
    padding: 14,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: '#1B3025',
    borderWidth: 1,
    borderColor: '#3B5A49',
  },
  coachTitle: { color: '#F5C451', fontSize: 13, fontWeight: '900' },
  coachText: { color: '#E4ECE7', fontSize: 14, lineHeight: 20 },
});
