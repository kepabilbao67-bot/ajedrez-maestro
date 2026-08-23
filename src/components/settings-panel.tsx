import { Link } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BOARD_THEMES } from '@/board-themes/board-themes';
import { PIECE_SETS } from '@/board-themes/piece-sets';
import type { VisualPreferences } from '@/theme/visual-preferences';

export interface SettingsPanelProps {
  readonly expanded: boolean;
  readonly onToggle: () => void;
  readonly visualPreferences: VisualPreferences;
  readonly onUpdatePreferences: (change: Partial<VisualPreferences>) => void;
  readonly onEraseAllData: () => Promise<void>;
}

export function SettingsPanel({ expanded, onToggle, visualPreferences, onUpdatePreferences, onEraseAllData }: SettingsPanelProps) {
  const confirmEraseAllData = (): void => {
    Alert.alert(
      '¿Borrar todos los datos locales?',
      'Se eliminarán el progreso, las estadísticas, las preferencias y la configuración de bienvenida de este dispositivo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: () => {
            void onEraseAllData().catch(() => {
              Alert.alert('No se pudieron borrar los datos', 'Vuelve a intentarlo desde Ajustes.');
            });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.settingsPanel}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={({ pressed }) => [styles.settingsHeader, pressed && styles.pressed]}
      >
        <View>
          <Text selectable style={styles.profileTitle}>Ajustes</Text>
          <Text selectable style={styles.settingsSummary}>Tema, piezas y privacidad</Text>
        </View>
        <Text accessibilityElementsHidden style={styles.chevron}>{expanded ? '−' : '+'}</Text>
      </Pressable>
      {expanded ? (
        <Animated.View entering={FadeIn.duration(160)} style={styles.settingsBody}>
          <Text selectable style={styles.settingsLabel}>Tema del tablero</Text>
          <View style={styles.preferenceOptions}>
            {BOARD_THEMES.map((theme) => (
              <Pressable key={theme.id} accessibilityRole="radio" accessibilityState={{ checked: visualPreferences.boardTheme === theme.id }} onPress={() => onUpdatePreferences({ boardTheme: theme.id })} style={[styles.preferenceOption, visualPreferences.boardTheme === theme.id && styles.preferenceOptionActive]}>
                <Text style={[styles.preferenceText, visualPreferences.boardTheme === theme.id && styles.preferenceTextActive]}>{theme.name}</Text>
              </Pressable>
            ))}
          </View>
          <Text selectable style={styles.settingsLabel}>Piezas</Text>
          <View style={styles.preferenceOptions}>
            {PIECE_SETS.map((set) => (
              <Pressable key={set.id} accessibilityRole="radio" accessibilityState={{ checked: visualPreferences.pieceSet === set.id }} onPress={() => onUpdatePreferences({ pieceSet: set.id })} style={[styles.preferenceOption, visualPreferences.pieceSet === set.id && styles.preferenceOptionActive]}>
                <Text style={[styles.preferenceText, visualPreferences.pieceSet === set.id && styles.preferenceTextActive]}>{set.name}</Text>
              </Pressable>
            ))}
          </View>
          <Link href="/explore" asChild>
            <Pressable accessibilityRole="button" style={styles.legalLink}>
              <Text style={styles.legalLinkText}>Privacidad, ayuda y licencias</Text>
            </Pressable>
          </Link>
          <Pressable accessibilityRole="button" onPress={confirmEraseAllData} style={styles.eraseButton}>
            <Text style={styles.eraseButtonText}>Borrar todos mis datos locales</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  settingsPanel: { width: '100%', maxWidth: 440, overflow: 'hidden', borderRadius: 18, borderCurve: 'continuous', backgroundColor: '#14241D', borderWidth: 1, borderColor: '#294235' },
  settingsHeader: { minHeight: 64, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileTitle: { color: '#F5C451', fontSize: 13, fontWeight: '900' },
  settingsSummary: { color: '#9EAFA5', fontSize: 12, paddingTop: 3 },
  chevron: { color: '#F5C451', fontSize: 28, fontWeight: '300' },
  settingsBody: { gap: 9, borderTopWidth: 1, borderTopColor: '#294235', padding: 14 },
  settingsLabel: { color: '#D6E0DA', fontSize: 13, fontWeight: '800' },
  preferenceOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  preferenceOption: { minHeight: 38, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderCurve: 'continuous', backgroundColor: '#22362C', borderWidth: 1, borderColor: '#3B5A49' },
  preferenceOptionActive: { backgroundColor: '#D6A943', borderColor: '#D6A943' },
  preferenceText: { color: '#C5D0C9', fontSize: 12, fontWeight: '800' },
  preferenceTextActive: { color: '#162019' },
  legalLink: { minHeight: 42, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, borderRadius: 11, borderCurve: 'continuous', backgroundColor: '#22362C' },
  legalLinkText: { color: '#7EDFC3', fontSize: 12, fontWeight: '900' },
  eraseButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, borderRadius: 11, borderCurve: 'continuous', borderWidth: 1, borderColor: '#A84737', backgroundColor: '#321B17' },
  eraseButtonText: { color: '#FFD8CF', fontSize: 12, fontWeight: '900', textAlign: 'center' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
});
