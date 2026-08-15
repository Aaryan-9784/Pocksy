import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { formatAmount } from '@/constants/currency';
import { CategoryIcon } from '@/components/ui';
import { recurringService } from '@/services/recurringService';
import { useDashboardStore } from '@/store/dashboardStore';
import { useTransactionStore } from '@/store/transactionStore';
import type { RecurringTransaction, RecurrenceFrequency } from '@/types';

const colors = Colors.light;

interface RecurringModalProps {
  visible: boolean;
  onClose: () => void;
}

const FREQUENCIES: { id: RecurrenceFrequency; label: string }[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'daily', label: 'Daily' },
];

export function RecurringModal({ visible, onClose }: RecurringModalProps) {
  const refreshDashboard = useDashboardStore((s) => s.refresh);
  const refreshTransactions = useTransactionStore((s) => s.refresh);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('subscriptions');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await recurringService.getRecurring();
      setItems(res.recurring || []);
      setMonthlyTotal(res.monthlyRecurringExpense || 0);
    } catch (err: any) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchItems();
      setShowAddForm(false);
    }
  }, [visible]);

  const handleCreate = async () => {
    if (!desc.trim() || !amount || parseFloat(amount) <= 0) {
      Alert.alert('Required', 'Please fill in description and a valid amount.');
      return;
    }

    try {
      setSubmitting(true);
      await recurringService.create({
        type: 'expense',
        description: desc.trim(),
        amount: parseFloat(amount),
        category,
        frequency,
        startDate: new Date().toISOString(),
      });

      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }

      setDesc('');
      setAmount('');
      setShowAddForm(false);
      await fetchItems();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExecute = async (item: RecurringTransaction) => {
    try {
      if (Platform.OS !== 'web') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {}
      }

      await recurringService.execute(item._id);
      refreshDashboard();
      refreshTransactions();
      Alert.alert('Logged ✨', `Paid ${formatAmount(item.amount)} for ${item.description}`);
      await fetchItems();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to log subscription');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Subscription', 'Are you sure you want to remove this recurring item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await recurringService.delete(id);
            await fetchItems();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Top Handle Pill */}
          <View style={styles.handlePill} />

          {/* Unified Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.title}>Subscriptions & Recurring Bills</Text>
              <Text style={styles.subtitle}>
                Estimated monthly commitment: {formatAmount(monthlyTotal)}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Toggle Add Form Button */}
          <TouchableOpacity
            style={[styles.addToggleBtn, showAddForm && styles.addToggleBtnActive]}
            onPress={() => {
              if ((Platform.OS as string) !== 'web') {
                try {
                  Haptics.selectionAsync();
                } catch {}
              }
              setShowAddForm(!showAddForm);
            }}
            activeOpacity={0.85}
          >
            <Ionicons
              name={showAddForm ? 'list-outline' : 'add-outline'}
              size={18}
              color={showAddForm ? colors.primary : '#ffffff'}
            />
            <Text
              style={[
                styles.addToggleBtnText,
                showAddForm && styles.addToggleBtnTextActive,
              ]}
            >
              {showAddForm ? 'View Subscriptions List' : 'Add New Subscription / Bill'}
            </Text>
          </TouchableOpacity>

          {showAddForm ? (
            /* Add Form */
            <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>
              <Text style={styles.fieldLabel}>SUBSCRIPTION / BILL NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Netflix Premium, Spotify, House Rent"
                placeholderTextColor={colors.textMuted}
                value={desc}
                onChangeText={setDesc}
              />

              <Text style={styles.fieldLabel}>AMOUNT</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />

              <Text style={styles.fieldLabel}>BILLING FREQUENCY</Text>
              <View style={styles.freqRow}>
                {FREQUENCIES.map((f) => {
                  const isSelected = frequency === f.id;
                  return (
                    <TouchableOpacity
                      key={f.id}
                      style={[styles.freqChip, isSelected && styles.freqChipActive]}
                      onPress={() => setFrequency(f.id)}
                    >
                      <Text
                        style={[
                          styles.freqChipText,
                          isSelected && styles.freqChipTextActive,
                        ]}
                      >
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>CATEGORY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {EXPENSE_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.catChip, isSelected && styles.catChipActive]}
                      onPress={() => setCategory(cat.id)}
                    >
                      <Text
                        style={[
                          styles.catChipText,
                          isSelected && styles.catChipTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                onPress={handleCreate}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Save Subscription</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          ) : (
            /* Items List */
            <ScrollView showsVerticalScrollIndicator={false} style={styles.listScroll}>
              {loading ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: Spacing.xl }} />
              ) : items.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons name="repeat" size={28} color={colors.primary} />
                  </View>
                  <Text style={styles.emptyTitle}>No active subscriptions</Text>
                  <Text style={styles.emptySub}>
                    Track Netflix, Spotify, Rent, or SIPs to forecast upcoming debits.
                  </Text>
                </View>
              ) : (
                items.map((item) => {
                  const nextDate = new Date(item.nextExecutionDate);
                  const daysLeft = Math.ceil(
                    (nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  const dueLabel =
                    daysLeft <= 0
                      ? 'Due Today'
                      : daysLeft === 1
                      ? 'Due Tomorrow'
                      : `Due in ${daysLeft} days`;

                  return (
                    <View key={item._id} style={styles.itemCard}>
                      <CategoryIcon categoryId={item.category} size={42} />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemDesc}>{item.description}</Text>
                        <View style={styles.itemMeta}>
                          <Text style={styles.itemFreq}>
                            {item.frequency.toUpperCase()}
                          </Text>
                          <Text style={styles.itemDot}>•</Text>
                          <Text
                            style={[
                              styles.itemDue,
                              daysLeft <= 2 && { color: colors.expense, fontWeight: FontWeight.bold },
                            ]}
                          >
                            {dueLabel}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.itemRight}>
                        <Text style={styles.itemAmount}>{formatAmount(item.amount)}</Text>
                        <View style={styles.itemActions}>
                          <TouchableOpacity
                            style={styles.payBtn}
                            onPress={() => handleExecute(item)}
                          >
                            <Ionicons name="checkmark" size={14} color="#ffffff" />
                            <Text style={styles.payBtnText}>Pay</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => handleDelete(item._id)}
                          >
                            <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? Spacing['2xl'] : Spacing.xl,
    maxHeight: '85%',
  },
  handlePill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  addToggleBtnActive: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  addToggleBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#ffffff',
    letterSpacing: -0.1,
  },
  addToggleBtnTextActive: {
    color: colors.primary,
  },
  formScroll: {
    maxHeight: 400,
  },
  listScroll: {
    maxHeight: 450,
  },
  fieldLabel: {
    fontSize: FontSize['2xs'],
    fontWeight: FontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.sm,
    color: colors.textPrimary,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        outlineWidth: 0,
      } as any,
    }),
  },
  freqRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  freqChip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: colors.cardMuted,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  freqChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  freqChipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: colors.textSecondary,
  },
  freqChipTextActive: {
    color: '#ffffff',
    fontWeight: FontWeight.bold,
  },
  catScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  catChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.cardMuted,
    marginRight: Spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  catChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catChipText: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
  },
  catChipTextActive: {
    color: '#ffffff',
    fontWeight: FontWeight.bold,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  submitBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#ffffff',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(107, 30, 43, 0.10)',
  },
  emptyTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptySub: {
    fontSize: FontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: 4,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  itemInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  itemDesc: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  itemFreq: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: colors.primary,
  },
  itemDot: {
    fontSize: 10,
    color: colors.textMuted,
    marginHorizontal: 4,
  },
  itemDue: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemAmount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  payBtnText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#ffffff',
  },
  deleteBtn: {
    padding: 4,
  },
});
