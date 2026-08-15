/**
 * Pocksy Onboarding Screen — Premium swipeable onboarding experience
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Platform,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { PocksyButton } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const colors = Colors.light;

interface OnboardingSlide {
  id: string;
  vectorIcon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  accent: string;
  gradient: readonly [string, string];
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    vectorIcon: 'wallet',
    title: 'Master Your Money',
    subtitle: 'Track expenses, monitor income, and gain complete financial clarity in real-time.',
    accent: colors.primary,
    gradient: colors.gradientPrimary,
  },
  {
    id: '2',
    vectorIcon: 'flash',
    title: 'Track in Seconds',
    subtitle: 'Lightning-fast transaction logging with smart categories and instant presets.',
    accent: '#2563EB',
    gradient: ['#3B82F6', '#1D4ED8'],
  },
  {
    id: '3',
    vectorIcon: 'pie-chart',
    title: 'Deep Visual Insights',
    subtitle: 'Understand exactly where your wealth goes with automated cashflow analytics.',
    accent: '#059669',
    gradient: ['#10B981', '#047857'],
  },
  {
    id: '4',
    vectorIcon: 'shield-checkmark',
    title: 'Budget & Grow',
    subtitle: 'Set personalized monthly limits and stay in control of your financial destiny.',
    accent: '#D97706',
    gradient: ['#F59E0B', '#B45309'],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const setOnboardingComplete = useAuthStore((s) => s.setOnboardingComplete);

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < SLIDES.length) {
      if (Platform.OS !== 'web') {
        try {
          Haptics.selectionAsync();
        } catch {}
      }
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    if (isLastSlide) {
      handleGetStarted();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleGetStarted = async () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
    await setOnboardingComplete();
    router.replace('/(auth)/login');
  };

  const handleSkip = async () => {
    await setOnboardingComplete();
    router.replace('/(auth)/login');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      {/* Decorative background glow badge */}
      <View style={styles.illustrationContainer}>
        <View style={[styles.decorCircleOuter, { borderColor: item.accent + '25' }]}>
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.decorCircleInner}
          >
            <Ionicons name={item.vectorIcon} size={64} color="#FFFFFF" />
          </LinearGradient>
        </View>
      </View>

      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 16) }]}>
      {/* Skip button */}
      {!isLastSlide && (
        <View style={styles.skipContainer}>
          <PocksyButton
            title="Skip"
            onPress={handleSkip}
            variant="ghost"
            size="sm"
            fullWidth={false}
          />
        </View>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Pagination dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <View style={styles.buttonContainer}>
          <PocksyButton
            title={isLastSlide ? 'Get Started' : 'Continue'}
            onPress={handleNext}
            icon={isLastSlide ? <Ionicons name="sparkles" size={18} color="#FFFFFF" /> : <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipContainer: {
    position: 'absolute',
    top: 50,
    right: Spacing.lg,
    zIndex: 10,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  illustrationContainer: {
    marginBottom: Spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorCircleOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow,
  },
  decorCircleInner: {
    width: 156,
    height: 156,
    borderRadius: 78,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: Spacing.sm,
  },
  slideSubtitle: {
    fontSize: FontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  bottomSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.border,
  },
  buttonContainer: {
    width: '100%',
  },
});

