import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import { formatAmount } from '@/constants/currency';
import { useAccountStore } from '@/store/accountStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useTransactionStore } from '@/store/transactionStore';

const colors = Colors.light;

interface TransferModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TransferModal({ visible, onClose, onSuccess }: TransferModalProps) {
  const accounts = useAccountStore((s) => s.accounts);
  const transfer = useAccountStore((s) => s.transfer);
  const refreshDashboard = useDashboardStore((s) => s.refresh);
  const refreshTransactions = useTransactionStore((s) => s.refresh);

  const [fromAccountId, setFromAccountId] = useState<string>(accounts[0]?._id || '');
  const [toAccountId, setToAccountId] = useState<string>(accounts[1]?._id || '');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync default selection when accounts change
  React.useEffect(() => {
    if (accounts.length > 0 && !fromAccountId) {
      setFromAccountId(accounts[0]._id);
    }
    if (accounts.length > 1 && !toAccountId) {
      setToAccountId(accounts[1]._id);
    }
  }, [accounts]);

  const handleTransfer = async () => {
    const transferAmt = parseFloat(amount);
    if (!transferAmt || transferAmt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid transfer amount.');
      return;
    }

    if (!fromAccountId || !toAccountId) {
      Alert.alert('Selection Required', 'Please select both source and destination accounts.');
      return;
    }

    if (fromAccountId === toAccountId) {
      Alert.alert('Error', 'Source and destination accounts must be different.');
      return;
    }

    try {
      setLoading(true);
      await transfer({
        fromAccountId,
        toAccountId,
        amount: transferAmt,
        description: notes.trim() || undefined,
      });

      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }

      refreshDashboard();
      refreshTransactions();

      Alert.alert('Success', 'Transfer completed successfully!');
      setAmount('');
      setNotes('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
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
              <Text style={styles.title}>Transfer Funds</Text>
              <Text style={styles.subtitle}>Move money between your wallets / accounts</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Amount */}
            <Text style={styles.fieldLabel}>TRANSFER AMOUNT</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />

            {/* From Account */}
            <Text style={styles.fieldLabel}>FROM ACCOUNT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accList}>
              {accounts.map((acc) => {
                const isSelected = fromAccountId === acc._id;
                return (
                  <TouchableOpacity
                    key={acc._id}
                    style={[styles.accChip, isSelected && styles.accChipActive]}
                    onPress={() => setFromAccountId(acc._id)}
                  >
                    <Text style={[styles.accChipName, isSelected && styles.accChipTextActive]}>
                      {acc.name}
                    </Text>
                    <Text style={[styles.accChipBal, isSelected && styles.accChipTextActive]}>
                      {formatAmount(acc.balance)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Transfer Direction Indicator */}
            <View style={styles.arrowRow}>
              <View style={styles.arrowCircle}>
                <Ionicons name="arrow-down" size={18} color={colors.primary} />
              </View>
            </View>

            {/* To Account */}
            <Text style={styles.fieldLabel}>TO ACCOUNT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accList}>
              {accounts.map((acc) => {
                const isSelected = toAccountId === acc._id;
                return (
                  <TouchableOpacity
                    key={acc._id}
                    style={[styles.accChip, isSelected && styles.accChipActive]}
                    onPress={() => setToAccountId(acc._id)}
                  >
                    <Text style={[styles.accChipName, isSelected && styles.accChipTextActive]}>
                      {acc.name}
                    </Text>
                    <Text style={[styles.accChipBal, isSelected && styles.accChipTextActive]}>
                      {formatAmount(acc.balance)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Notes */}
            <Text style={styles.fieldLabel}>NOTE / REFERENCE (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. ATM cash withdrawal, CC bill payment"
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
            />
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.7 }]}
              onPress={handleTransfer}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveText}>Confirm Transfer</Text>
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
  fieldLabel: {
    fontSize: FontSize['2xs'],
    fontWeight: FontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  amountInput: {
    backgroundColor: colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: colors.primary,
    textAlign: 'center',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        outlineWidth: 0,
      } as any,
    }),
  },
  accList: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  accChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: Spacing.sm,
    minWidth: 100,
  },
  accChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  accChipName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  accChipBal: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    marginTop: 2,
  },
  accChipTextActive: {
    color: '#ffffff',
  },
  arrowRow: {
    alignItems: 'center',
    marginVertical: 6,
  },
  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
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
    height: 48,
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
