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
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import { PocksyButton } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const colors = Colors.light;

interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  accent: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: '💎',
    title: 'Welcome to Pocksy',
    subtitle: 'Know your money.\nOwn your spending.',
    accent: colors.primary,
  },
  {
    id: '2',
    icon: '⚡',
    title: 'Track Effortlessly',
    subtitle: 'Record every expense\nin seconds.',
    accent: '#1971C2',
  },
  {
    id: '3',
    icon: '📊',
    title: 'Understand Your\nSpending',
    subtitle: 'See where your\nmoney goes.',
    accent: '#0CA678',
  },
  {
    id: '4',
    icon: '🎯',
    title: 'Build Better\nHabits',
    subtitle: 'Set budgets and\nstay in control.',
    accent: '#E8590C',
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
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (isLastSlide) {
      handleGetStarted();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleGetStarted = async () => {
    await setOnboardingComplete();
    router.replace('/(auth)/login');
  };

  const handleSkip = async () => {
    await setOnboardingComplete();
    router.replace('/(auth)/login');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      {/* Decorative background circle */}
      <View style={styles.illustrationContainer}>
        <View style={[styles.decorCircleOuter, { borderColor: item.accent + '15' }]}>
          <View style={[styles.decorCircleInner, { backgroundColor: item.accent + '10' }]}>
            <Text style={styles.slideIcon}>{item.icon}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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
            title={isLastSlide ? 'Get Started' : 'Next'}
            onPress={handleNext}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: Spacing.base,
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
  },
  decorCircleInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideIcon: {
    fontSize: 64,
  },
  slideTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: Spacing.base,
  },
  slideSubtitle: {
    fontSize: FontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  bottomSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['2xl'],
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
    width: 24,
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
