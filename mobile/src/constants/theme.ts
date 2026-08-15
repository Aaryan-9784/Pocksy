/**
 * Pocksy Design System
 * Premium maroon + white visual identity
 */

export const Colors = {
  light: {
    primary: '#6B1E2B',
    primaryDark: '#4A121D',
    primaryLight: '#F5E9EC',
    white: '#FFFFFF',
    offWhite: '#FAF8F7',
    background: '#FAF8F7',
    card: '#FFFFFF',
    textPrimary: '#211B1D',
    textSecondary: '#766D70',
    textMuted: '#A69B9E',
    border: '#E9E1E3',
    borderLight: '#F0EAEC',
    success: '#2D8B55',
    successLight: '#E8F5EE',
    warning: '#C4841D',
    warningLight: '#FFF4E5',
    danger: '#C4392D',
    dangerLight: '#FDE8E6',
    income: '#2D8B55',
    expense: '#C4392D',
    shadow: 'rgba(33, 27, 29, 0.08)',
    overlay: 'rgba(33, 27, 29, 0.5)',
    skeleton: '#E9E1E3',
  },
  dark: {
    primary: '#E8899A',
    primaryDark: '#6B1E2B',
    primaryLight: '#2E1A1F',
    white: '#FFFFFF',
    offWhite: '#1A1517',
    background: '#151112',
    card: '#21191B',
    textPrimary: '#FFFFFF',
    textSecondary: '#B7AEB1',
    textMuted: '#7A7175',
    border: '#3D3537',
    borderLight: '#2E2629',
    success: '#4ADE80',
    successLight: '#1A2E22',
    warning: '#FBBF24',
    warningLight: '#2E2515',
    danger: '#F87171',
    dangerLight: '#2E1A18',
    income: '#4ADE80',
    expense: '#F87171',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    skeleton: '#3D3537',
  },
} as const;

export const Spacing = {
  xs: 4,
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
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 42,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    boxShadow: '0px 1px 3px rgba(33, 27, 29, 0.04)',
    elevation: 1,
  },
  md: {
    boxShadow: '0px 2px 8px rgba(33, 27, 29, 0.06)',
    elevation: 3,
  },
  lg: {
    boxShadow: '0px 4px 16px rgba(33, 27, 29, 0.08)',
    elevation: 6,
  },
} as const;

export type ThemeMode = 'light' | 'dark';

export function getColors(mode: ThemeMode = 'light') {
  return Colors[mode];
}
