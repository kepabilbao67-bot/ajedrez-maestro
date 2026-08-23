import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import type { GameStatus } from '@/chess';

const REASONS = {
  stalemate: 'Ahogado',
  'fifty-move': 'Regla de cincuenta movimientos',
  'threefold-repetition': 'Triple repetición',
  'insufficient-material': 'Material insuficiente',
} as const;

interface GameOverModalProps {
  readonly status: GameStatus;
  readonly moveCount: number;
  readonly onRematch: () => void;
  readonly onNewGame: () => void;
}

export function GameOverModal({ status, moveCount, onRematch, onNewGame }: GameOverModalProps) {
  const result = status.checkmate ? `${status.winner === 'w' ? 'Blancas' : 'Negras'} ganan` : 'Tablas';
  const reason = status.checkmate ? 'Jaque mate' : status.drawReason ? REASONS[status.drawReason] : '';

  return (
    <Modal transparent visible={status.gameOver} animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View entering={ZoomIn.duration(220)} accessibilityRole="alert" style={styles.card}>
          <Animated.Text entering={FadeInDown.delay(60).duration(180)} selectable style={styles.icon}>
            {status.checkmate ? '♛' : '½–½'}
          </Animated.Text>
          <Text selectable style={styles.eyebrow}>PARTIDA FINALIZADA</Text>
          <Text selectable style={styles.result}>{result}</Text>
          <Text selectable style={styles.reason}>{reason}</Text>
          <View style={styles.summary}>
            <Text selectable style={styles.summaryValue}>{moveCount}</Text>
            <Text selectable style={styles.summaryLabel}>{moveCount === 1 ? 'jugada' : 'jugadas'}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={onRematch} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>Jugar de nuevo</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onNewGame} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
            <Text style={styles.secondaryText}>Nueva partida</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(5, 12, 9, 0.88)', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 420, alignSelf: 'center', backgroundColor: '#F8F4EA', borderRadius: 26, borderCurve: 'continuous', padding: 24, gap: 10, alignItems: 'stretch', borderWidth: 1, borderColor: '#D6C397', boxShadow: '0 18px 44px rgba(0, 0, 0, 0.44)' },
  icon: { color: '#315C4A', fontSize: 52, lineHeight: 58, fontWeight: '900', textAlign: 'center', fontFamily: 'serif' },
  eyebrow: { color: '#8A6B2E', fontSize: 11, fontWeight: '900', letterSpacing: 2, textAlign: 'center' },
  result: { color: '#17231E', fontSize: 30, fontWeight: '900', textAlign: 'center' },
  reason: { color: '#526158', fontSize: 17, textAlign: 'center' },
  summary: { alignSelf: 'center', minWidth: 94, alignItems: 'center', paddingVertical: 9, paddingHorizontal: 14, marginVertical: 4, backgroundColor: '#E8DCC4', borderRadius: 15, borderCurve: 'continuous' },
  summaryValue: { color: '#17231E', fontSize: 20, fontWeight: '900', fontVariant: ['tabular-nums'] },
  summaryLabel: { color: '#526158', fontSize: 11, fontWeight: '700' },
  primary: { minHeight: 54, borderRadius: 16, borderCurve: 'continuous', backgroundColor: '#315C4A', alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  secondary: { minHeight: 52, borderRadius: 16, borderCurve: 'continuous', borderWidth: 1, borderColor: '#315C4A', alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#315C4A', fontSize: 16, fontWeight: '900' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
