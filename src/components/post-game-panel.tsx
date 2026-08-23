import { StyleSheet, Text, View } from 'react-native';

import type { GameStatus } from '@/chess';
import { XP_AWARDS } from '@/gamification/xp-types';

export interface PostGameSummaryData {
  bestMove: string;
  worstError: string;
  learning: string;
  accuracy: number;
  totalMoves: number;
  blunders: number;
}

export interface PostGamePanelProps {
  readonly status: GameStatus;
  readonly postGameSummary: PostGameSummaryData | null;
}

export function PostGamePanel({ status, postGameSummary }: PostGamePanelProps) {
  if (!status.gameOver) return null;

  const getAccuracyColor = (acc: number) => {
    if (acc >= 90) return '#00E5B4';
    if (acc >= 75) return '#D6A943';
    return '#C44732';
  };

  return (
    <View style={styles.postGamePanel}>
      <Text selectable style={styles.profileTitle}>Reporte de la partida</Text>
      <View style={styles.scoreRow}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Precisión</Text>
          <Text style={[styles.scoreValue, { color: postGameSummary ? getAccuracyColor(postGameSummary.accuracy) : '#C5D0C9' }]}>
            {postGameSummary ? `${postGameSummary.accuracy}%` : '--%'}
          </Text>
        </View>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Errores Graves</Text>
          <Text style={[styles.scoreValue, { color: postGameSummary && postGameSummary.blunders > 0 ? '#C44732' : '#C5D0C9' }]}>
            {postGameSummary ? postGameSummary.blunders : '-'}
          </Text>
        </View>
      </View>
      
      <View style={styles.insightCard}>
        <Text style={styles.insightHeader}>💎 Mejor Jugada</Text>
        <Text selectable style={styles.profileWeaknesses}>{postGameSummary?.bestMove ?? 'Analiza la partida para descubrirla.'}</Text>
      </View>

      <View style={[styles.insightCard, styles.errorCard]}>
        <Text style={styles.insightHeaderError}>❌ Momento Crítico</Text>
        <Text selectable style={styles.profileWeaknesses}>{postGameSummary?.worstError ?? 'Aún no hay análisis.'}</Text>
      </View>

      <Text selectable style={styles.profileWeaknesses}>💡 Aprendizaje: {postGameSummary?.learning ?? 'Revisa amenazas y piezas sin defender.'}</Text>
      <Text selectable style={styles.profileWeaknesses}>🏆 Recompensa: +{status.winner === 'w' ? XP_AWARDS['game-completed'] + XP_AWARDS['victory'] : XP_AWARDS['game-completed']} XP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  postGamePanel: { width: '100%', maxWidth: 440, gap: 10, padding: 14, borderRadius: 16, borderCurve: 'continuous', backgroundColor: '#1B3025', borderWidth: 1, borderColor: '#3B5A49' },
  profileTitle: { color: '#F5C451', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  profileWeaknesses: { color: '#C5D0C9', fontSize: 13, lineHeight: 18 },
  scoreRow: { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 4 },
  scoreCard: { flex: 1, backgroundColor: '#14241D', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#294235' },
  scoreLabel: { color: '#9EAFA5', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 2 },
  scoreValue: { fontSize: 24, fontWeight: '900', fontVariant: ['tabular-nums'] },
  insightCard: { backgroundColor: '#14241D', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#294235', borderLeftWidth: 4, borderLeftColor: '#00E5B4' },
  errorCard: { borderLeftColor: '#C44732' },
  insightHeader: { color: '#00E5B4', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  insightHeaderError: { color: '#C44732', fontSize: 12, fontWeight: '800', marginBottom: 4 },
});
