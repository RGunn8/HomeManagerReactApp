import '@/global.css';

import {
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold } from '@expo-google-fonts/outfit';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { queryClient } from '@/lib/query-client';
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
    <QueryClientProvider client={queryClient}>
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
          </Stack.Protected>
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
