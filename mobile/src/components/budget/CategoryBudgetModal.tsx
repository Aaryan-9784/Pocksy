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
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { CURRENCIES, formatAmount } from '@/constants/currency';
import { CategoryIcon } from '@/components/ui';
import { budgetService } from '@/services/budgetService';
import { useAuthStore } from '@/store/authStore';
import type { CategoryBudget } from '@/types';

const colors = Colors.light;

interface CategoryBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialCategoryBudgets?: CategoryBudget[];
  totalBudget?: number;
}

export function CategoryBudgetModal({
  visible,
  onClose,
  onSaved,
  initialCategoryBudgets = [],
  totalBudget = 0,
}: CategoryBudgetModalProps) {
  const user = useAuthStore((s) => s.user);
  const currencyCode = user?.currency || 'INR';
  const currencyConfig = CURRENCIES[currencyCode];
  const currencySymbol = currencyConfig?.symbol || '₹';

  const [loading, setLoading] = useState(false);
  const [budgetValues, setBudgetValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      const map: Record<string, string> = {};
      initialCategoryBudgets.forEach((cb) => {
        if (cb.amount > 0) {
          map[cb.category] = cb.amount.toString();
        }
      });
      setBudgetValues(map);
    }
  }, [visible, initialCategoryBudgets]);

  const handleAmountChange = (catId: string, text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setBudgetValues((prev) => ({
      ...prev,
      [catId]: numeric,
    }));
  };

  const handleQuickAdd = (catId: string, amount: number) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
    const current = parseInt(budgetValues[catId] || '0', 10) || 0;
    handleAmountChange(catId, (current + amount).toString());
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const categoryBudgets: CategoryBudget[] = Object.entries(budgetValues)
        .map(([category, amtStr]) => ({
          category,
          amount: parseInt(amtStr, 10) || 0,
        }))
        .filter((cb) => cb.amount > 0);

      await budgetService.set({
        month,
        year,
        categoryBudgets,
      });

      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }

      Alert.alert('Success', 'Category budgets saved successfully!');
      onSaved();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save category budgets');
    } finally {
      setLoading(false);
    }
  };

  const totalAllocated = Object.values(budgetValues).reduce(
    (sum, val) => sum + (parseInt(val, 10) || 0),
    0
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Category Budgets</Text>
              <Text style={styles.subtitle}>
                Set spending limits for each category
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Allocation Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Allocated</Text>
              <Text style={styles.summaryValue}>
                {formatAmount(totalAllocated, currencyConfig)}
              </Text>
            </View>
            {totalBudget > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(100, Math.round((totalAllocated / totalBudget) * 100))}%`,
                        backgroundColor:
                          totalAllocated > totalBudget
                            ? colors.expense
                            : colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round((totalAllocated / totalBudget) * 100)}% of monthly budget ({formatAmount(totalBudget, currencyConfig)})
                </Text>
              </View>
            )}
          </View>

          {/* Category List */}
          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            {EXPENSE_CATEGORIES.map((cat) => {
              const currentVal = budgetValues[cat.id] || '';
              return (
                <View key={cat.id} style={styles.catRow}>
                  <View style={styles.catInfo}>
                    <CategoryIcon categoryId={cat.id} size={38} />
                    <View style={styles.catNameBox}>
                      <Text style={styles.catLabel}>{cat.label}</Text>
                      <View style={styles.quickChips}>
                        {[500, 1000, 2000].map((amt) => (
                          <TouchableOpacity
                            key={amt}
                            style={styles.chip}
                            onPress={() => handleQuickAdd(cat.id, amt)}
                          >
                            <Text style={styles.chipText}>+{amt}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.currencyPrefix}>{currencySymbol}</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      value={currentVal}
                      onChangeText={(txt) => handleAmountChange(cat.id, txt)}
                    />
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveText}>Save Limits</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing['2xl'] : Spacing.lg,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: colors.cardMuted,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FontSize.sm,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  summaryValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: colors.primary,
  },
  progressContainer: {
    marginTop: Spacing.xs,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    marginTop: 4,
  },
  scrollList: {
    marginBottom: Spacing.md,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  catInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  catNameBox: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  catLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  quickChips: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  chip: {
    backgroundColor: colors.cardMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  chipText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: Spacing.sm,
    width: 110,
    height: 38,
  },
  currencyPrefix: {
    fontSize: FontSize.xs,
    color: colors.textMuted,
    marginRight: 2,
  },
  input: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
    padding: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        outlineWidth: 0,
      } as any,
    }),
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: BorderRadius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: colors.textSecondary,
  },
  saveBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: BorderRadius.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#ffffff',
  },
});
