import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  Modal,
  TextInput,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Avatar, PocksyButton, AppHeader, PageTitle } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useTransactionStore } from '@/store/transactionStore';
import { CURRENCIES, formatAmount } from '@/constants/currency';
import { budgetService } from '@/services/budgetService';
import { transactionService } from '@/services/transactionService';
import { RecurringModal } from '@/components/recurring/RecurringModal';
import { GoalsModal } from '@/components/goals/GoalsModal';
import { DebtModal } from '@/components/debts/DebtModal';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const colors = Colors.light;


interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
}

function MenuItem({
  icon,
  iconColor = colors.primary,
  iconBg = colors.primaryLight,
  label,
  value,
  onPress,
  isLast = false,
}: MenuItemProps) {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[menuStyles.item, !isLast && menuStyles.itemBorder]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[menuStyles.iconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={menuStyles.label}>{label}</Text>
      {value ? <Text style={menuStyles.value}>{value}</Text> : null}
      {onPress && (
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const refreshDashboard = useDashboardStore((s) => s.refresh);
  const refreshTransactions = useTransactionStore((s) => s.refresh);

  // Modals state
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [recurringModalVisible, setRecurringModalVisible] = useState(false);
  const [goalsModalVisible, setGoalsModalVisible] = useState(false);
  const [debtModalVisible, setDebtModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [savingBudget, setSavingBudget] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('pocksy_biometric_enabled').then((val) => {
      setBiometricEnabled(val === 'true');
    });
  }, []);

  const handleToggleBiometric = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'Biometric lock is only available on physical iOS and Android devices.');
      return;
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          'Biometrics Unavailable',
          'Please set up Face ID or Fingerprint in your device settings.'
        );
        return;
      }

      if (!biometricEnabled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to enable Pocksy App Lock',
          fallbackLabel: 'Use Passcode',
        });

        if (result.success) {
          await AsyncStorage.setItem('pocksy_biometric_enabled', 'true');
          setBiometricEnabled(true);
          Alert.alert('Success 🔒', 'Biometric App Lock enabled!');
        }
      } else {
        await AsyncStorage.setItem('pocksy_biometric_enabled', 'false');
        setBiometricEnabled(false);
        Alert.alert('App Lock Disabled', 'Biometric App Lock has been turned off.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not configure biometrics');
    }
  };

  const currencyCode = user?.currency || 'INR';
  const currencyConfig = CURRENCIES[currencyCode];
  const currencyDisplay = currencyConfig
    ? `${currencyCode} (${currencyConfig.symbol})`
    : currencyCode;

  const handleCurrencySelect = async (code: string) => {
    try {
      if (Platform.OS !== 'web') {
        try {
          Haptics.selectionAsync();
        } catch {}
      }
      await updateProfile({ currency: code });
      setCurrencyModalVisible(false);
      refreshDashboard();
      refreshTransactions();
      Alert.alert('Currency Updated', `Default currency set to ${code}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update currency');
    }
  };

  const handleOpenBudgetModal = () => {
    setBudgetInput(user?.monthlyBudget ? user.monthlyBudget.toString() : '');
    setBudgetModalVisible(true);
  };

  const handleSaveBudget = async () => {
    const num = parseFloat(budgetInput);
    if (isNaN(num) || num < 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number for your budget.');
      return;
    }

    setSavingBudget(true);
    try {
      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }
      await updateProfile({ monthlyBudget: num });
      const now = new Date();
      await budgetService.set({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        amount: num,
      });

      setBudgetModalVisible(false);
      refreshDashboard();
      Alert.alert('Budget Saved ✨', `Monthly budget set to ${formatAmount(num)}.`);
    } catch (err: any) {
      Alert.alert('Budget Update Failed', err.message || 'Could not update budget.');
    } finally {
      setSavingBudget(false);
    }
  };

  const handleExportData = async () => {
    try {
      if (Platform.OS !== 'web') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {}
      }
      const csv = await transactionService.exportCsv();
      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `pocksy_transactions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Alert.alert('Export Complete', 'Your CSV file has been downloaded.');
      } else {
        await Share.share({
          message: csv,
          title: 'Pocksy Transactions Export',
        });
      }
    } catch (err: any) {
      Alert.alert('Export Failed', err.message || 'Could not export transaction data.');
    }
  };

  const handleCloudSync = async () => {
    setSyncing(true);
    try {
      if (Platform.OS !== 'web') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
      }
      await Promise.all([fetchUser(), refreshDashboard(), refreshTransactions()]);
      Alert.alert('Sync Complete ☁️', 'All your transactions and balances are up to date.');
    } catch (err: any) {
      Alert.alert('Sync Error', 'Could not sync data right now.');
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }
    setLogoutModalVisible(true);
  };

  const performLogout = async () => {
    setLoggingOut(true);
    try {
      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch {}
      }
      await logout();
      setLogoutModalVisible(false);
      router.replace('/(auth)/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString([], {
        month: 'short',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <View style={styles.container}>
      {/* Fixed Top Brand & Profile Header */}
      <AppHeader showProfile={true} />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing['5xl'] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title Block */}
        <PageTitle
          title="Account"
          subtitle="Manage your profile & preferences"
        />

        {/* Hero Profile card */}
        <View style={styles.profileCard}>
          <Avatar name={user?.name || 'AP'} size={68} showOnline={true} />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{user?.name || 'Pocksy User'}</Text>
              <View style={styles.freeBadge}>
                <Ionicons name="shield-checkmark" size={11} color={colors.primary} />
                <Text style={styles.freeBadgeText}>FREE FOREVER</Text>
              </View>
            </View>
            <Text style={styles.profileEmail}>{user?.email || 'user@pocksy.app'}</Text>

            <View style={styles.memberPill}>
              <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.memberText}>Member since {memberSince}</Text>
            </View>
          </View>
        </View>

      {/* Preferences Section */}
      <Text style={styles.groupLabel}>PREFERENCES</Text>
      <View style={styles.menuSection}>
        <MenuItem
          icon="cash-outline"
          iconColor="#16A34A"
          iconBg="#DCFCE7"
          label="Currency"
          value={currencyDisplay}
          onPress={() => setCurrencyModalVisible(true)}
        />
        <MenuItem
          icon="pie-chart-outline"
          iconColor={colors.primary}
          iconBg={colors.primaryLight}
          label="Monthly Budget"
          value={user?.monthlyBudget ? formatAmount(user.monthlyBudget) : 'Not configured'}
          onPress={handleOpenBudgetModal}
        />
        <MenuItem
          icon="notifications-outline"
          iconColor="#2563EB"
          iconBg="#DBEAFE"
          label="Daily Reminders"
          value="Enabled"
          isLast
        />
      </View>

      {/* Financial Tools Section */}
      <Text style={styles.groupLabel}>FINANCIAL TOOLS</Text>
      <View style={styles.menuSection}>
        <MenuItem
          icon="repeat-outline"
          iconColor="#0D9488"
          iconBg="#CCFBF1"
          label="Subscriptions & Recurring Bills"
          value="Manage"
          onPress={() => setRecurringModalVisible(true)}
        />
        <MenuItem
          icon="trophy-outline"
          iconColor="#EA580C"
          iconBg="#FFEDD5"
          label="Goals & Savings Pots"
          value="Track"
          onPress={() => setGoalsModalVisible(true)}
        />
        <MenuItem
          icon="people-outline"
          iconColor="#9333EA"
          iconBg="#F3E8FF"
          label="Debt & Lending (IOU / Udhaar)"
          value="Manage"
          onPress={() => setDebtModalVisible(true)}
          isLast
        />
      </View>

      {/* Security & Data */}
      <Text style={styles.groupLabel}>DATA & SECURITY</Text>
      <View style={styles.menuSection}>
        <MenuItem
          icon="download-outline"
          iconColor="#7C3AED"
          iconBg="#EDE9FE"
          label="Export Transactions"
          value="CSV"
          onPress={handleExportData}
        />
        <MenuItem
          icon="cloud-done-outline"
          iconColor="#059669"
          iconBg="#ECFDF5"
          label="Cloud Sync"
          value={syncing ? 'Syncing...' : 'Tap to sync'}
          onPress={handleCloudSync}
        />
        <MenuItem
          icon="shield-checkmark-outline"
          iconColor="#0891B2"
          iconBg="#CFFAFE"
          label="Biometric App Lock"
          value={biometricEnabled ? 'Enabled 🔒' : 'Off'}
          onPress={handleToggleBiometric}
          isLast
        />
      </View>

      {/* App Info */}
      <Text style={styles.groupLabel}>APP INFORMATION</Text>
      <View style={styles.menuSection}>
        <MenuItem
          icon="help-circle-outline"
          iconColor="#EA580C"
          iconBg="#FFEDD5"
          label="Help & FAQ"
          onPress={() => Alert.alert('Pocksy Support', 'Visit https://github.com/Aaryan-9784/Pocksy for documentation & support.')}
        />
        <MenuItem
          icon="lock-closed-outline"
          iconColor={colors.textSecondary}
          iconBg={colors.cardMuted}
          label="Privacy Policy"
          onPress={() => Alert.alert('Privacy Policy', 'Your financial records are encrypted and strictly private.')}
        />
        <MenuItem
          icon="information-circle-outline"
          iconColor={colors.textSecondary}
          iconBg={colors.cardMuted}
          label="Version"
          value="1.0.0 (Gold)"
          isLast
        />
      </View>

      {/* Sign Out CTA */}
      <View style={styles.logoutContainer}>
        <PocksyButton
          title="Sign Out"
          onPress={handleLogout}
          variant="outline"
          icon={<Ionicons name="log-out-outline" size={18} color={colors.primary} />}
        />
      </View>

      {/* Currency Selector Modal */}
      <Modal visible={currencyModalVisible} transparent animationType="slide" onRequestClose={() => setCurrencyModalVisible(false)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Select Currency</Text>
              <TouchableOpacity onPress={() => setCurrencyModalVisible(false)} style={modalStyles.closeBtn}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 380 }}>
              {Object.entries(CURRENCIES).map(([code, config]) => {
                const isSelected = currencyCode === code;
                return (
                  <TouchableOpacity
                    key={code}
                    style={[modalStyles.currencyRow, isSelected && modalStyles.currencyRowActive]}
                    onPress={() => handleCurrencySelect(code)}
                  >
                    <View style={modalStyles.currencySymbolBox}>
                      <Text style={modalStyles.currencySymbolText}>{config.symbol}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={modalStyles.currencyCodeText}>{code} — {config.name}</Text>
                      <Text style={modalStyles.currencySubText}>Symbol: {config.symbol}</Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Budget Goal Editor Modal */}
      <Modal visible={budgetModalVisible} transparent animationType="slide" onRequestClose={() => setBudgetModalVisible(false)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Set Monthly Budget Goal</Text>
              <TouchableOpacity onPress={() => setBudgetModalVisible(false)} style={modalStyles.closeBtn}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: Spacing.xl }}>
              <Text style={modalStyles.budgetHelper}>
                Set your maximum target spending for the month. We'll automatically calculate remaining limits and alert you before you exceed.
              </Text>
              <TextInput
                style={modalStyles.budgetInput}
                placeholder="e.g. 50000"
                placeholderTextColor={colors.textMuted}
                value={budgetInput}
                onChangeText={setBudgetInput}
                keyboardType="numeric"
                autoFocus
              />
              <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
                <PocksyButton
                  title="Save Budget Target"
                  onPress={handleSaveBudget}
                  loading={savingBudget}
                  icon={<Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />}
                />
                <PocksyButton
                  title="Cancel"
                  onPress={() => setBudgetModalVisible(false)}
                  variant="ghost"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Subscriptions & Recurring Bills Modal */}
      <RecurringModal
        visible={recurringModalVisible}
        onClose={() => setRecurringModalVisible(false)}
      />

      {/* Financial Goals & Savings Pots Modal */}
      <GoalsModal
        visible={goalsModalVisible}
        onClose={() => setGoalsModalVisible(false)}
      />

      {/* Debt & Lending Tracker Modal */}
      <DebtModal
        visible={debtModalVisible}
        onClose={() => setDebtModalVisible(false)}
      />

      {/* Pocksy Signature Theme Sign Out Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !loggingOut && setLogoutModalVisible(false)}
      >
        <View style={logoutModalStyles.overlay}>
          <View style={logoutModalStyles.dialog}>
            {/* Ambient Dual-Ring Burgundy Icon Core */}
            <View style={logoutModalStyles.glowOuterRing}>
              <LinearGradient
                colors={colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={logoutModalStyles.iconCore}
              >
                <Ionicons name="log-out-outline" size={26} color="#FFFFFF" />
              </LinearGradient>
            </View>

            <Text style={logoutModalStyles.title}>Sign Out of Pocksy?</Text>
            <Text style={logoutModalStyles.subtitle}>
              Are you sure you want to sign out? Your financial records and configurations remain securely stored.
            </Text>

            <View style={logoutModalStyles.btnGroup}>
              <PocksyButton
                title="Yes, Sign Out"
                onPress={performLogout}
                loading={loggingOut}
                variant="primary"
                icon={<Ionicons name="log-out-outline" size={18} color="#FFFFFF" />}
              />
              <PocksyButton
                title="Cancel"
                onPress={() => setLogoutModalVisible(false)}
                variant="outline"
                disabled={loggingOut}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing['5xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  profileInfo: {
    marginLeft: Spacing.base,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primaryLight,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(107, 30, 43, 0.12)',
  },
  freeBadgeText: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: FontWeight.heavy,
    letterSpacing: 0.4,
  },
  profileEmail: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  memberText: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  groupLabel: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.8,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  menuSection: {
    backgroundColor: colors.card,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  logoutContainer: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});

const menuStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  label: {
    flex: 1,
    fontSize: FontSize.sm,
    color: colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  value: {
    fontSize: FontSize.xs,
    color: colors.textMuted,
    marginRight: Spacing.xs,
    fontWeight: FontWeight.medium,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.card,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingBottom: Spacing['3xl'],
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
  title: {
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
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  currencyRowActive: {
    backgroundColor: colors.primaryLight,
  },
  currencySymbolBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  currencySymbolText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: colors.primary,
  },
  currencyCodeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  currencySubText: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    marginTop: 2,
  },
  budgetHelper: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  budgetInput: {
    backgroundColor: colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        outlineWidth: 0,
      } as any,
    }),
  },
});

const logoutModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 14, 16, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(6px)',
      } as any,
    }),
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: BorderRadius['2xl'],
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    ...Shadows.lg,
  },
  glowOuterRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: 'rgba(107, 30, 43, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  iconCore: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.heavy,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  btnGroup: {
    width: '100%',
    gap: Spacing.sm,
  },
});


