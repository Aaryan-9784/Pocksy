import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Platform, LogBox } from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Suppress benign React Native Web deprecation warnings
LogBox.ignoreLogs(['props.pointerEvents is deprecated']);

if (Platform.OS === 'web' && typeof console !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('pointerEvents is deprecated') || args[0].includes('Slow network is detected'))
    ) {
      return;
    }
    originalWarn(...args);
  };
}

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  // Preload icon fonts to prevent browser font fallback interventions
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...Feather.font,
  });

  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasSeenOnboarding = useAuthStore((s) => s.hasSeenOnboarding);
  const loadPersistedState = useAuthStore((s) => s.loadPersistedState);

  // Global web CSS reset for clean focus rings
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        input, textarea, select {
          outline: none !important;
          outline-style: none !important;
          box-shadow: none !important;
        }
        input:focus, textarea:focus, select:focus {
          outline: none !important;
          outline-style: none !important;
          box-shadow: none !important;
        }
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Load persisted auth & onboarding state on mount
  useEffect(() => {
    loadPersistedState();
  }, []);

  // Hide splash screen once loading and fonts are done
  useEffect(() => {
    if (!isLoading && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, fontsLoaded]);

  // Redirect based on auth state
  useEffect(() => {
    if (isLoading || !fontsLoaded) return;

    const inOnboarding = segments[0] === '(onboarding)';
    const inAuth = segments[0] === '(auth)';
    const inTabs = segments[0] === '(tabs)';

    if (!hasSeenOnboarding) {
      // Show onboarding
      if (!inOnboarding) {
        router.replace('/(onboarding)');
      }
    } else if (!isAuthenticated) {
      // Show auth
      if (!inAuth) {
        router.replace('/(auth)/login');
      }
    } else {
      // Show main app
      if (!inTabs) {
        router.replace('/(tabs)');
      }
    }
  }, [isLoading, fontsLoaded, isAuthenticated, hasSeenOnboarding, segments]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
