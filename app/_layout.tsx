import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { CollectionProvider } from '@/context/CollectionContext';
import { Theme as ToothTheme, NavTheme } from '@/constants/Theme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    ...NavTheme.colors,
  },
};

function RootLayoutNav() {
  return (
    <ThemeProvider value={navigationTheme}>
      <CollectionProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: ToothTheme.oceanDeep },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="tooth/[id]"
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: ToothTheme.oceanDeep },
              headerTintColor: ToothTheme.textPrimary,
              headerTitleStyle: { fontWeight: '700' },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="specimen/[entryId]"
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: ToothTheme.oceanDeep },
              headerTintColor: ToothTheme.textPrimary,
              headerTitleStyle: { fontWeight: '700' },
              headerShadowVisible: false,
              title: 'Specimen',
            }}
          />
          <Stack.Screen
            name="field-note"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerStyle: { backgroundColor: ToothTheme.oceanDeep },
              headerTintColor: ToothTheme.textPrimary,
              headerTitleStyle: { fontWeight: '700' },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </CollectionProvider>
    </ThemeProvider>
  );
}
