/**
 * Pocksy Transaction Detail & Edit Modal
 * Full view, edit, and deletion capabilities with haptic feedback
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { CategoryIcon } from './CategoryIcon';
import { PocksyButton } from './Button';
import { getCategoryById, EXPENSE_CATEGORIES, INCOME_SOURCES, PAYMENT_METHODS } from '@/constants/categories';
import { formatAmount } from '@/constants/currency';
import { transactionService } from '@/services/transactionService';
import type { Transaction } from '@/types';

const colors = Colors.light;

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onUpdated?: (updated: Transaction) => void;
  onDeleted?: (id: string) => void;
}

export function TransactionDetailModal({
  visible,
  transaction,
  onClose,
  onUpdated,
  onDeleted,
}: TransactionDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setDescription(transaction.description || '');
      setCategory(transaction.category || '');
      setPaymentMethod(transaction.paymentMethod || 'UPI');
      setNotes(transaction.notes || '');
      setIsEditing(false);
    }
  }, [transaction, visible]);

  if (!transaction) return null;

  const catMeta = getCategoryById(transaction.category);
  const isIncome = transaction.type === 'income';
  const availableCategories = isIncome ? INCOME_SOURCES : EXPENSE_CATEGORIES;

  const handleSaveEdit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Required Field', 'Please enter a description.');
      return;
    }

    setSaving(true);
    try {
      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }

      const updated = await transactionService.update(transaction._id, {
        amount: numAmount,
        description: description.trim(),
        category,
        paymentMethod,
        notes: notes.trim(),
      });

      onUpdated?.(updated);
      setIsEditing(false);
      onClose();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Failed to update transaction.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}
    }

    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${transaction.description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await transactionService.delete(transaction._id);
              onDeleted?.(transaction._id);
              onClose();
            } catch (err: any) {
              Alert.alert('Delete Failed', err.message || 'Could not delete transaction.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const dateFormatted = new Date(transaction.date).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Transaction' : 'Transaction Details'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {!isEditing ? (
              <>
                {/* Hero Amount Display */}
                <View style={styles.heroAmountBox}>
                  <CategoryIcon categoryId={transaction.category} size={64} />
                  <Text
                    style={[
                      styles.heroAmount,
                      { color: isIncome ? colors.income : colors.expense },
                    ]}
                  >
                    {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
                  </Text>
                  <Text style={styles.heroDesc}>{transaction.description}</Text>
                  <View style={[styles.typePill, { backgroundColor: isIncome ? colors.successLight : colors.dangerLight }]}>
                    <Ionicons
                      name={isIncome ? 'arrow-down' : 'arrow-up'}
                      size={12}
                      color={isIncome ? colors.income : colors.expense}
                    />
                    <Text style={[styles.typeText, { color: isIncome ? colors.income : colors.expense }]}>
                      {isIncome ? 'Income' : 'Expense'}
                    </Text>
                  </View>
                </View>

                {/* Details Grid */}
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Category</Text>
                    <Text style={styles.infoValue}>{catMeta?.label || transaction.category}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date</Text>
                    <Text style={styles.infoValue}>{dateFormatted}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Payment Method</Text>
                    <Text style={styles.infoValue}>{transaction.paymentMethod || 'UPI'}</Text>
                  </View>

                  {transaction.notes ? (
                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                      <Text style={styles.infoLabel}>Notes</Text>
                      <Text style={styles.infoValue}>{transaction.notes}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <PocksyButton
                    title="Edit Record"
                    onPress={() => setIsEditing(true)}
                    variant="outline"
                    icon={<Ionicons name="create-outline" size={16} color={colors.primary} />}
                  />
                  <PocksyButton
                    title="Delete"
                    onPress={handleDelete}
                    variant="ghost"
                    loading={deleting}
                    icon={<Ionicons name="trash-outline" size={16} color={colors.danger} />}
                  />
                </View>
              </>
            ) : (
              <>
                {/* Editing Form */}
                <Text style={styles.inputLabel}>AMOUNT (₹)</Text>
                <TextInput
                  style={styles.textInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.inputLabel}>DESCRIPTION</Text>
                <TextInput
                  style={styles.textInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What was this for?"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.inputLabel}>CATEGORY</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {availableCategories.map((c) => {
                    const isSelected = category === c.id;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[styles.catChip, isSelected && styles.catChipActive]}
                        onPress={() => setCategory(c.id)}
                      >
                        <CategoryIcon categoryId={c.id} size={28} />
                        <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                          {c.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text style={styles.inputLabel}>PAYMENT METHOD</Text>
                <View style={styles.methodsRow}>
                  {PAYMENT_METHODS.map((m) => {
                    const isSelected = paymentMethod === m.id;
                    return (
                      <TouchableOpacity
                        key={m.id}
                        style={[styles.methodChip, isSelected && styles.methodChipActive]}
                        onPress={() => setPaymentMethod(m.id)}
                      >
                        <Text style={[styles.methodChipText, isSelected && styles.methodChipTextActive]}>
                          {m.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.inputLabel}>NOTES (OPTIONAL)</Text>
                <TextInput
                  style={[styles.textInput, { height: 64, textAlignVertical: 'top' }]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add additional notes..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                />

                <View style={styles.actionRow}>
                  <PocksyButton
                    title="Save Changes"
                    onPress={handleSaveEdit}
                    loading={saving}
                    icon={<Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />}
                  />
                  <PocksyButton
                    title="Cancel"
                    onPress={() => setIsEditing(false)}
                    variant="ghost"
                  />
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    maxHeight: '88%',
    paddingBottom: Spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  heroAmountBox: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heroAmount: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    marginTop: Spacing.sm,
  },
  heroDesc: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  typeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  infoCard: {
    backgroundColor: colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: Spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  infoValue: {
    fontSize: FontSize.sm,
    color: colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  actionRow: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  inputLabel: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: Spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.base,
    color: colors.textPrimary,
    marginBottom: Spacing.sm,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        outlineWidth: 0,
      } as any,
    }),
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: Spacing.sm,
  },
  catChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  catChipText: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  catChipTextActive: {
    color: colors.primary,
    fontWeight: FontWeight.bold,
  },
  methodsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  methodChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  methodChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodChipText: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  methodChipTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
});
