import { StyleSheet, Text, View } from 'react-native';

export interface UsageMeterProps {
  readonly used: number;
  readonly max: number;
  readonly label: string;
  readonly isPro: boolean;
}

export function UsageMeter({ used, max, label, isPro }: UsageMeterProps) {
  if (isPro) {
    return (
      <View
        accessibilityLabel={`${label}: ilimitado`}
        accessibilityRole="text"
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.proValue}>Ilimitado ✨</Text>
        </View>
      </View>
    );
  }

  const percentage = max > 0 ? Math.min((used / max) * 100, 100) : 0;
  const isComplete = used >= max;
  const remaining = Math.max(max - used, 0);

  return (
    <View
      accessibilityLabel={`${label}: ${used} de ${max} usadas`}
      accessibilityRole="text"
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.freeValue, isComplete && styles.completeValue]}>
          {used}/{max} {remaining === 0 ? 'usadas' : remaining === 1 ? '(1 restante)' : `(${remaining} restantes)`}
        </Text>
      </View>
      <View
        accessibilityLabel={`Progreso: ${Math.round(percentage)}%`}
        style={[styles.progressTrack, isComplete && styles.completeTrack]}
      >
        <View
          style={[
            styles.progressFill,
            { width: `${percentage}%` },
            isComplete && styles.completeFill,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    color: '#D6E0DA',
    fontSize: 12,
    fontWeight: '800',
  },
  freeValue: {
    color: '#9EAFA5',
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  completeValue: {
    color: '#FFD8CF',
  },
  proValue: {
    color: '#F7CE63',
    fontSize: 11,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: '#0C1B13',
    borderWidth: 1,
    borderColor: '#294235',
  },
  completeTrack: {
    borderColor: '#A84737',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#D6A943',
  },
  completeFill: {
    backgroundColor: '#C44732',
  },
});
