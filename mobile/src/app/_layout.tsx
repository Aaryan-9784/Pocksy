/**
 * Pocksy Root Layout
 * Determines routing: Onboarding → Auth → Main Tabs
 */

import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasSeenOnboarding = useAuthStore((s) => s.hasSeenOnboarding);
  const loadPersistedState = useAuthStore((s) => s.loadPersistedState);

  // Load persisted auth & onboarding state on mount
  useEffect(() => {
    loadPersistedState();
  }, []);

  // Hide splash screen once loading is done
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Redirect based on auth state
  useEffect(() => {
    if (isLoading) return;

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
  }, [isLoading, isAuthenticated, hasSeenOnboarding, segments]);

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
