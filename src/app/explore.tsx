import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExternalLink } from '@/components/external-link';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 },
      ]}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>Privacidad y licencias</Text>
        <Text style={styles.subtitle}>AjedrezPro · versión 1.0.0</Text>
      </View>

      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.cardTitle}>Tus datos en esta V1</Text>
        <Text selectable style={styles.body}>
          Las partidas, el progreso, las estadísticas y las preferencias se guardan localmente en
          tu dispositivo. AjedrezPro no exige crear una cuenta y esta V1 no envía esos datos a
          servidores propios, ni integra publicidad o analítica.
        </Text>
        <Text selectable style={styles.body}>
          Puedes eliminar el progreso, las estadísticas y las preferencias desde Ajustes, usando
          “Borrar todos mis datos locales”, o desinstalando la aplicación. Este texto deberá
          actualizarse antes de añadir cuentas, compras, publicidad, analítica o servicios en línea.
        </Text>
      </View>

      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.cardTitle}>Motor de ajedrez</Text>
        <Text selectable style={styles.body}>
          La versión web incluye Stockfish 18 lite mediante stockfish.js, software libre bajo la
          licencia GNU GPL v3. La aplicación móvil utiliza un motor local alternativo.
        </Text>
        <ExternalLink href="https://github.com/nmrugg/stockfish.js/tree/18.0.8">
          <Text style={styles.link}>Código fuente correspondiente de stockfish.js</Text>
        </ExternalLink>
        <ExternalLink href="https://www.gnu.org/licenses/gpl-3.0.html">
          <Text style={styles.link}>Leer la licencia GNU GPL v3</Text>
        </ExternalLink>
      </View>

      <Link href="/" asChild>
        <Pressable accessibilityRole="button" style={styles.backButton}>
          <Text style={styles.backText}>Volver a AjedrezPro</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#09130F' },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: 14, paddingHorizontal: 18 },
  header: { gap: 4, marginBottom: 4 },
  title: { color: '#F6E6BD', fontSize: 26, fontWeight: '900' },
  subtitle: { color: '#9EAFA5', fontSize: 13 },
  card: { gap: 10, padding: 18, borderRadius: 18, backgroundColor: '#14241D', borderWidth: 1, borderColor: '#294235' },
  cardTitle: { color: '#F5C451', fontSize: 16, fontWeight: '900' },
  body: { color: '#D6E0DA', fontSize: 14, lineHeight: 21 },
  link: { color: '#7EDFC3', fontSize: 14, fontWeight: '800', lineHeight: 20 },
  backButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#D6A943' },
  backText: { color: '#162019', fontSize: 15, fontWeight: '900' },
});
