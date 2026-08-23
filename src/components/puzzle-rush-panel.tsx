import { StyleSheet, Text, View, Pressable } from 'react-native';

export interface PuzzleRushPanelProps {
  readonly isActive: boolean;
  readonly timeLeft: number;
  readonly score: number;
  readonly strikes: number;
  readonly maxStrikes: number;
  readonly highScore: number;
  readonly onStart: () => void;
  readonly onQuit: () => void;
}

export function PuzzleRushPanel({ isActive, timeLeft, score, strikes, maxStrikes, highScore, onStart, onQuit }: PuzzleRushPanelProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 30 && timeLeft > 0;

  if (!isActive) {
    return (
      <View style={styles.startCard}>
        <Text style={styles.startTitle}>Supervivencia de Puzzles</Text>
        <Text style={styles.startDesc}>Resuelve todos los problemas que puedas en 3 minutos. 3 fallos y estás fuera.</Text>
        {highScore > 0 ? (
          <Text style={styles.highScoreText}>Récord actual: {highScore}</Text>
        ) : null}
        <Pressable style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>Empezar Reto</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.activeCard}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Tiempo</Text>
          <Text style={[styles.statValue, isLowTime && styles.lowTime]}>{formatTime(timeLeft)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Puntos</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Vidas</Text>
          <Text style={styles.strikes}>
            {Array.from({ length: maxStrikes }).map((_, i) => (
              <Text key={i} style={i < strikes ? styles.strikeLost : styles.strikeActive}>
                {i < strikes ? '❌' : '❤️'}
              </Text>
            ))}
          </Text>
        </View>
      </View>
      <Pressable style={styles.quitButton} onPress={onQuit}>
        <Text style={styles.quitButtonText}>Rendirse</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  startCard: { width: '100%', maxWidth: 440, padding: 20, borderRadius: 16, borderCurve: 'continuous', backgroundColor: '#321B17', borderWidth: 1, borderColor: '#A84737', alignItems: 'center', gap: 10 },
  startTitle: { color: '#FFD8CF', fontSize: 18, fontWeight: '900' },
  startDesc: { color: '#C5D0C9', fontSize: 13, textAlign: 'center', marginBottom: 8 },
  highScoreText: { color: '#F7CE63', fontSize: 14, fontWeight: '800', marginBottom: 12 },
  startButton: { backgroundColor: '#C44732', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  startButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  
  activeCard: { width: '100%', maxWidth: 440, padding: 16, borderRadius: 16, borderCurve: 'continuous', backgroundColor: '#14241D', borderWidth: 1, borderColor: '#294235', gap: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', gap: 4 },
  statLabel: { color: '#9EAFA5', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  statValue: { color: '#F8F4EA', fontSize: 24, fontWeight: '900', fontVariant: ['tabular-nums'] },
  lowTime: { color: '#C44732' },
  strikes: { fontSize: 18, letterSpacing: 2 },
  strikeActive: { opacity: 1 },
  strikeLost: { opacity: 0.5 },
  
  quitButton: { alignSelf: 'center', marginTop: 4 },
  quitButtonText: { color: '#9EAFA5', fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' },
});
