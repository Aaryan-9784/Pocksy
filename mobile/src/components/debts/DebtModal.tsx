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
import { formatAmount } from '@/constants/currency';
import { debtService } from '@/services/debtService';
import type { Debt, DebtType } from '@/types';

const colors = Colors.light;

interface DebtModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DebtModal({ visible, onClose }: DebtModalProps) {
  const [loading, setLoading] = useState(false);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [totalLent, setTotalLent] = useState(0);
  const [totalBorrowed, setTotalBorrowed] = useState(0);
  const [netBalance, setNetBalance] = useState(0);

  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [type, setType] = useState<DebtType>('lent');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const res = await debtService.getDebts();
      setDebts(res.debts || []);
      setTotalLent(res.totalLent || 0);
      setTotalBorrowed(res.totalBorrowed || 0);
      setNetBalance(res.netBalance || 0);
    } catch (err: any) {
      console.error('Failed to load debts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchDebts();
      setShowAddForm(false);
    }
  }, [visible]);

  const handleCreate = async () => {
    if (!personName.trim() || !amount || parseFloat(amount) <= 0) {
      Alert.alert('Required', 'Please enter a person name and amount.');
      return;
    }

    try {
      setSubmitting(true);
      await debtService.create({
        type,
        personName: personName.trim(),
        amount: parseFloat(amount),
        notes: notes.trim() || undefined,
      });

      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }

      setPersonName('');
      setAmount('');
      setNotes('');
      setShowAddForm(false);
      await fetchDebts();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create debt entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSettle = async (item: Debt) => {
    try {
      if (Platform.OS !== 'web') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {}
      }

      await debtService.settle(item._id);
      Alert.alert('Settled ✨', `Marked ${item.personName}'s balance as settled!`);
      await fetchDebts();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to settle');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Record', 'Are you sure you want to delete this debt record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await debtService.delete(id);
            await fetchDebts();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete record');
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
              <Text style={styles.title}>Debt & Lending Tracker</Text>
              <Text style={styles.subtitle}>
                Receivable: {formatAmount(totalLent)} • Payable: {formatAmount(totalBorrowed)}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Toggle Add Form Button */}
          <TouchableOpacity
            style={[styles.addToggleBtn, showAddForm && styles.addToggleBtnActive]}
            onPress={() => setShowAddForm(!showAddForm)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={showAddForm ? 'list-outline' : 'people-outline'}
              size={18}
              color={showAddForm ? colors.primary : '#ffffff'}
            />
            <Text
              style={[
                styles.addToggleBtnText,
                showAddForm && styles.addToggleBtnTextActive,
              ]}
            >
              {showAddForm ? 'View Records' : '+ Add Lent / Borrowed Money'}
            </Text>
          </TouchableOpacity>

          {showAddForm ? (
            /* Add Form */
            <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>
              <Text style={styles.fieldLabel}>TRANSACTION TYPE</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[styles.typeChip, type === 'lent' && styles.typeChipLentActive]}
                  onPress={() => setType('lent')}
                >
                  <Ionicons
                    name="arrow-up-circle-outline"
                    size={16}
                    color={type === 'lent' ? '#ffffff' : colors.income}
                  />
                  <Text
                    style={[
                      styles.typeChipText,
                      type === 'lent' && styles.typeChipTextActive,
                    ]}
                  >
                    I Lent (They owe me)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.typeChip, type === 'borrowed' && styles.typeChipBorrowedActive]}
                  onPress={() => setType('borrowed')}
                >
                  <Ionicons
                    name="arrow-down-circle-outline"
                    size={16}
                    color={type === 'borrowed' ? '#ffffff' : colors.expense}
                  />
                  <Text
                    style={[
                      styles.typeChipText,
                      type === 'borrowed' && styles.typeChipTextActive,
                    ]}
                  >
                    I Borrowed (I owe them)
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>PERSON NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Rahul Sharma, Priya"
                placeholderTextColor={colors.textMuted}
                value={personName}
                onChangeText={setPersonName}
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

              <Text style={styles.fieldLabel}>NOTES (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Dinner bill split, Uber ride refund"
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
              />

              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                onPress={handleCreate}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Save Record</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          ) : (
            /* Debts List */
            <ScrollView showsVerticalScrollIndicator={false} style={styles.listScroll}>
              {loading ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: Spacing.xl }} />
              ) : debts.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Ionicons name="people-outline" size={40} color={colors.textMuted} />
                  <Text style={styles.emptyTitle}>No pending debts or loans</Text>
                  <Text style={styles.emptySub}>
                    Easily track money lent to friends or borrowed from colleagues.
                  </Text>
                </View>
              ) : (
                debts.map((item) => {
                  const isLent = item.type === 'lent';
                  return (
                    <View key={item._id} style={[styles.itemCard, item.settled && { opacity: 0.6 }]}>
                      <View
                        style={[
                          styles.iconWrapper,
                          {
                            backgroundColor: item.settled
                              ? colors.borderLight
                              : isLent
                              ? colors.incomeLight
                              : colors.expenseLight,
                          },
                        ]}
                      >
                        <Ionicons
                          name={isLent ? 'arrow-up' : 'arrow-down'}
                          size={18}
                          color={
                            item.settled
                              ? colors.textMuted
                              : isLent
                              ? colors.income
                              : colors.expense
                          }
                        />
                      </View>

                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.personName}</Text>
                        <Text style={styles.itemType}>
                          {item.settled
                            ? 'Settled'
                            : isLent
                            ? 'Owes you'
                            : 'You owe'}
                          {item.notes ? ` • ${item.notes}` : ''}
                        </Text>
                      </View>

                      <View style={styles.itemRight}>
                        <Text
                          style={[
                            styles.itemAmount,
                            {
                              color: item.settled
                                ? colors.textMuted
                                : isLent
                                ? colors.income
                                : colors.expense,
                            },
                          ]}
                        >
                          {formatAmount(item.remainingAmount || item.amount)}
                        </Text>

                        <View style={styles.itemActions}>
                          {!item.settled && (
                            <TouchableOpacity
                              style={styles.settleBtn}
                              onPress={() => handleSettle(item)}
                            >
                              <Ionicons name="checkmark" size={12} color="#ffffff" />
                              <Text style={styles.settleBtnText}>Settle</Text>
                            </TouchableOpacity>
                          )}
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
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  addToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  addToggleBtnActive: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addToggleBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#ffffff',
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
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: colors.cardMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  typeChipLentActive: {
    backgroundColor: colors.income,
    borderColor: colors.income,
  },
  typeChipBorrowedActive: {
    backgroundColor: colors.expense,
    borderColor: colors.expense,
  },
  typeChipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: colors.textSecondary,
  },
  typeChipTextActive: {
    color: '#ffffff',
    fontWeight: FontWeight.bold,
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
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
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
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  itemName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  itemType: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemAmount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  settleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  settleBtnText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#ffffff',
  },
  deleteBtn: {
    padding: 2,
  },
});
