import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import type { Color, PromotionPiece } from '@/chess';

const OPTIONS: readonly { value: PromotionPiece; label: string; white: string; black: string }[] = [
  { value: 'q', label: 'Dama', white: '♕', black: '♛' },
  { value: 'r', label: 'Torre', white: '♖', black: '♜' },
  { value: 'b', label: 'Alfil', white: '♗', black: '♝' },
  { value: 'n', label: 'Caballo', white: '♘', black: '♞' },
];

interface PromotionPickerProps {
  readonly visible: boolean;
  readonly color: Color;
  readonly onSelect: (piece: PromotionPiece) => void;
  readonly onCancel: () => void;
}

export function PromotionPicker({ visible, color, onSelect, onCancel }: PromotionPickerProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View entering={ZoomIn.duration(180)} accessibilityRole="alert" style={styles.card}>
          <Text selectable style={styles.eyebrow}>PROMOCIÓN</Text>
          <Text selectable style={styles.title}>Elige una pieza</Text>
          <Text selectable style={styles.subtitle}>La elección se aplicará inmediatamente.</Text>
          <View style={styles.options}>
            {OPTIONS.map((option, index) => (
              <Animated.View key={option.value} entering={FadeIn.delay(index * 35).duration(160)} style={styles.optionWrapper}>
                <Pressable
                  accessibilityLabel={`Promocionar a ${option.label}`}
                  accessibilityRole="button"
                  onPress={() => onSelect(option.value)}
                  style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                >
                  <Text style={styles.symbol}>{color === 'w' ? option.white : option.black}</Text>
                  <Text style={styles.label}>{option.label}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
          <Pressable accessibilityRole="button" onPress={onCancel} style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(5, 12, 9, 0.84)', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 420, alignSelf: 'center', backgroundColor: '#F8F4EA', borderRadius: 24, borderCurve: 'continuous', padding: 20, gap: 12, borderWidth: 1, borderColor: '#D6C397', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)' },
  eyebrow: { color: '#8A6B2E', fontSize: 11, fontWeight: '900', letterSpacing: 1.8, textAlign: 'center' },
  title: { color: '#17231E', fontSize: 25, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#526158', fontSize: 14, textAlign: 'center', paddingBottom: 4 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionWrapper: { flexBasis: '47%', flexGrow: 1 },
  option: { minHeight: 100, borderRadius: 17, borderCurve: 'continuous', backgroundColor: '#E8DCC4', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#B9934A' },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  symbol: { fontSize: 44, lineHeight: 50, color: '#17231E', fontFamily: 'serif' },
  label: { color: '#17231E', fontSize: 14, fontWeight: '800' },
  cancel: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderCurve: 'continuous' },
  cancelText: { color: '#315C4A', fontSize: 16, fontWeight: '900' },
});
