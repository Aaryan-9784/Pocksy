/**
 * Pocksy Categories, Income Sources, and Payment Methods
 */

export interface CategoryItem {
  id: string;
  label: string;
  icon: string; // fallback emoji
  vectorIcon: string; // Ionicons icon name
  color: string;
  bgColor: string;
}

export const EXPENSE_CATEGORIES: CategoryItem[] = [
  { id: 'food', label: 'Food', icon: '🍔', vectorIcon: 'fast-food', color: '#EA580C', bgColor: '#FFEDD5' },
  { id: 'travel', label: 'Travel', icon: '✈️', vectorIcon: 'car-sport', color: '#2563EB', bgColor: '#DBEAFE' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', vectorIcon: 'bag-handle', color: '#9333EA', bgColor: '#F3E8FF' },
  { id: 'bills', label: 'Bills', icon: '📄', vectorIcon: 'receipt', color: '#16A34A', bgColor: '#DCFCE7' },
  { id: 'education', label: 'Education', icon: '📚', vectorIcon: 'school', color: '#0891B2', bgColor: '#CFFAFE' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', vectorIcon: 'film', color: '#D97706', bgColor: '#FEF3C7' },
  { id: 'health', label: 'Health', icon: '💊', vectorIcon: 'medkit', color: '#DC2626', bgColor: '#FEE2E2' },
  { id: 'rent', label: 'Rent', icon: '🏠', vectorIcon: 'home', color: '#7C3AED', bgColor: '#EDE9FE' },
  { id: 'subscriptions', label: 'Subscriptions', icon: '🔄', vectorIcon: 'repeat', color: '#0D9488', bgColor: '#CCFBF1' },
  { id: 'other', label: 'Other', icon: '📌', vectorIcon: 'ellipsis-horizontal-circle', color: '#8B7D82', bgColor: '#F4ECEF' },
];

export const INCOME_SOURCES: CategoryItem[] = [
  { id: 'salary', label: 'Salary', icon: '💰', vectorIcon: 'wallet', color: '#16A34A', bgColor: '#DCFCE7' },
  { id: 'freelance', label: 'Freelance', icon: '💻', vectorIcon: 'laptop', color: '#2563EB', bgColor: '#DBEAFE' },
  { id: 'business', label: 'Business', icon: '🏢', vectorIcon: 'business', color: '#7C3AED', bgColor: '#EDE9FE' },
  { id: 'investment', label: 'Investment', icon: '📈', vectorIcon: 'trending-up', color: '#EA580C', bgColor: '#FFEDD5' },
  { id: 'gift', label: 'Gift', icon: '🎁', vectorIcon: 'gift', color: '#DC2626', bgColor: '#FEE2E2' },
  { id: 'other', label: 'Other', icon: '📌', vectorIcon: 'add-circle', color: '#8B7D82', bgColor: '#F4ECEF' },
];

export interface PaymentMethodItem {
  id: string;
  label: string;
  icon: string;
  vectorIcon: string;
}

export const PAYMENT_METHODS: PaymentMethodItem[] = [
  { id: 'cash', label: 'Cash', icon: '💵', vectorIcon: 'cash-outline' },
  { id: 'upi', label: 'UPI', icon: '📱', vectorIcon: 'flash-outline' },
  { id: 'credit_card', label: 'Credit Card', icon: '💳', vectorIcon: 'card-outline' },
  { id: 'debit_card', label: 'Debit Card', icon: '💳', vectorIcon: 'card' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: '🏦', vectorIcon: 'business-outline' },
  { id: 'other', label: 'Other', icon: '💰', vectorIcon: 'wallet-outline' },
];

export function getCategoryById(id: string): CategoryItem | undefined {
  return (
    EXPENSE_CATEGORIES.find((c) => c.id === id) ||
    INCOME_SOURCES.find((c) => c.id === id)
  );
}

export function getPaymentMethodById(id: string) {
  return PAYMENT_METHODS.find((p) => p.id === id);
}

