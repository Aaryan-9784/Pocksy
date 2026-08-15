/**
 * Pocksy Root Entry
 * Evaluates authentication and onboarding state to redirect seamlessly
 */

import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export default function Index() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasSeenOnboarding = useAuthStore((s) => s.hasSeenOnboarding);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
});
