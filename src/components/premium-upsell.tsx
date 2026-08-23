import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export interface PremiumUpsellModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onUpgrade: () => void;
}

export function PremiumUpsellModal({ visible, onClose, onUpgrade }: PremiumUpsellModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>AjedrezPro Premium</Text>
          <Text style={styles.subtitle}>Has alcanzado el límite gratuito. Desbloquea todo el potencial de tu juego.</Text>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>♾️</Text>
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Análisis Ilimitado</Text>
                <Text style={styles.benefitDescription}>Descubre tus errores y brillanteces en cada partida sin restricciones.</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🧠</Text>
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Profesor IA Gran Maestro</Text>
                <Text style={styles.benefitDescription}>Pistas ilimitadas y explicaciones detalladas para mejorar tu juego.</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🎨</Text>
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Temas Exclusivos</Text>
                <Text style={styles.benefitDescription}>Acceso a temas de tablero como Ocean, Cherry Blossom y piezas 3D.</Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.upgradeButton} onPress={onUpgrade}>
              <Text style={styles.upgradeText}>Desbloquear Premium</Text>
            </Pressable>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>Quizás más tarde</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(9, 19, 15, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400, backgroundColor: '#1B3025', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#D6A943', alignItems: 'center' },
  title: { color: '#F7CE63', fontSize: 24, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: '#E4ECE7', fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  benefitsList: { width: '100%', gap: 16, marginBottom: 32 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  benefitIcon: { fontSize: 32 },
  benefitTextContainer: { flex: 1 },
  benefitTitle: { color: '#F8F4EA', fontSize: 15, fontWeight: '800', marginBottom: 2 },
  benefitDescription: { color: '#9EAFA5', fontSize: 13, lineHeight: 18 },
  actions: { width: '100%', gap: 12 },
  upgradeButton: { backgroundColor: '#D6A943', width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#D6A943', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  upgradeText: { color: '#162019', fontSize: 16, fontWeight: '900' },
  closeButton: { width: '100%', paddingVertical: 12, alignItems: 'center' },
  closeText: { color: '#9EAFA5', fontSize: 14, fontWeight: '700' },
});
