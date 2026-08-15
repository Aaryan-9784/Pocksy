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
import { useAccountStore } from '@/store/accountStore';
import type { AccountType } from '@/types';

const colors = Colors.light;

interface AccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ACCOUNT_TYPES: { id: AccountType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'bank', label: 'Bank', icon: 'business-outline' },
  { id: 'cash', label: 'Cash', icon: 'cash-outline' },
  { id: 'wallet', label: 'Wallet/UPI', icon: 'wallet-outline' },
  { id: 'credit_card', label: 'Card', icon: 'card-outline' },
  { id: 'savings', label: 'Savings', icon: 'cube-outline' },
];

const COLOR_PALETTES = [
  '#2563EB', // Blue
  '#16A34A', // Green
  '#9333EA', // Purple
  '#EA580C', // Orange
  '#DC2626', // Red
  '#0D9488', // Teal
  '#6B1E2B', // Maroon
];

export function AccountModal({ visible, onClose, onSuccess }: AccountModalProps) {
  const createAccount = useAccountStore((s) => s.createAccount);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTES[0]);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setType('bank');
    setBalance('');
    setAccountNumber('');
    setSelectedColor(COLOR_PALETTES[0]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter an account name (e.g. HDFC Bank, Cash).');
      return;
    }

    try {
      setLoading(true);
      await createAccount({
        name: name.trim(),
        type,
        balance: parseFloat(balance) || 0,
        accountNumber: accountNumber.trim() || undefined,
        color: selectedColor,
      });

      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }

      Alert.alert('Success', 'Account created successfully!');
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create account');
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
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Add New Account / Wallet</Text>
              <Text style={styles.subtitle}>Track separate balances & payment sources</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Account Type Selector */}
            <Text style={styles.fieldLabel}>ACCOUNT TYPE</Text>
            <View style={styles.typeRow}>
              {ACCOUNT_TYPES.map((t) => {
                const isSelected = type === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.typeChip, isSelected && styles.typeChipActive]}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        try {
                          Haptics.selectionAsync();
                        } catch {}
                      }
                      setType(t.id);
                    }}
                  >
                    <Ionicons
                      name={t.icon}
                      size={16}
                      color={isSelected ? '#fff' : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.typeChipText,
                        isSelected && styles.typeChipTextActive,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Account Name */}
            <Text style={styles.fieldLabel}>ACCOUNT NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. SBI Salary Account, ICICI Card"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            {/* Initial Balance */}
            <Text style={styles.fieldLabel}>STARTING BALANCE</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={balance}
              onChangeText={setBalance}
            />

            {/* Account Number (Optional) */}
            <Text style={styles.fieldLabel}>LAST 4 DIGITS / IDENTIFIER (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 4092"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={10}
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            {/* Color Palette */}
            <Text style={styles.fieldLabel}>COLOR THEME</Text>
            <View style={styles.colorRow}>
              {COLOR_PALETTES.map((c) => {
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
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Action Buttons */}
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
                <Text style={styles.saveText}>Create Account</Text>
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
  fieldLabel: {
    fontSize: FontSize['2xs'],
    fontWeight: FontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.cardMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
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
