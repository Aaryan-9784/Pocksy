import React, { useEffect, useState, useRef } from 'react';
import {
  Stack,
  useRouter,
  useSegments,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import {
  Platform,
  LogBox,
  AppState,
  type AppStateStatus,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/authStore';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { PocksyButton } from '@/components/ui';

const colors = Colors.light;

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Suppress benign React Native Web deprecation warnings
LogBox.ignoreLogs(['props.pointerEvents is deprecated']);

if ((Platform.OS as string) === 'web' && typeof console !== 'undefined') {
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

  // Preload icon fonts
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...Feather.font,
  });

  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasSeenOnboarding = useAuthStore((s) => s.hasSeenOnboarding);
  const loadPersistedState = useAuthStore((s) => s.loadPersistedState);

  // Biometric App Lock state
  const [isLocked, setIsLocked] = useState(false);
  const [biometricsChecked, setBiometricsChecked] = useState(false);
  const appState = useRef(AppState.currentState);

  // Global web CSS reset for clean focus rings & browser title
  useEffect(() => {
    if ((Platform.OS as string) === 'web' && typeof document !== 'undefined') {
      document.title = 'Pocksy — Smart Wealth & Expense Tracker';
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

  // Check biometric lock setting on app launch
  useEffect(() => {
    const checkInitialLock = async () => {
      if ((Platform.OS as string) === 'web') {
        setBiometricsChecked(true);
        return;
      }

      try {
        const lockEnabled = await AsyncStorage.getItem('pocksy_biometric_enabled');
        if (lockEnabled === 'true' && isAuthenticated) {
          setIsLocked(true);
          authenticateUser();
        }
      } catch (err) {
        console.warn('Biometric check error:', err);
      } finally {
        setBiometricsChecked(true);
      }
    };

    if (!isLoading && fontsLoaded) {
      checkInitialLock();
    }
  }, [isLoading, fontsLoaded, isAuthenticated]);

  // Listen to AppState changes (e.g. app goes to background and comes back)
  useEffect(() => {
    if ((Platform.OS as string) === 'web') return;

    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const lockEnabled = await AsyncStorage.getItem('pocksy_biometric_enabled');
        if (lockEnabled === 'true' && isAuthenticated) {
          setIsLocked(true);
          authenticateUser();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  // Biometric authentication trigger
  const authenticateUser = async () => {
    if ((Platform.OS as string) === 'web') {
      setIsLocked(false);
      return;
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setIsLocked(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Pocksy with Face ID or Fingerprint',
        fallbackLabel: 'Use Device Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsLocked(false);
      }
    } catch (err) {
      console.warn('Authentication failed:', err);
    }
  };

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
      if (!inOnboarding) {
        router.replace('/(onboarding)');
      }
    } else if (!isAuthenticated) {
      if (!inAuth) {
        router.replace('/(auth)/login');
      }
    } else {
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

      {/* Real Fullscreen Biometric / Face ID Lock Screen */}
      {isLocked && (
        <View style={lockStyles.overlay}>
          <View style={lockStyles.content}>
            <View style={lockStyles.glowOuterRing}>
              <LinearGradient
                colors={colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={lockStyles.iconCore}
              >
                <Ionicons name="scan" size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>

            <Text style={lockStyles.title}>Pocksy is Locked</Text>
            <Text style={lockStyles.subtitle}>
              Unlock with Face ID, Fingerprint, or Passcode to access your finances.
            </Text>

            <View style={lockStyles.buttonContainer}>
              <PocksyButton
                title="Unlock Pocksy"
                onPress={authenticateUser}
                variant="primary"
                icon={<Ionicons name="finger-print" size={20} color="#FFFFFF" />}
              />
            </View>
          </View>
        </View>
      )}
    </>
  );
}

const lockStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: Spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    ...Shadows.lg,
  },
  glowOuterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: 'rgba(107, 30, 43, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  iconCore: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.heavy,
    color: colors.textPrimary,
    marginBottom: Spacing.xs,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  buttonContainer: {
    width: '100%',
  },
});
