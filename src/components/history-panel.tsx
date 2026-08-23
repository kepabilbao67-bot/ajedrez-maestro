import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import type { MoveRecord } from '@/chess';

export interface HistoryPanelProps {
  readonly history: readonly MoveRecord[];
}

export function HistoryPanel({ history }: HistoryPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Animated.View layout={LinearTransition.duration(180)} style={styles.history}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((e) => !e)}
        style={({ pressed }) => [styles.historyHeader, pressed && styles.pressed]}
      >
        <View>
          <Text style={styles.historyTitle}>Historial SAN</Text>
          <Text style={styles.historySummary}>{history.length > 0 ? `Última: ${history.at(-1)?.san}` : 'Sin jugadas'}</Text>
        </View>
        <Text accessibilityElementsHidden style={styles.chevron}>{expanded ? '−' : '+'}</Text>
      </Pressable>
      {expanded ? (
        <Animated.View entering={FadeIn.duration(160)} style={styles.historyBody}>
          <Text selectable style={styles.historyText}>
            {history.length > 0 ? history.map((record, index) => `${index + 1}. ${record.san}`).join('   ') : 'El historial aparecerá después de la primera jugada.'}
          </Text>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  history: { width: '100%', maxWidth: 440, overflow: 'hidden', borderRadius: 18, borderCurve: 'continuous', backgroundColor: '#14241D', borderWidth: 1, borderColor: '#294235' },
  historyHeader: { minHeight: 64, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  historyTitle: { color: '#F6E6BD', fontSize: 14, fontWeight: '800' },
  historySummary: { color: '#9EAFA5', fontSize: 12, paddingTop: 3 },
  chevron: { color: '#F5C451', fontSize: 28, fontWeight: '300' },
  historyBody: { borderTopWidth: 1, borderTopColor: '#294235', padding: 16 },
  historyText: { color: '#D6E0DA', fontSize: 14, lineHeight: 22, fontVariant: ['tabular-nums'] },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
});
