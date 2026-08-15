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
};

export const DEFAULT_CURRENCY = CURRENCIES.INR;

/**
 * Format an amount with the given currency configuration
 */
export function formatAmount(
  amount: number,
  currency: CurrencyConfig = DEFAULT_CURRENCY
): string {
  const formatted = Math.abs(amount).toLocaleString(currency.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: currency.decimalPlaces,
  });
  const sign = amount < 0 ? '-' : '';
  return `${sign}${currency.symbol}${formatted}`;
}

/**
 * Format amount with sign indicator (+ for income, - for expense)
 */
export function formatSignedAmount(
  amount: number,
  type: 'income' | 'expense',
  currency: CurrencyConfig = DEFAULT_CURRENCY
): string {
  const formatted = Math.abs(amount).toLocaleString(currency.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: currency.decimalPlaces,
  });
  const sign = type === 'income' ? '+' : '-';
  return `${sign}${currency.symbol}${formatted}`;
}
