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
import { goalService } from '@/services/goalService';
import type { Goal } from '@/types';

const colors = Colors.light;

interface GoalsModalProps {
  visible: boolean;
  onClose: () => void;
}

const GOAL_COLORS = ['#16A34A', '#2563EB', '#9333EA', '#EA580C', '#0D9488', '#DC2626'];

export function GoalsModal({ visible, onClose }: GoalsModalProps) {
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [totalTarget, setTotalTarget] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  const [showAddForm, setShowAddForm] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await goalService.getGoals();
      setGoals(res.goals || []);
      setTotalTarget(res.totalTarget || 0);
      setTotalSaved(res.totalSaved || 0);
      setOverallProgress(res.overallProgress || 0);
    } catch (err: any) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchGoals();
      setShowAddForm(false);
      setDepositGoalId(null);
    }
  }, [visible]);

  const handleCreate = async () => {
    if (!title.trim() || !targetAmount || parseFloat(targetAmount) <= 0) {
      Alert.alert('Required', 'Please enter a goal title and target amount.');
      return;
    }

    try {
      setSubmitting(true);
      await goalService.create({
        title: title.trim(),
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(initialAmount) || 0,
        color: selectedColor,
      });

      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }

      setTitle('');
      setTargetAmount('');
      setInitialAmount('');
      setShowAddForm(false);
      await fetchGoals();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeposit = async (goal: Goal) => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    try {
      if (Platform.OS !== 'web') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {}
      }
      await goalService.deposit(goal._id, amt);
      setDepositGoalId(null);
      setDepositAmount('');
      Alert.alert('Saved ✨', `Deposited ${formatAmount(amt)} into ${goal.title}`);
      await fetchGoals();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Deposit failed');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Goal', 'Are you sure you want to delete this savings goal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await goalService.delete(id);
            await fetchGoals();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete goal');
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
              <Text style={styles.title}>Financial Goals & Savings</Text>
              <Text style={styles.subtitle}>
                Total Saved: {formatAmount(totalSaved)} of {formatAmount(totalTarget)} ({overallProgress}%)
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
              setDepositGoalId(null);
            }}
            activeOpacity={0.85}
          >
            <Ionicons
              name={showAddForm ? 'list-outline' : 'flag-outline'}
              size={18}
              color={showAddForm ? colors.primary : '#ffffff'}
            />
            <Text
              style={[
                styles.addToggleBtnText,
                showAddForm && styles.addToggleBtnTextActive,
              ]}
            >
              {showAddForm ? 'View Active Goals' : 'Create New Savings Goal'}
            </Text>
          </TouchableOpacity>

          {showAddForm ? (
            /* Add Form */
            <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>
              <Text style={styles.fieldLabel}>GOAL TITLE</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Emergency Fund, Japan Trip, MacBook Pro"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.fieldLabel}>TARGET AMOUNT</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={targetAmount}
                onChangeText={setTargetAmount}
              />

              <Text style={styles.fieldLabel}>CURRENT / STARTING SAVINGS (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={initialAmount}
                onChangeText={setInitialAmount}
              />

              <Text style={styles.fieldLabel}>COLOR THEME</Text>
              <View style={styles.colorRow}>
                {GOAL_COLORS.map((c) => {
                  const isSelected = selectedColor === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorDot,
                        { backgroundColor: c },
                        isSelected && styles.colorDotSelected,
                      ]}
                      onPress={() => setSelectedColor(c)}
                    >
                      {isSelected && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                onPress={handleCreate}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Create Goal</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          ) : (
            /* Goals List */
            <ScrollView showsVerticalScrollIndicator={false} style={styles.listScroll}>
              {loading ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: Spacing.xl }} />
              ) : goals.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons name="trophy" size={28} color={colors.primary} />
                  </View>
                  <Text style={styles.emptyTitle}>No savings goals yet</Text>
                  <Text style={styles.emptySub}>
                    Create targets for emergency funds, vacations, or major purchases to stay disciplined.
                  </Text>
                </View>
              ) : (
                goals.map((g) => {
                  const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                  const isCompleted = g.currentAmount >= g.targetAmount;
                  const isDepositing = depositGoalId === g._id;

                  return (
                    <View key={g._id} style={styles.goalCard}>
                      <View style={styles.goalTop}>
                        <View style={styles.goalTitleRow}>
                          <View style={[styles.goalColorDot, { backgroundColor: g.color || colors.primary }]} />
                          <Text style={styles.goalTitle}>{g.title}</Text>
                        </View>
                        <View style={styles.goalActions}>
                          <Text
                            style={[
                              styles.goalPct,
                              { color: isCompleted ? colors.success : g.color || colors.primary },
                            ]}
                          >
                            {pct}%
                          </Text>
                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => handleDelete(g._id)}
                          >
                            <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Progress Track */}
                      <View style={styles.trackBg}>
                        <View
                          style={[
                            styles.trackFill,
                            {
                              width: `${pct}%`,
                              backgroundColor: isCompleted ? colors.success : g.color || colors.primary,
                            },
                          ]}
                        />
                      </View>

                      <View style={styles.goalMetaRow}>
                        <Text style={styles.goalMetaText}>
                          {formatAmount(g.currentAmount)} / {formatAmount(g.targetAmount)}
                        </Text>
                        <TouchableOpacity
                          style={styles.depositBtn}
                          onPress={() => setDepositGoalId(isDepositing ? null : g._id)}
                        >
                          <Ionicons name="add" size={12} color="#ffffff" />
                          <Text style={styles.depositBtnText}>Add Funds</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Quick Deposit Form */}
                      {isDepositing && (
                        <View style={styles.depositBox}>
                          <TextInput
                            style={styles.depositInput}
                            placeholder="Deposit amount"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="decimal-pad"
                            value={depositAmount}
                            onChangeText={setDepositAmount}
                            autoFocus
                          />
                          <TouchableOpacity
                            style={styles.depositConfirmBtn}
                            onPress={() => handleDeposit(g)}
                          >
                            <Text style={styles.depositConfirmText}>Deposit</Text>
                          </TouchableOpacity>
                        </View>
                      )}
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
  colorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: colors.textPrimary,
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
  goalCard: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  goalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  goalTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  goalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalPct: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  deleteBtn: {
    padding: 2,
  },
  trackBg: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: Spacing.xs,
  },
  trackFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  goalMetaText: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  depositBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  depositBtnText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#ffffff',
  },
  depositBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  depositInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: Spacing.sm,
    height: 38,
    fontSize: FontSize.xs,
    color: colors.textPrimary,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        outlineWidth: 0,
      } as any,
    }),
  },
  depositConfirmBtn: {
    backgroundColor: colors.success,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  depositConfirmText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#ffffff',
  },
});
