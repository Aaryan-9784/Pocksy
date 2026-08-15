/**
 * Pocksy Categories, Income Sources, and Payment Methods
 */

export interface CategoryItem {
  id: string;
  label: string;
  icon: string; // emoji for now, can be swapped for icon component
  color: string;
  bgColor: string;
}

export const EXPENSE_CATEGORIES: CategoryItem[] = [
  { id: 'food', label: 'Food', icon: '🍔', color: '#E8590C', bgColor: '#FFF4E6' },
  { id: 'travel', label: 'Travel', icon: '✈️', color: '#1971C2', bgColor: '#E7F5FF' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#9C36B5', bgColor: '#F8F0FC' },
  { id: 'bills', label: 'Bills', icon: '📄', color: '#5C940D', bgColor: '#F4FCE3' },
  { id: 'education', label: 'Education', icon: '📚', color: '#1098AD', bgColor: '#E3FAFC' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#F76707', bgColor: '#FFF4E6' },
  { id: 'health', label: 'Health', icon: '💊', color: '#E03131', bgColor: '#FFF5F5' },
  { id: 'rent', label: 'Rent', icon: '🏠', color: '#6741D9', bgColor: '#F3F0FF' },
  { id: 'subscriptions', label: 'Subscriptions', icon: '🔄', color: '#0CA678', bgColor: '#E6FCF5' },
  { id: 'other', label: 'Other', icon: '📌', color: '#868E96', bgColor: '#F8F9FA' },
];

export const INCOME_SOURCES: CategoryItem[] = [
  { id: 'salary', label: 'Salary', icon: '💰', color: '#2D8B55', bgColor: '#E8F5EE' },
  { id: 'freelance', label: 'Freelance', icon: '💻', color: '#1971C2', bgColor: '#E7F5FF' },
  { id: 'business', label: 'Business', icon: '🏢', color: '#6741D9', bgColor: '#F3F0FF' },
  { id: 'investment', label: 'Investment', icon: '📈', color: '#E8590C', bgColor: '#FFF4E6' },
  { id: 'gift', label: 'Gift', icon: '🎁', color: '#E03131', bgColor: '#FFF5F5' },
  { id: 'other', label: 'Other', icon: '📌', color: '#868E96', bgColor: '#F8F9FA' },
];

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: '💵' },
  { id: 'upi', label: 'UPI', icon: '📱' },
  { id: 'credit_card', label: 'Credit Card', icon: '💳' },
  { id: 'debit_card', label: 'Debit Card', icon: '💳' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { id: 'other', label: 'Other', icon: '💰' },
] as const;

export function getCategoryById(id: string): CategoryItem | undefined {
  return (
    EXPENSE_CATEGORIES.find((c) => c.id === id) ||
    INCOME_SOURCES.find((c) => c.id === id)
  );
}

export function getPaymentMethodById(id: string) {
  return PAYMENT_METHODS.find((p) => p.id === id);
}
