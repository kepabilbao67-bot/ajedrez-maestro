import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import type { PuzzleAttempt, TrainingPuzzle } from '@/training/training-types';

export interface TrainingPanelProps {
  readonly activePuzzle: TrainingPuzzle | null;
  readonly puzzleFeedback: PuzzleAttempt | null;
  readonly onStartPuzzle: () => void;
  readonly onNextPuzzle: () => void;
}

export function TrainingPanel({
  activePuzzle,
  puzzleFeedback,
  onStartPuzzle,
  onNextPuzzle,
}: TrainingPanelProps) {
  return (
    <View accessibilityLabel="Academia táctica" style={styles.academyPanel}>
      <Text selectable style={styles.panelTitle}>Academia táctica</Text>
      {activePuzzle ? (
        <>
          <Text selectable style={styles.academyTitle}>{activePuzzle.title}</Text>
          <Text selectable style={styles.subtext}>Encuentra la mejor jugada · {activePuzzle.objective}</Text>
          {puzzleFeedback ? (
            <Animated.View
              entering={FadeIn.duration(160)}
              style={[styles.puzzleFeedback, puzzleFeedback.correct ? styles.puzzleCorrect : styles.puzzleIncorrect]}
            >
              <Text selectable style={styles.academyTitle}>{puzzleFeedback.message}</Text>
              <Text selectable style={styles.subtext}>{puzzleFeedback.explanation}</Text>
              <Text selectable style={styles.subtext}>Aprendizaje: {puzzleFeedback.learning}</Text>
              <Text selectable style={styles.subtext}>Alternativa: {puzzleFeedback.alternative}</Text>
            </Animated.View>
          ) : null}
          {puzzleFeedback?.completed ? (
            <Pressable accessibilityRole="button" onPress={onNextPuzzle} style={styles.academyButton}>
              <Text style={styles.buttonText}>Siguiente ejercicio</Text>
            </Pressable>
          ) : null}
        </>
      ) : (
        <>
          <Text selectable style={styles.subtext}>Encuentra la mejor jugada y aprende del resultado.</Text>
          <Pressable accessibilityRole="button" onPress={onStartPuzzle} style={styles.academyButton}>
            <Text style={styles.buttonText}>Iniciar ejercicio</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  academyPanel: {
    width: '100%',
    maxWidth: 440,
    gap: 8,
    padding: 14,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: '#14241D',
    borderWidth: 1,
    borderColor: '#3B5A49',
  },
  panelTitle: { color: '#F5C451', fontSize: 13, fontWeight: '900' },
  academyTitle: { color: '#F8F4EA', fontSize: 14, fontWeight: '900' },
  subtext: { color: '#C5D0C9', fontSize: 12, lineHeight: 18 },
  academyButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    borderCurve: 'continuous',
    backgroundColor: '#D6A943',
  },
  buttonText: { color: '#162019', fontSize: 16, fontWeight: '900' },
  puzzleFeedback: { gap: 5, padding: 10, borderRadius: 12, borderCurve: 'continuous', borderWidth: 1 },
  puzzleCorrect: { backgroundColor: '#1B3025', borderColor: '#3B5A49' },
  puzzleIncorrect: { backgroundColor: '#321B17', borderColor: '#A84737' },
});
