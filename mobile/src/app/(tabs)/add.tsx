/**
 * Pocksy Add Transaction Screen
 * Full form for adding income/expense transactions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { PocksyButton, PocksyInput, AmountInput, CategoryIcon } from '@/components/ui';
import { EXPENSE_CATEGORIES, INCOME_SOURCES, PAYMENT_METHODS } from '@/constants/categories';
import { useTransactionStore } from '@/store/transactionStore';
import { useDashboardStore } from '@/store/dashboardStore';
import type { TransactionType } from '@/types';

const colors = Colors.light;

export default function AddScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const refreshDashboard = useDashboardStore((s) => s.refresh);

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_SOURCES;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Enter a valid amount';
    }
    if (!category) {
      newErrors.category = 'Select a category';
    }
    if (!description.trim()) {
      newErrors.description = 'Enter a description';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await addTransaction({
        type,
        amount: parseFloat(amount),
        category,
        description: description.trim(),
        paymentMethod: paymentMethod || undefined,
        date: new Date().toISOString(),
        notes: notes.trim() || undefined,
      });

      // Refresh dashboard data
      refreshDashboard();

      Alert.alert(
        'Success! 🎉',
        `${type === 'income' ? 'Income' : 'Expense'} of ₹${amount} added.`,
        [{ text: 'OK' }]
      );

      // Reset form
      setAmount('');
      setCategory('');
      setDescription('');
      setPaymentMethod('');
      setNotes('');
      setErrors({});
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing['4xl'] }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add Transaction</Text>
        </View>

        {/* Type Toggle */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'expense' && styles.typeButtonExpense,
            ]}
            onPress={() => { setType('expense'); setCategory(''); }}
          >
            <Text style={[
              styles.typeButtonText,
              type === 'expense' && styles.typeButtonTextActive,
            ]}>
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'income' && styles.typeButtonIncome,
            ]}
            onPress={() => { setType('income'); setCategory(''); }}
          >
            <Text style={[
              styles.typeButtonText,
              type === 'income' && styles.typeButtonTextActive,
            ]}>
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <PocksyInput
              placeholder="0.00"
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              error={errors.amount}
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category {errors.category ? <Text style={styles.errorText}>- {errors.category}</Text> : null}</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  category === cat.id && { backgroundColor: cat.bgColor, borderColor: cat.color },
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[
                  styles.categoryLabel,
                  category === cat.id && { color: cat.color, fontWeight: FontWeight.semibold },
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <PocksyInput
            label="Description"
            placeholder={type === 'expense' ? 'e.g. Lunch at cafe' : 'e.g. Monthly salary'}
            value={description}
            onChangeText={setDescription}
            error={errors.description}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.label}>Payment Method (Optional)</Text>
          <View style={styles.paymentRow}>
            {PAYMENT_METHODS.map((pm) => (
              <TouchableOpacity
                key={pm.id}
                style={[
                  styles.paymentChip,
                  paymentMethod === pm.id && styles.paymentChipActive,
                ]}
                onPress={() => setPaymentMethod(paymentMethod === pm.id ? '' : pm.id)}
              >
                <Text style={styles.paymentIcon}>{pm.icon}</Text>
                <Text style={[
                  styles.paymentLabel,
                  paymentMethod === pm.id && styles.paymentLabelActive,
                ]}>
                  {pm.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <PocksyInput
            label="Notes (Optional)"
            placeholder="Any additional details..."
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Submit */}
        <View style={styles.submitContainer}>
          <PocksyButton
            title={`Add ${type === 'income' ? 'Income' : 'Expense'}`}
            onPress={handleSubmit}
            loading={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    paddingTop: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  typeButtonExpense: {
    backgroundColor: colors.danger + '15',
  },
  typeButtonIncome: {
    backgroundColor: colors.success + '15',
  },
  typeButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: colors.textSecondary,
  },
  typeButtonTextActive: {
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorText: {
    color: colors.danger,
    fontWeight: FontWeight.regular,
    textTransform: 'none',
    letterSpacing: 0,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    marginRight: Spacing.sm,
    marginBottom: Spacing.base,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 6,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: FontSize.sm,
    color: colors.textSecondary,
  },
  paymentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  paymentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 4,
  },
  paymentChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  paymentIcon: {
    fontSize: 14,
  },
  paymentLabel: {
    fontSize: FontSize.sm,
    color: colors.textSecondary,
  },
  paymentLabelActive: {
    color: colors.primary,
    fontWeight: FontWeight.semibold,
  },
  submitContainer: {
    marginTop: Spacing.lg,
  },
});
