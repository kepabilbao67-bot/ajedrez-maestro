import { StyleSheet, Text, View } from 'react-native';

export interface PremiumBadgeProps {
  readonly isPro: boolean;
  readonly variant?: 'default' | 'compact' | 'feature-lock';
}

export function PremiumBadge({ isPro, variant = 'default' }: PremiumBadgeProps) {
  if (variant === 'compact') {
    return (
      <View
        accessibilityLabel={isPro ? 'PRO' : 'FREE'}
        accessibilityRole="text"
        style={[styles.compactBadge, isPro ? styles.proBadge : styles.freeBadge]}
      >
        <Text style={[styles.compactText, isPro ? styles.proText : styles.freeText]}>
          {isPro ? 'PRO' : 'FREE'}
        </Text>
      </View>
    );
  }

  if (variant === 'feature-lock') {
    return (
      <View
        accessibilityLabel="Requiere PRO"
        accessibilityRole="text"
        style={[styles.featureLockBadge, isPro ? styles.proBadge : styles.lockedBadge]}
      >
        <Text style={[styles.featureLockText, isPro ? styles.proText : styles.lockedText]}>
          {isPro ? '✨ PRO' : '🔒 PRO'}
        </Text>
      </View>
    );
  }

  return (
    <View
      accessibilityLabel={isPro ? 'Cuenta PRO activa' : 'Cuenta FREE'}
      accessibilityRole="text"
      style={[styles.defaultBadge, isPro ? styles.proBadge : styles.freeBadge]}
    >
      <Text style={[styles.defaultText, isPro ? styles.proText : styles.freeText]}>
        {isPro ? '✨ PRO' : 'FREE'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  defaultBadge: {
    minHeight: 28,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  compactBadge: {
    minHeight: 22,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  featureLockBadge: {
    minHeight: 24,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  proBadge: {
    backgroundColor: '#3B2D10',
    borderColor: '#D6A943',
  },
  freeBadge: {
    backgroundColor: '#14241D',
    borderColor: '#294235',
  },
  lockedBadge: {
    backgroundColor: '#1B1D1A',
    borderColor: '#3B3F3A',
  },
  defaultText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  compactText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  featureLockText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  proText: {
    color: '#F7CE63',
  },
  freeText: {
    color: '#9EAFA5',
  },
  lockedText: {
    color: '#7A827D',
  },
});
