/**
 * Pocksy New Transaction Screen
 * Luxury Financial Logging Experience aligned with Pocksy Signature Theme
 */

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
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

const PRESET_AMOUNTS = [100, 500, 1000, 2000, 5000];

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
    }

    setLoading(true);
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
        'Transaction Saved ✨',
        `${type === 'income' ? 'Income' : 'Expense'} of ${currencySymbol}${amount} logged successfully.`,
        [
          {
            text: 'View Dashboard',
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

  const isExpense = type === 'expense';

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
            subtitle={isExpense ? 'Record money spent or bills paid' : 'Record income, freelance, or gifts'}
            noPaddingHorizontal={true}
          />

          {/* Luxury Capsule Type Switcher */}
          <View style={styles.typeSwitcherCard}>
            <TouchableOpacity
              style={[styles.typeTab, isExpense && styles.typeTabExpenseActive]}
              onPress={() => handleTypeToggle('expense')}
              activeOpacity={0.8}
            >
              {isExpense ? (
                <LinearGradient
                  colors={['#7E1D2E', '#52131E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.typeTabGradient}
                >
                  <View style={styles.iconCircleWhite}>
                    <Feather name="arrow-up-right" size={13} color="#EF4444" />
                  </View>
                  <Text style={styles.typeTabTextActive}>Expense</Text>
                </LinearGradient>
              ) : (
                <View style={styles.typeTabInner}>
                  <View style={styles.iconCircleMuted}>
                    <Feather name="arrow-up-right" size={13} color={colors.textSecondary} />
                  </View>
                  <Text style={styles.typeTabText}>Expense</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeTab, !isExpense && styles.typeTabIncomeActive]}
              onPress={() => handleTypeToggle('income')}
              activeOpacity={0.8}
            >
              {!isExpense ? (
                <LinearGradient
                  colors={['#059669', '#047857']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.typeTabGradient}
                >
                  <View style={styles.iconCircleWhite}>
                    <Feather name="arrow-down-left" size={13} color="#10B981" />
                  </View>
                  <Text style={styles.typeTabTextActive}>Income</Text>
                </LinearGradient>
              ) : (
                <View style={styles.typeTabInner}>
                  <View style={styles.iconCircleMuted}>
                    <Feather name="arrow-down-left" size={13} color={colors.textSecondary} />
                  </View>
                  <Text style={styles.typeTabText}>Income</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Signature Luxury Hero Amount Card */}
          <View style={styles.amountCardShadowWrapper}>
            <LinearGradient
              colors={
                isExpense
                  ? ['#721B2A', '#4A111C', '#280A10']
                  : ['#064E3B', '#063B2F', '#022119']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.amountCard}
            >
              {/* Background ambient lighting */}
              <View style={styles.glowCircle1} />
              <View style={styles.glowCircle2} />

              {/* Header Pill */}
              <View style={styles.amountHeaderPill}>
                <LinearGradient
                  colors={isExpense ? ['#EF4444', '#B91C1C'] : ['#10B981', '#047857']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.pillIconCircle}
                >
                  <Feather
                    name={isExpense ? 'arrow-up-right' : 'arrow-down-left'}
                    size={11}
                    color="#FFFFFF"
                  />
                </LinearGradient>
                <Text style={styles.amountPillText}>
                  {isExpense ? 'ENTER EXPENSE AMOUNT' : 'ENTER INCOME AMOUNT'}
                </Text>
              </View>

              {/* Large Amount Input */}
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
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  keyboardType="decimal-pad"
                  selectionColor="#FFFFFF"
                  autoFocus
                />
              </View>

              {errors.amount ? (
                <View style={styles.amountErrorBanner}>
                  <Ionicons name="alert-circle" size={14} color="#FECACA" />
                  <Text style={styles.amountErrorText}>{errors.amount}</Text>
                </View>
              ) : null}

              {/* Quick Glassmorphic Preset Chips */}
              <View style={styles.presetChipsRow}>
                {PRESET_AMOUNTS.map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={styles.presetChip}
                    onPress={() => handlePresetSelect(val)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.presetChipText}>+{val.toLocaleString()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* Group 1: CATEGORY SELECTION */}
          <Text style={styles.groupLabel}>SELECT CATEGORY</Text>
          <View style={styles.sectionCard}>
            {errors.category ? (
              <View style={styles.categoryErrorBanner}>
                <Ionicons name="alert-circle" size={14} color={colors.danger} />
                <Text style={styles.categoryErrorText}>{errors.category}</Text>
              </View>
            ) : null}

            <View style={styles.categoryGrid}>
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryTile,
                      isSelected && {
                        borderColor: cat.color,
                        backgroundColor: `${cat.color}10`,
                        borderWidth: 1.5,
                      },
                    ]}
                    onPress={() => handleCategorySelect(cat.id)}
                    activeOpacity={0.75}
                  >
                    <CategoryIcon categoryId={cat.id} size={42} />
                    <Text
                      style={[
                        styles.categoryTileLabel,
                        isSelected && { color: cat.color, fontWeight: FontWeight.bold },
                      ]}
                      numberOfLines={1}
                    >
                      {cat.label}
                    </Text>
                    {isSelected && (
                      <View style={[styles.selectedCheckBadge, { backgroundColor: cat.color }]}>
                        <Ionicons name="checkmark" size={9} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Group 2: ACCOUNT & PAYMENT SOURCE */}
          <Text style={styles.groupLabel}>ACCOUNT & PAYMENT</Text>
          <View style={styles.sectionCard}>
            {accounts.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subLabel}>
                  {isExpense ? 'PAY FROM ACCOUNT' : 'DEPOSIT TO ACCOUNT'}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.accountSelectorRow}
                >
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
                        <Text
                          style={[
                            styles.accountChipName,
                            isSelected && styles.accountChipTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {acc.name}
                        </Text>
                        <Text
                          style={[
                            styles.accountChipBal,
                            isSelected && styles.accountChipTextActive,
                          ]}
                        >
                          {formatAmount(acc.balance)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <View style={styles.subSection}>
              <Text style={styles.subLabel}>PAYMENT METHOD</Text>
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
                        size={15}
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
          </View>

          {/* Group 3: TRANSACTION DETAILS */}
          <Text style={styles.groupLabel}>TRANSACTION DETAILS</Text>
          <View style={styles.sectionCard}>
            <PocksyInput
              label="DESCRIPTION"
              placeholder={isExpense ? 'e.g. Grocery store, Starbucks, Uber' : 'e.g. Monthly salary, Freelance design'}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                setErrors((prev) => ({ ...prev, description: '' }));
              }}
              error={errors.description}
              leftIcon={<Ionicons name="create-outline" size={18} color={colors.textSecondary} />}
            />

            <PocksyInput
              label="NOTES (OPTIONAL)"
              placeholder="Add tags, references, or reminders..."
              value={notes}
              onChangeText={setNotes}
              leftIcon={<Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>

          {/* Group 4: RECEIPT ATTACHMENT */}
          <Text style={styles.groupLabel}>RECEIPT ATTACHMENT (OPTIONAL)</Text>
          <View style={styles.sectionCard}>
            {receiptImage ? (
              <View style={styles.receiptPreviewBox}>
                <Image source={{ uri: receiptImage }} style={styles.receiptImage} />
                <TouchableOpacity
                  style={styles.removeReceiptBtn}
                  onPress={() => setReceiptImage(null)}
                >
                  <Ionicons name="trash-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.removeReceiptText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.attachReceiptBtn}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                <View style={styles.attachIconCircle}>
                  <Ionicons name="camera-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.attachTextGroup}>
                  <Text style={styles.attachReceiptText}>Upload Receipt Photo</Text>
                  <Text style={styles.attachReceiptSub}>Attach bill or invoice screenshot</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Button */}
          <View style={styles.submitWrapper}>
            <PocksyButton
              title={`Save ${isExpense ? 'Expense' : 'Income'}`}
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
  groupLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: Spacing.xs,
    ...Shadows.sm,
  },
  typeSwitcherCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: BorderRadius.xl,
    padding: 4,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  typeTab: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  typeTabExpenseActive: {
    ...Shadows.sm,
  },
  typeTabIncomeActive: {
    ...Shadows.sm,
  },
  typeTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
  },
  typeTabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  iconCircleWhite: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  iconCircleMuted: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: colors.textSecondary,
  },
  typeTabTextActive: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  amountCardShadowWrapper: {
    borderRadius: BorderRadius['2xl'],
    marginBottom: Spacing.md,
    ...Shadows.lg,
  },
  amountCard: {
    borderRadius: BorderRadius['2xl'],
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  glowCircle1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(232, 137, 154, 0.16)',
  },
  glowCircle2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  amountHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    marginBottom: Spacing.sm,
  },
  pillIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  amountPillText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.8,
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
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: 6,
  },
  amountInput: {
    fontSize: FontSize['5xl'] || 44,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    minWidth: 140,
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
  amountErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  amountErrorText: {
    color: '#FECACA',
    fontSize: FontSize.xs,
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  presetChipText: {
    fontSize: FontSize.xs,
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  categoryErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.dangerLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  categoryErrorText: {
    fontSize: FontSize.xs,
    color: colors.danger,
    fontWeight: FontWeight.medium,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  categoryTile: {
    width: '31%',
    backgroundColor: colors.offWhite,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative',
    marginBottom: 4,
  },
  categoryTileLabel: {
    fontSize: FontSize.xs,
    color: colors.textPrimary,
    fontWeight: FontWeight.semibold,
    marginTop: 6,
    textAlign: 'center',
  },
  selectedCheckBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 15,
    height: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subSection: {
    marginBottom: Spacing.md,
  },
  subLabel: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
  },
  accountSelectorRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  accountChip: {
    backgroundColor: colors.offWhite,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: 3.5,
    minWidth: 110,
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
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  accountChipTextActive: {
    color: colors.primary,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  paymentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: colors.offWhite,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
  attachReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.offWhite,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  attachIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachTextGroup: {
    flex: 1,
  },
  attachReceiptText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  attachReceiptSub: {
    fontSize: FontSize.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  receiptPreviewBox: {
    position: 'relative',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    height: 150,
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
    color: '#FFFFFF',
  },
  submitWrapper: {
    marginTop: Spacing.base,
    marginBottom: Spacing.xl,
  },
});
