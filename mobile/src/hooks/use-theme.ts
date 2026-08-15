/**
 * Pocksy theme hook — returns current theme colors
 */

import { Colors, type ThemeMode } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  const theme: ThemeMode = scheme === 'dark' ? 'dark' : 'light';

  return {
    colors: Colors[theme],
    theme,
    isDark: theme === 'dark',
  };
}
