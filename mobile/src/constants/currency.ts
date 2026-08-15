/**
 * Pocksy Global Currency Configuration
 * Covers major world economies, top financial hubs & richest nations
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  country?: string;
  locale: string;
  decimalPlaces: number;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    country: 'India',
    locale: 'en-IN',
    decimalPlaces: 2,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    country: 'United States',
    locale: 'en-US',
    decimalPlaces: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    country: 'European Union (Germany, France, etc.)',
    locale: 'de-DE',
    decimalPlaces: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    country: 'United Kingdom',
    locale: 'en-GB',
    decimalPlaces: 2,
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    country: 'Switzerland',
    locale: 'de-CH',
    decimalPlaces: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    country: 'Japan',
    locale: 'ja-JP',
    decimalPlaces: 0,
  },
  SGD: {
    code: 'SGD',
    symbol: '$',
    name: 'Singapore Dollar',
    country: 'Singapore',
    locale: 'en-SG',
    decimalPlaces: 2,
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    country: 'United Arab Emirates / Dubai',
    locale: 'ar-AE',
    decimalPlaces: 2,
  },
  SAR: {
    code: 'SAR',
    symbol: '﷼',
    name: 'Saudi Riyal',
    country: 'Saudi Arabia',
    locale: 'ar-SA',
    decimalPlaces: 2,
  },
  QAR: {
    code: 'QAR',
    symbol: 'QR',
    name: 'Qatari Riyal',
    country: 'Qatar',
    locale: 'ar-QA',
    decimalPlaces: 2,
  },
  KWD: {
    code: 'KWD',
    symbol: 'KD',
    name: 'Kuwaiti Dinar',
    country: 'Kuwait',
    locale: 'ar-KW',
    decimalPlaces: 3,
  },
  BHD: {
    code: 'BHD',
    symbol: 'BD',
    name: 'Bahraini Dinar',
    country: 'Bahrain',
    locale: 'ar-BH',
    decimalPlaces: 3,
  },
  CAD: {
    code: 'CAD',
    symbol: '$',
    name: 'Canadian Dollar',
    country: 'Canada',
    locale: 'en-CA',
    decimalPlaces: 2,
  },
  AUD: {
    code: 'AUD',
    symbol: '$',
    name: 'Australian Dollar',
    country: 'Australia',
    locale: 'en-AU',
    decimalPlaces: 2,
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan (RMB)',
    country: 'China',
    locale: 'zh-CN',
    decimalPlaces: 2,
  },
  HKD: {
    code: 'HKD',
    symbol: '$',
    name: 'Hong Kong Dollar',
    country: 'Hong Kong',
    locale: 'zh-HK',
    decimalPlaces: 2,
  },
  KRW: {
    code: 'KRW',
    symbol: '₩',
    name: 'South Korean Won',
    country: 'South Korea',
    locale: 'ko-KR',
    decimalPlaces: 0,
  },
  SEK: {
    code: 'SEK',
    symbol: 'kr',
    name: 'Swedish Krona',
    country: 'Sweden',
    locale: 'sv-SE',
    decimalPlaces: 2,
  },
  NOK: {
    code: 'NOK',
    symbol: 'kr',
    name: 'Norwegian Krone',
    country: 'Norway',
    locale: 'nb-NO',
    decimalPlaces: 2,
  },
  DKK: {
    code: 'DKK',
    symbol: 'kr',
    name: 'Danish Krone',
    country: 'Denmark',
    locale: 'da-DK',
    decimalPlaces: 2,
  },
  NZD: {
    code: 'NZD',
    symbol: '$',
    name: 'New Zealand Dollar',
    country: 'New Zealand',
    locale: 'en-NZ',
    decimalPlaces: 2,
  },
  MYR: {
    code: 'MYR',
    symbol: 'RM',
    name: 'Malaysian Ringgit',
    country: 'Malaysia',
    locale: 'ms-MY',
    decimalPlaces: 2,
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    country: 'Thailand',
    locale: 'th-TH',
    decimalPlaces: 2,
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    country: 'Brazil',
    locale: 'pt-BR',
    decimalPlaces: 2,
  },
  MXN: {
    code: 'MXN',
    symbol: '$',
    name: 'Mexican Peso',
    country: 'Mexico',
    locale: 'es-MX',
    decimalPlaces: 2,
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    country: 'South Africa',
    locale: 'en-ZA',
    decimalPlaces: 2,
  },
  TRY: {
    code: 'TRY',
    symbol: '₺',
    name: 'Turkish Lira',
    country: 'Turkey',
    locale: 'tr-TR',
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
 * Format amount with sign indicator (+ for income, - for expense, ⇄ for transfer)
 */
export function formatSignedAmount(
  amount: number,
  type: 'income' | 'expense' | 'transfer',
  currency?: CurrencyConfig
): string {
  const activeCurrency = getActiveCurrencyConfig(currency);
  const formatted = Math.abs(amount).toLocaleString(activeCurrency.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: activeCurrency.decimalPlaces,
  });
  const sign = type === 'income' ? '+' : type === 'expense' ? '-' : '⇄ ';
  return `${sign}${activeCurrency.symbol}${formatted}`;
}
