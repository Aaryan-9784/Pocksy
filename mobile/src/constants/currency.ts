/**
 * Pocksy Currency Configuration
 * Default: INR — architecture supports multiple currencies
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimalPlaces: number;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
    decimalPlaces: 2,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    decimalPlaces: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    decimalPlaces: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    decimalPlaces: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    locale: 'ja-JP',
    decimalPlaces: 0,
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    locale: 'ar-AE',
    decimalPlaces: 2,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    locale: 'en-CA',
    decimalPlaces: 2,
  },
  AUD: {
    code: 'AUD',
    symbol: 'AU$',
    name: 'Australian Dollar',
    locale: 'en-AU',
    decimalPlaces: 2,
  },
};

export const DEFAULT_CURRENCY = CURRENCIES.INR;

function getActiveCurrencyConfig(override?: CurrencyConfig): CurrencyConfig {
  if (override) return override;
  try {
    const { useAuthStore } = require('@/store/authStore');
    const user = useAuthStore.getState().user;
    if (user?.currency && CURRENCIES[user.currency]) {
      return CURRENCIES[user.currency];
    }
  } catch {}
  return DEFAULT_CURRENCY;
}

/**
 * Format an amount with the active or specified currency
 */
export function formatAmount(
  amount: number,
  currency?: CurrencyConfig
): string {
  const activeCurrency = getActiveCurrencyConfig(currency);
  const formatted = Math.abs(amount).toLocaleString(activeCurrency.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: activeCurrency.decimalPlaces,
  });
  const sign = amount < 0 ? '-' : '';
  return `${sign}${activeCurrency.symbol}${formatted}`;
}

/**
 * Format amount with sign indicator (+ for income, - for expense)
 */
export function formatSignedAmount(
  amount: number,
  type: 'income' | 'expense',
  currency?: CurrencyConfig
): string {
  const activeCurrency = getActiveCurrencyConfig(currency);
  const formatted = Math.abs(amount).toLocaleString(activeCurrency.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: activeCurrency.decimalPlaces,
  });
  const sign = type === 'income' ? '+' : '-';
  return `${sign}${activeCurrency.symbol}${formatted}`;
}

