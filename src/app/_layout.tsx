import '@/global.css';

import {
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold } from '@expo-google-fonts/outfit';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { clearAuthToken } from '@/auth/auth-token';
import { useSignOut } from '@/auth/hooks/use-sign-out';
import { Colors } from '@/constants/theme';
import { setUnauthorizedHandler } from '@/lib/api-client';
import { persistOptions, queryClient } from '@/lib/query-client';
import { useAppStore } from '@/store/use-app-store';

SplashScreen.preventAutoHideAsync();

const lightNavigationTheme: Theme = {
  dark: false,
  colors: {
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.backgroundElement,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.accent,
  },
  fonts: {
    regular: { fontFamily: 'Outfit_400Regular', fontWeight: '400' },
    medium: { fontFamily: 'Outfit_500Medium', fontWeight: '500' },
    bold: { fontFamily: 'Outfit_600SemiBold', fontWeight: '600' },
    heavy: { fontFamily: 'Fraunces_600SemiBold', fontWeight: '600' },
  },
};

const darkNavigationTheme: Theme = {
  dark: true,
  colors: {
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.backgroundElement,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.accent,
  },
  fonts: lightNavigationTheme.fonts,
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);
  const onboardingCompleted = useAppStore((state) => state.onboardingCompleted);
  const [fontsLoaded, fontError] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
      <PersistQueryClientProvider
        client={queryClient}
        onSuccess={() => queryClient.resumePausedMutations()}
        persistOptions={persistOptions}
      >
        <AuthTokenGuard />
        <ThemeProvider value={colorScheme === 'dark' ? darkNavigationTheme : lightNavigationTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={!isLoggedIn}>
              <Stack.Screen name="sign-in" />
              <Stack.Screen name="create-account" />
            </Stack.Protected>
            <Stack.Protected guard={isLoggedIn && !onboardingCompleted}>
              <Stack.Screen name="onboarding" />
            </Stack.Protected>
            <Stack.Protected guard={isLoggedIn}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="inventory-add" options={{ presentation: 'modal' }} />
              <Stack.Screen name="inventory-detail" />
              <Stack.Screen name="inventory-list" />
              <Stack.Screen name="inventory-voice-entry" options={{ presentation: 'modal' }} />
              <Stack.Screen name="project-add" options={{ presentation: 'modal' }} />
              <Stack.Screen name="project-detail" />
              <Stack.Screen name="room-add" options={{ presentation: 'modal' }} />
              <Stack.Screen name="room-detail" />
              <Stack.Screen name="shopping-list-add" options={{ presentation: 'modal' }} />
              <Stack.Screen name="shopping-voice-entry" options={{ presentation: 'modal' }} />
              <Stack.Screen name="shopping-trip" />
              <Stack.Screen name="shopping-trips" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="task-detail" />
              <Stack.Screen name="tasks" />
            </Stack.Protected>
          </Stack>
        </ThemeProvider>
      </PersistQueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Expired or revoked tokens send the user back to sign in, and a signed-out app holds no token.
 * The iOS Keychain outlives an uninstall, so this also removes a token left over from a previous install.
 */
function AuthTokenGuard() {
  const signOut = useSignOut();

  useEffect(() => {
    setUnauthorizedHandler(() => void signOut());
  }, [signOut]);

  useEffect(() => {
    const clearIfSignedOut = () => {
      if (!useAppStore.getState().isLoggedIn) {
        void clearAuthToken();
      }
    };

    if (useAppStore.persist.hasHydrated()) {
      clearIfSignedOut();
    }
    return useAppStore.persist.onFinishHydration(clearIfSignedOut);
  }, []);

  return null;
}
