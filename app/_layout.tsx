import { DarkTheme, DefaultTheme, ThemeProvider, NavigationIndependentTree } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { initializeDatabase } from '@/src/data/db/dbService';
import AppNavigator from '@/src/core/navigation/AppNavigator';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    let cancelled = false;
    initializeDatabase().catch((error) => {
      if (!cancelled) {
        console.error('[RootLayout] Database initialization failed:', error);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NavigationIndependentTree>
        <AppNavigator />
      </NavigationIndependentTree>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
