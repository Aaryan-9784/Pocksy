import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base screen size for reference (iPhone 14 / standard 390x844 layout)
const guidelineBaseWidth = 390;
const guidelineBaseHeight = 844;

export const scale = (size: number) => (SCREEN_WIDTH / guidelineBaseWidth) * size;
export const verticalScale = (size: number) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export const DimensionsUtil = {
  window: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  isSmallDevice: SCREEN_WIDTH < 375,
  isTablet: SCREEN_WIDTH >= 768,
};

/**
 * Pocksy Design System
 * Luxury Crimson + Deep Burgundy + Obsidian Charcoal + Warm White
 */

export const Colors = {
  light: {
    primary: '#6B1E2B',
    primaryDark: '#4A121D',
    primaryMedium: '#8B2638',
    primaryLight: '#FBEFF2',
    primarySubtle: 'rgba(107, 30, 43, 0.08)',
    accent: '#D97706',
    white: '#FFFFFF',
    offWhite: '#F8F6F6',
    background: '#F6F3F4',
    card: '#FFFFFF',
    cardMuted: '#F4ECEF',
    textPrimary: '#1E1719',
    textSecondary: '#6B5F63',
    textMuted: '#9E9296',
    border: '#E8DFE2',
    borderLight: '#F2EBED',
    borderFocus: '#6B1E2B',
    success: '#10B981',
    successLight: '#ECFDF5',
    successText: '#065F46',
    warning: '#F59E0B',
    warningLight: '#FFFBEB',
    warningText: '#92400E',
    danger: '#EF4444',
    dangerLight: '#FEF2F2',
    dangerText: '#991B1B',
    income: '#10B981',
    incomeLight: '#ECFDF5',
    expense: '#EF4444',
    expenseLight: '#FEF2F2',
    shadow: 'rgba(107, 30, 43, 0.08)',
    shadowDark: 'rgba(30, 23, 25, 0.15)',
    overlay: 'rgba(20, 14, 16, 0.6)',
    skeleton: '#E8DFE2',
    gradientPrimary: ['#7D2031', '#541520'] as const,
    gradientIncome: ['#10B981', '#059669'] as const,
    gradientExpense: ['#EF4444', '#DC2626'] as const,
    gradientDark: ['#281E21', '#171214'] as const,
  },
  dark: {
    primary: '#E8899A',
    primaryDark: '#6B1E2B',
    primaryMedium: '#D66D80',
    primaryLight: '#2E1A1F',
    primarySubtle: 'rgba(232, 137, 154, 0.12)',
    accent: '#FBBF24',
    white: '#FFFFFF',
    offWhite: '#181315',
    background: '#120E10',
    card: '#1F181B',
    cardMuted: '#292024',
    textPrimary: '#FFFFFF',
    textSecondary: '#BDB2B6',
    textMuted: '#7D7276',
    border: '#382D31',
    borderLight: '#2C2326',
    borderFocus: '#E8899A',
    success: '#34D399',
    successLight: '#064E3B',
    successText: '#A7F3D0',
    warning: '#FBBF24',
    warningLight: '#78350F',
    warningText: '#FDE68A',
    danger: '#F87171',
    dangerLight: '#7F1D1D',
    dangerText: '#FECACA',
    income: '#34D399',
    incomeLight: 'rgba(52, 211, 153, 0.15)',
    expense: '#F87171',
    expenseLight: 'rgba(248, 113, 113, 0.15)',
    shadow: 'rgba(0, 0, 0, 0.4)',
    shadowDark: 'rgba(0, 0, 0, 0.7)',
    overlay: 'rgba(0, 0, 0, 0.8)',
    skeleton: '#2C2326',
    gradientPrimary: ['#8B2638', '#4A121D'] as const,
    gradientIncome: ['#059669', '#047857'] as const,
    gradientExpense: ['#DC2626', '#B91C1C'] as const,
    gradientDark: ['#281E21', '#140F11'] as const,
  },
} as const;

export const Spacing = {
  '3xs': 2,
  '2xs': 4,
  xs: 6,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const FontSize = {
  '2xs': 10,
  xs: 12,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 40,
  '5xl': 48,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

export const BorderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  '2xl': 28,
  full: 9999,
} as const;

export const Shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#1E1719',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    default: {
      boxShadow: '0px 2px 6px rgba(30, 23, 25, 0.05)',
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#1E1719',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
    },
    android: {
      elevation: 4,
    },
    default: {
      boxShadow: '0px 4px 12px rgba(30, 23, 25, 0.08)',
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#4A121D',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 18,
    },
    android: {
      elevation: 8,
    },
    default: {
      boxShadow: '0px 8px 24px rgba(74, 18, 29, 0.14)',
    },
  }),
  glow: Platform.select({
    ios: {
      shadowColor: '#6B1E2B',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.28,
      shadowRadius: 14,
    },
    android: {
      elevation: 6,
    },
    default: {
      boxShadow: '0px 6px 20px rgba(107, 30, 43, 0.28)',
    },
  }),
} as const;

export type ThemeMode = 'light' | 'dark';

export function getColors(mode: ThemeMode = 'light') {
  return Colors[mode];
}

