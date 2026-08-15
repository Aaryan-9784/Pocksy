import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { PocksyButton, PocksyInput, CategoryIcon, AppHeader, PageTitle } from '@/components/ui';
import { EXPENSE_CATEGORIES, INCOME_SOURCES, PAYMENT_METHODS } from '@/constants/categories';
import { useTransactionStore } from '@/store/transactionStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useAccountStore } from '@/store/accountStore';
import { useAuthStore } from '@/store/authStore';
import { CURRENCIES, formatAmount } from '@/constants/currency';
import type { TransactionType } from '@/types';

const colors = Colors.light;

const PRESET_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function AddScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const refreshTransactions = useTransactionStore((s) => s.refresh);
  const refreshDashboard = useDashboardStore((s) => s.refresh);
  const { accounts, fetchAccounts } = useAccountStore();
  const user = useAuthStore((s) => s.user);

  const currencySymbol = CURRENCIES[user?.currency || 'INR']?.symbol || '₹';

  const [type, setType] = useState<TransactionType>(
    params.type === 'income' ? 'income' : 'expense'
  );

  useEffect(() => {
    if (params.type === 'income' || params.type === 'expense') {
      setType(params.type);
    }
    fetchAccounts();
  }, [params.type]);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0]._id);
    }
  }, [accounts]);

  const handlePickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        try {
          Haptics.selectionAsync();
        } catch {}
      }
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access gallery is required to attach receipts.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setReceiptImage(result.assets[0].uri);
      }
    } catch (err: any) {
      Alert.alert('Image Picker Error', err.message || 'Could not pick image');
    }
  };


  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_SOURCES;

  const handleTypeToggle = (newType: TransactionType) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
    setType(newType);
    setCategory('');
    setErrors((prev) => ({ ...prev, category: '' }));
  };

  const handlePresetSelect = (val: number) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
    setErrors((prev) => ({ ...prev, amount: '' }));
  };

  const handleCategorySelect = (catId: string) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    setCategory(catId);
    setErrors((prev) => ({ ...prev, category: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!category) {
      newErrors.category = 'Please choose a category';
    }
    if (!description.trim()) {
      newErrors.description = 'Please enter a short description';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch {}
      }
      return;
    }    setLoading(true);
    try {
      await addTransaction({
        type,
        amount: parseFloat(amount),
        category,
        description: description.trim(),
        paymentMethod: paymentMethod || undefined,
        accountId: selectedAccountId || undefined,
        date: new Date().toISOString(),
        notes: notes.trim() || undefined,
        receiptUrl: receiptImage || undefined,
      });

      // Refresh transactions, dashboard, and accounts
      refreshTransactions();
      refreshDashboard();
      useAccountStore.getState().fetchAccounts();

      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }

      Alert.alert(
        'Transaction Added ✨',
        `${type === 'income' ? 'Income' : 'Expense'} of ${currencySymbol}${amount} logged successfully.`,
        [
          {
            text: 'Done',
            onPress: () => router.push('/(tabs)'),
          },
          {
            text: 'Add Another',
            onPress: () => {
              setAmount('');
              setCategory('');
              setDescription('');
              setNotes('');
              setReceiptImage(null);
              setErrors({});
            },
          },
        ]
      );

    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Fixed Top Brand & Profile Header */}
      <AppHeader showProfile={true} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing['5xl'] }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Page Title Block */}
          <PageTitle
            title="New Transaction"
            subtitle="Log your income or expense quickly"
          />

        {/* Type Switcher */}
        <View style={styles.typeSwitcher}>
          <TouchableOpacity
            style={[
              styles.typeTab,
              type === 'expense' && styles.typeTabExpenseActive,
            ]}
            onPress={() => handleTypeToggle('expense')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-up-circle"
              size={18}
              color={type === 'expense' ? '#FFFFFF' : colors.expense}
            />
            <Text
              style={[
                styles.typeTabText,
                type === 'expense' && styles.typeTabTextActive,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeTab,
              type === 'income' && styles.typeTabIncomeActive,
            ]}
            onPress={() => handleTypeToggle('income')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-down-circle"
              size={18}
              color={type === 'income' ? '#FFFFFF' : colors.income}
            />
            <Text
              style={[
                styles.typeTabText,
                type === 'income' && styles.typeTabTextActive,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input Block */}
        <View style={styles.amountCard}>
          <Text style={styles.amountCardLabel}>ENTER AMOUNT</Text>
          <View style={styles.amountInputRow}>
            <Text style={styles.currencySymbol}>{currencySymbol}</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9.]/g, '');
                setAmount(numeric);
                setErrors((prev) => ({ ...prev, amount: '' }));
              }}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>
          {errors.amount ? (
            <Text style={styles.amountErrorText}>{errors.amount}</Text>
          ) : null}

          {/* Quick Presets */}
          <View style={styles.presetChipsRow}>
            {PRESET_AMOUNTS.map((val) => (
              <TouchableOpacity
                key={val}
                style={styles.presetChip}
                onPress={() => handlePresetSelect(val)}
                activeOpacity={0.7}
              >
                <Text style={styles.presetChipText}>+{val}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account / Wallet Selector */}
        {accounts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {type === 'expense' ? 'PAY FROM ACCOUNT / WALLET' : 'DEPOSIT TO ACCOUNT'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountSelectorRow}>
              {accounts.map((acc) => {
                const isSelected = selectedAccountId === acc._id;
                return (
                  <TouchableOpacity
                    key={acc._id}
                    style={[
                      styles.accountChip,
                      isSelected && styles.accountChipSelected,
                      { borderLeftColor: acc.color || colors.primary },
                    ]}
                    onPress={() => setSelectedAccountId(acc._id)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.accountChipName, isSelected && styles.accountChipTextActive]}>
                      {acc.name}
                    </Text>
                    <Text style={[styles.accountChipBal, isSelected && styles.accountChipTextActive]}>
                      {formatAmount(acc.balance)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Category Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>CATEGORY</Text>
            {errors.category ? (
              <Text style={styles.sectionError}>{errors.category}</Text>
            ) : null}
          </View>

          <View style={styles.categoryGrid}>
            {categories.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    isSelected && { borderColor: cat.color, backgroundColor: colors.white },
                    isSelected && styles.categoryCardSelected,
                  ]}
                  onPress={() => handleCategorySelect(cat.id)}
                  activeOpacity={0.75}
                >
                  <CategoryIcon categoryId={cat.id} size={42} />
                  <Text
                    style={[
                      styles.categoryName,
                      isSelected && { color: cat.color, fontWeight: FontWeight.bold },
                    ]}
                    numberOfLines={1}
                  >
                    {cat.label}
                  </Text>
                  {isSelected && (
                    <View style={[styles.selectedCheck, { backgroundColor: cat.color }]}>
                      <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <PocksyInput
            label="DESCRIPTION"
            placeholder={type === 'expense' ? 'e.g. Grocery store, Uber ride' : 'e.g. Monthly salary, Freelance project'}
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              setErrors((prev) => ({ ...prev, description: '' }));
            }}
            error={errors.description}
            leftIcon={<Ionicons name="create-outline" size={18} color={colors.textSecondary} />}
          />
        </View>

        {/* Payment Method Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
          <View style={styles.paymentMethodRow}>
            {PAYMENT_METHODS.map((pm) => {
              const isSelected = paymentMethod === pm.id;
              return (
                <TouchableOpacity
                  key={pm.id}
                  style={[
                    styles.paymentChip,
                    isSelected && styles.paymentChipActive,
                  ]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      try {
                        Haptics.selectionAsync();
                      } catch {}
                    }
                    setPaymentMethod(pm.id);
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={pm.vectorIcon as any}
                    size={16}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.paymentChipLabel,
                      isSelected && styles.paymentChipLabelActive,
                    ]}
                  >
                    {pm.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <PocksyInput
            label="NOTES (OPTIONAL)"
            placeholder="Add any extra notes or tags..."
            value={notes}
            onChangeText={setNotes}
            leftIcon={<Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />}
          />
        </View>

        {/* Receipt Attachment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECEIPT / BILL ATTACHMENT (OPTIONAL)</Text>
          {receiptImage ? (
            <View style={styles.receiptPreviewBox}>
              <Image source={{ uri: receiptImage }} style={styles.receiptImage} />
              <TouchableOpacity
                style={styles.removeReceiptBtn}
                onPress={() => setReceiptImage(null)}
              >
                <Ionicons name="trash-outline" size={14} color="#ffffff" />
                <Text style={styles.removeReceiptText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.attachReceiptBtn}
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-outline" size={20} color={colors.primary} />
              <Text style={styles.attachReceiptText}>Upload / Scan Receipt Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <View style={styles.submitWrapper}>
          <PocksyButton
            title={`Add ${type === 'income' ? 'Income' : 'Expense'}`}
            onPress={handleSubmit}
            loading={loading}
            icon={<Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerActionButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  typeTabExpenseActive: {
    backgroundColor: colors.expense,
  },
  typeTabIncomeActive: {
    backgroundColor: colors.income,
  },
  typeTabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: colors.textSecondary,
  },
  typeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  amountCard: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  amountCardLabel: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xs,
  },
  currencySymbol: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: colors.primary,
    marginRight: 6,
  },
  amountInput: {
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    minWidth: 120,
    textAlign: 'center',
    letterSpacing: -1,
    padding: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        outlineWidth: 0,
      } as any,
    }),
  },
  amountErrorText: {
    color: colors.danger,
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
    fontWeight: FontWeight.medium,
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  presetChip: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  presetChipText: {
    fontSize: FontSize.xs,
    color: colors.primary,
    fontWeight: FontWeight.semibold,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
  },
  sectionError: {
    fontSize: FontSize.xs,
    color: colors.danger,
    fontWeight: FontWeight.medium,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryCard: {
    width: '30.5%',
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    position: 'relative',
    ...Shadows.sm,
  },
  categoryCardSelected: {
    ...Shadows.md,
  },
  categoryName: {
    fontSize: FontSize.xs,
    color: colors.textPrimary,
    fontWeight: FontWeight.medium,
    marginTop: 6,
    textAlign: 'center',
  },
  selectedCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing['2xs'],
  },
  paymentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  paymentChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  paymentChipLabel: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  paymentChipLabelActive: {
    color: colors.primary,
    fontWeight: FontWeight.bold,
  },
  accountSelectorRow: {
    flexDirection: 'row',
    marginTop: Spacing['2xs'],
    marginBottom: Spacing.xs,
  },
  accountChip: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderLeftWidth: 4,
    marginRight: Spacing.sm,
    minWidth: 110,
    ...Shadows.sm,
  },
  accountChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  accountChipName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  accountChipBal: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    marginTop: 2,
  },
  accountChipTextActive: {
    color: colors.primary,
  },
  attachReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing['2xs'],
  },
  attachReceiptText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: colors.primary,
  },
  receiptPreviewBox: {
    position: 'relative',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing['2xs'],
    height: 160,
    backgroundColor: colors.cardMuted,
  },
  receiptImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeReceiptBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  removeReceiptText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#ffffff',
  },
  submitWrapper: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});

