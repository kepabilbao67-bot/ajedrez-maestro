import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.title = 'AjedrezPro · Entrena y juega al ajedrez';
    }
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
