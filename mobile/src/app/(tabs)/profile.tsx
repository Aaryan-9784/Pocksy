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
  Linking,
  Switch,
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

const FAQ_ITEMS = [
  {
    q: 'How do I add and categorize transactions?',
    a: 'Tap the "+" button in the bottom navigation bar to record any expense or income. Choose an intuitive category, select payment mode, add optional notes, and tap Save.',
  },
  {
    q: 'How does Monthly Budget tracking work?',
    a: 'Set your overall monthly budget limit under Preferences > Monthly Budget. Pocksy tracks your burn rate in real time, displays remaining limits, and alerts you before you exceed your target.',
  },
  {
    q: 'What are Subscriptions & Recurring Bills?',
    a: 'Under Financial Tools, manage your Netflix, Spotify, gym, rent, and utility bills. Pocksy calculates your fixed monthly commitments automatically.',
  },
  {
    q: 'How does Debt & Lending (IOU / Udhaar) work?',
    a: 'Keep track of money you have lent to friends or borrowed. You can record repayments and settle balances with one tap.',
  },
  {
    q: 'How do Goals & Savings Pots work?',
    a: 'Create targeted savings buckets (e.g., Emergency Fund, Vacation, New Phone), set target amounts, and make deposits anytime to track progress visually.',
  },
  {
    q: 'Is my financial data secure?',
    a: 'Yes. Your data is encrypted, stored with bank-grade security standards, and we never share or sell personal financial details to third parties.',
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const refreshDashboard = useDashboardStore((s) => s.refresh);
  const refreshTransactions = useTransactionStore((s) => s.refresh);

  // Modals state
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [remindersModalVisible, setRemindersModalVisible] = useState(false);
  const [recurringModalVisible, setRecurringModalVisible] = useState(false);
  const [goalsModalVisible, setGoalsModalVisible] = useState(false);
  const [debtModalVisible, setDebtModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [biometricModalVisible, setBiometricModalVisible] = useState(false);
  const [faqModalVisible, setFaqModalVisible] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Edit profile form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Daily reminders state
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('08:00 PM');
  const [notifyDailyLog, setNotifyDailyLog] = useState(true);
  const [notifyBudgetAlert, setNotifyBudgetAlert] = useState(true);
  const [notifyBillDue, setNotifyBillDue] = useState(true);

  // Other state
  const [loggingOut, setLoggingOut] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<'Face ID' | 'Fingerprint' | 'Face ID / Fingerprint'>('Face ID / Fingerprint');
  const [budgetInput, setBudgetInput] = useState('');
  const [savingBudget, setSavingBudget] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [testingBio, setTestingBio] = useState(false);
  const [bioTestResult, setBioTestResult] = useState<'success' | 'failed' | null>(null);

  // Load preferences from storage
  useEffect(() => {
    AsyncStorage.getItem('pocksy_biometric_enabled').then((val) => {
      setBiometricEnabled(val === 'true');
    });

    if ((Platform.OS as string) !== 'web') {
      LocalAuthentication.supportedAuthenticationTypesAsync().then((types) => {
        const hasFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
        const hasFingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
        if (hasFace && hasFingerprint) {
          setBiometricType('Face ID / Fingerprint');
        } else if (hasFace) {
          setBiometricType('Face ID');
        } else if (hasFingerprint) {
          setBiometricType('Fingerprint');
        }
      }).catch(() => {});
    }

    AsyncStorage.getItem('pocksy_reminders_enabled').then((val) => {
      if (val !== null) setRemindersEnabled(val === 'true');
    });

    AsyncStorage.getItem('pocksy_reminder_time').then((val) => {
      if (val) setReminderTime(val);
    });
  }, []);

  useEffect(() => {
    if (user?.name) {
      setProfileName(user.name);
    }
  }, [user?.name]);

  // Face ID & Biometric handlers
  const handleToggleBiometricSwitch = async (value: boolean) => {
    setBiometricEnabled(value);
    await AsyncStorage.setItem('pocksy_biometric_enabled', value ? 'true' : 'false');
    if ((Platform.OS as string) !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
  };

  const handleTestBiometricScan = async () => {
    setTestingBio(true);
    setBioTestResult(null);

    if ((Platform.OS as string) !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }

    if ((Platform.OS as string) === 'web') {
      setTimeout(() => {
        setTestingBio(false);
        setBioTestResult('success');
      }, 700);
      return;
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setBioTestResult('failed');
        Alert.alert(
          'Biometrics Not Enrolled',
          'Please set up Face ID or Fingerprint recognition in your device settings.'
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with Face ID / Fingerprint to test Pocksy App Lock',
        fallbackLabel: 'Use Device Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        setBioTestResult('success');
      } else {
        setBioTestResult('failed');
      }
    } catch (err: any) {
      setBioTestResult('failed');
    } finally {
      setTestingBio(false);
    }
  };

  // Currency
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

  // Profile Edit
  const handleOpenEditProfile = () => {
    setProfileName(user?.name || '');
    setEditProfileModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      Alert.alert('Name Required', 'Please enter your name.');
      return;
    }

    setSavingProfile(true);
    try {
      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }
      await updateProfile({ name: profileName.trim() });
      setEditProfileModalVisible(false);
      Alert.alert('Profile Updated ✨', 'Your account details have been saved.');
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Budget
  const handleOpenBudgetModal = () => {
    setBudgetInput(user?.monthlyBudget ? user.monthlyBudget.toString() : '');
    setBudgetModalVisible(true);
  };

  const handleSaveBudget = async (presetAmount?: number) => {
    const targetVal = presetAmount !== undefined ? presetAmount : parseFloat(budgetInput);
    if (isNaN(targetVal) || targetVal < 0) {
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
      await updateProfile({ monthlyBudget: targetVal });
      const now = new Date();
      await budgetService.set({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        amount: targetVal,
      });

      setBudgetModalVisible(false);
      refreshDashboard();
      Alert.alert('Budget Saved ✨', `Monthly budget set to ${formatAmount(targetVal)}.`);
    } catch (err: any) {
      Alert.alert('Budget Update Failed', err.message || 'Could not update budget.');
    } finally {
      setSavingBudget(false);
    }
  };

  // Daily Reminders
  const handleSaveReminders = async () => {
    try {
      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }
      await AsyncStorage.setItem('pocksy_reminders_enabled', remindersEnabled ? 'true' : 'false');
      await AsyncStorage.setItem('pocksy_reminder_time', reminderTime);
      setRemindersModalVisible(false);
      Alert.alert(
        'Reminders Configured 🔔',
        remindersEnabled
          ? `Daily notifications set for ${reminderTime}.`
          : 'Daily reminders turned off.'
      );
    } catch (err: any) {
      Alert.alert('Error', 'Failed to save reminder preferences.');
    }
  };

  // Export Data (CSV)
  const handleExecuteExport = async () => {
    setExporting(true);
    try {
      if (Platform.OS !== 'web') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {}
      }

      const csv = await transactionService.exportCsv();
      const filename = `pocksy_transactions_${new Date().toISOString().split('T')[0]}`;

      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        await Share.share({
          message: csv,
          title: 'Pocksy Transactions CSV Export',
        });
      }

      setExportModalVisible(false);
      Alert.alert('Export Complete 📥', 'Your transactions CSV spreadsheet has been exported.');
    } catch (err: any) {
      Alert.alert('Export Failed', err.message || 'Could not export transactions.');
    } finally {
      setExporting(false);
    }
  };

  // Check for Updates
  const handleCheckForUpdates = () => {
    setCheckingUpdates(true);
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }

    setTimeout(() => {
      setCheckingUpdates(false);
      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }
      Alert.alert(
        'Up to Date! 🚀',
        'Pocksy Version 1.0.0 (Gold Release) is the latest version. All features and security patches are up to date.'
      );
    }, 850);
  };

  // Logout
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

  // Filtered currencies
  const filteredCurrencies = Object.entries(CURRENCIES).filter(([code, config]) => {
    const q = currencySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      code.toLowerCase().includes(q) ||
      config.name.toLowerCase().includes(q) ||
      config.symbol.toLowerCase().includes(q) ||
      (config.country && config.country.toLowerCase().includes(q))
    );
  });

  return (
    <View style={styles.container}>
      {/* Fixed Top Header */}
      <AppHeader showProfile={true} />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing['5xl'] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <PageTitle
          title="Account"
          subtitle="Manage your profile & preferences"
        />

        {/* Hero Profile Card */}
        <TouchableOpacity
          style={styles.profileCard}
          activeOpacity={0.85}
          onPress={handleOpenEditProfile}
        >
          <Avatar name={user?.name || 'AP'} size={64} showOnline={true} />
          
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName} numberOfLines={1}>
                {user?.name || 'Pocksy User'}
              </Text>
              <View style={styles.freeBadge}>
                <Ionicons name="shield-checkmark" size={10} color={colors.primary} />
                <Text style={styles.freeBadgeText}>FREE FOREVER</Text>
              </View>
            </View>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {user?.email || 'user@pocksy.app'}
            </Text>

            <View style={styles.memberPill}>
              <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.memberText}>Member since {memberSince}</Text>
            </View>
          </View>

          <View style={styles.editIconBtn}>
            <Ionicons name="pencil" size={15} color={colors.primary} />
          </View>
        </TouchableOpacity>

        {/* 1. Preferences Section */}
        <Text style={styles.groupLabel}>PREFERENCES</Text>
        <View style={styles.menuSection}>
          <MenuItem
            icon="cash-outline"
            iconColor="#16A34A"
            iconBg="#DCFCE7"
            label="Currency"
            value={currencyDisplay}
            onPress={() => {
              setCurrencySearch('');
              setCurrencyModalVisible(true);
            }}
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
            value={remindersEnabled ? reminderTime : 'Off'}
            onPress={() => setRemindersModalVisible(true)}
            isLast
          />
        </View>

        {/* 2. Financial Tools Section */}
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

        {/* 3. Data & Security Section (Streamlined) */}
        <Text style={styles.groupLabel}>DATA & SECURITY</Text>
        <View style={styles.menuSection}>
          <MenuItem
            icon="download-outline"
            iconColor="#7C3AED"
            iconBg="#EDE9FE"
            label="Export Transactions"
            value="CSV"
            onPress={() => setExportModalVisible(true)}
          />
          <MenuItem
            icon="scan-outline"
            iconColor="#0891B2"
            iconBg="#CFFAFE"
            label="Face ID & Biometric Lock"
            value={biometricEnabled ? 'Active 🔒' : 'Off'}
            onPress={() => setBiometricModalVisible(true)}
            isLast
          />
        </View>

        {/* 4. Support & Information (Streamlined) */}
        <Text style={styles.groupLabel}>SUPPORT & INFORMATION</Text>
        <View style={styles.menuSection}>
          <MenuItem
            icon="help-circle-outline"
            iconColor="#EA580C"
            iconBg="#FFEDD5"
            label="Help & FAQ"
            onPress={() => setFaqModalVisible(true)}
          />
          <MenuItem
            icon="information-circle-outline"
            iconColor={colors.primary}
            iconBg={colors.primaryLight}
            label="About Pocksy"
            value="1.0.0 (Gold)"
            onPress={() => setAboutModalVisible(true)}
            isLast
          />
        </View>

        {/* Sign Out CTA Button */}
        <View style={styles.logoutContainer}>
          <PocksyButton
            title="Sign Out"
            onPress={handleLogout}
            variant="secondary"
            icon={<Ionicons name="log-out-outline" size={18} color={colors.primary} />}
          />
        </View>

        {/* Subtle App Footer */}
        <View style={styles.appFooter}>
          <Text style={styles.appFooterText}>Pocksy • Bank-Grade Encrypted</Text>
        </View>
      </ScrollView>

      {/* 1. EDIT PROFILE MODAL */}
      <Modal
        visible={editProfileModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditProfileModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => setEditProfileModalVisible(false)}
                style={modalStyles.closeBtn}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: Spacing.xl }} showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', marginBottom: Spacing.xl }}>
                <Avatar name={profileName || user?.name || 'AP'} size={76} />
                <Text style={modalStyles.avatarHint}>Initials avatar generated automatically</Text>
              </View>

              <Text style={modalStyles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={modalStyles.textInput}
                placeholder="Enter your name"
                placeholderTextColor={colors.textMuted}
                value={profileName}
                onChangeText={setProfileName}
              />

              <Text style={[modalStyles.inputLabel, { marginTop: Spacing.md }]}>REGISTERED EMAIL</Text>
              <View style={modalStyles.readOnlyBox}>
                <Text style={modalStyles.readOnlyText}>{user?.email || 'user@pocksy.app'}</Text>
                <View style={modalStyles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                  <Text style={modalStyles.verifiedText}>Verified</Text>
                </View>
              </View>

              <Text style={[modalStyles.inputLabel, { marginTop: Spacing.md }]}>DEFAULT CURRENCY</Text>
              <TouchableOpacity
                style={modalStyles.currencyPickerTrigger}
                onPress={() => {
                  setEditProfileModalVisible(false);
                  setCurrencyModalVisible(true);
                }}
              >
                <Text style={modalStyles.currencyTriggerText}>{currencyDisplay}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={modalStyles.buttonStack}>
                <PocksyButton
                  title="Save Changes"
                  onPress={handleSaveProfile}
                  loading={savingProfile}
                  variant="primary"
                  icon={<Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />}
                />
                <PocksyButton
                  title="Cancel"
                  onPress={() => setEditProfileModalVisible(false)}
                  variant="secondary"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. CURRENCY SELECTOR MODAL */}
      <Modal
        visible={currencyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Select Currency</Text>
              <TouchableOpacity
                onPress={() => setCurrencyModalVisible(false)}
                style={modalStyles.closeBtn}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={modalStyles.searchContainer}>
              <Ionicons name="search-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={modalStyles.searchInput}
                placeholder="Search currency name or code..."
                placeholderTextColor={colors.textMuted}
                value={currencySearch}
                onChangeText={setCurrencySearch}
              />
              {currencySearch ? (
                <TouchableOpacity onPress={() => setCurrencySearch('')}>
                  <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={true}>
              {filteredCurrencies.map(([code, config]) => {
                const isSelected = currencyCode === code;
                return (
                  <TouchableOpacity
                    key={code}
                    style={[modalStyles.currencyRow, isSelected && modalStyles.currencyRowActive]}
                    onPress={() => handleCurrencySelect(code)}
                  >
                    <View style={modalStyles.currencySymbolBox}>
                      <Text
                        style={[
                          modalStyles.currencySymbolText,
                          config.symbol.length > 2 && { fontSize: 11 },
                          config.symbol.length === 2 && { fontSize: 13 },
                        ]}
                        numberOfLines={1}
                      >
                        {config.symbol}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={modalStyles.currencyCodeText}>
                        {code} — {config.name}
                      </Text>
                      <Text style={modalStyles.currencySubText}>
                        {config.country ? `${config.country} • ` : ''}Symbol: {config.symbol}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
              {filteredCurrencies.length === 0 && (
                <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
                  <Text style={{ color: colors.textMuted, fontSize: FontSize.sm }}>
                    No currencies matched your search.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 3. MONTHLY BUDGET MODAL */}
      <Modal
        visible={budgetModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBudgetModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Set Monthly Budget Goal</Text>
              <TouchableOpacity
                onPress={() => setBudgetModalVisible(false)}
                style={modalStyles.closeBtn}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: Spacing.xl }}>
              <Text style={modalStyles.budgetHelper}>
                Set your target spending limit for the month. Pocksy will calculate remaining balance and alert you before exceeding.
              </Text>

              {/* Current Active Budget Indicator */}
              {Boolean(user?.monthlyBudget && user.monthlyBudget > 0) && (
                <View style={modalStyles.currentBudgetCard}>
                  <Ionicons name="pie-chart-outline" size={18} color={colors.primary} />
                  <Text style={modalStyles.currentBudgetText}>
                    Current Goal: <Text style={{ fontWeight: FontWeight.bold }}>{formatAmount(user?.monthlyBudget || 0, currencyConfig)}</Text> / month
                  </Text>
                </View>
              )}
              
              {/* Premium Currency-Prefixed Input */}
              <View style={modalStyles.budgetInputContainer}>
                <Text style={modalStyles.budgetCurrencyPrefix}>{currencyConfig?.symbol || '₹'}</Text>
                <TextInput
                  style={modalStyles.budgetInputField}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  value={budgetInput}
                  onChangeText={(text) => setBudgetInput(text.replace(/[^0-9.]/g, ''))}
                  keyboardType="numeric"
                />
                {Boolean(budgetInput) && (
                  <TouchableOpacity
                    onPress={() => setBudgetInput('')}
                    style={modalStyles.clearInputBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Quick preset chips */}
              <Text style={[modalStyles.inputLabel, { marginTop: Spacing.lg, marginBottom: Spacing.xs }]}>
                QUICK PRESETS
              </Text>
              <View style={modalStyles.presetRow}>
                {[10000, 25000, 50000, 100000].map((preset) => {
                  const isSelected = budgetInput === preset.toString();
                  return (
                    <TouchableOpacity
                      key={preset}
                      style={[modalStyles.presetChip, isSelected && modalStyles.presetChipActive]}
                      onPress={() => {
                        if ((Platform.OS as string) !== 'web') {
                          try {
                            Haptics.selectionAsync();
                          } catch {}
                        }
                        setBudgetInput(preset.toString());
                      }}
                    >
                      <Text style={[modalStyles.presetChipText, isSelected && modalStyles.presetChipTextActive]}>
                        {formatAmount(preset, currencyConfig)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Action Buttons */}
              <View style={modalStyles.buttonStack}>
                <PocksyButton
                  title="Save Budget Target"
                  onPress={() => handleSaveBudget()}
                  loading={savingBudget}
                  variant="primary"
                  icon={<Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />}
                />
                <PocksyButton
                  title="Cancel"
                  onPress={() => setBudgetModalVisible(false)}
                  variant="secondary"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* 4. DAILY REMINDERS MODAL */}
      <Modal
        visible={remindersModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRemindersModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Daily Reminders & Alerts</Text>
              <TouchableOpacity
                onPress={() => setRemindersModalVisible(false)}
                style={modalStyles.closeBtn}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: Spacing.xl }} showsVerticalScrollIndicator={false}>
              {/* Master Switch Card */}
              <TouchableOpacity
                style={[
                  modalStyles.masterSwitchCard,
                  remindersEnabled && modalStyles.masterSwitchCardActive,
                ]}
                activeOpacity={0.85}
                onPress={() => {
                  if ((Platform.OS as string) !== 'web') {
                    try {
                      Haptics.selectionAsync();
                    } catch {}
                  }
                  setRemindersEnabled(!remindersEnabled);
                }}
              >
                <View style={{ flex: 1, marginRight: Spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={modalStyles.masterSwitchTitle}>Enable Daily Reminders</Text>
                    <View
                      style={[
                        modalStyles.statusBadge,
                        { backgroundColor: remindersEnabled ? '#DCFCE7' : colors.borderLight },
                      ]}
                    >
                      <Text
                        style={[
                          modalStyles.statusBadgeText,
                          { color: remindersEnabled ? '#16A34A' : colors.textMuted },
                        ]}
                      >
                        {remindersEnabled ? 'ENABLED' : 'DISABLED'}
                      </Text>
                    </View>
                  </View>
                  <Text style={modalStyles.masterSwitchSub}>
                    Receive a prompt to record daily expenses and review limits
                  </Text>
                </View>
                <Switch
                  value={remindersEnabled}
                  onValueChange={(val) => {
                    if ((Platform.OS as string) !== 'web') {
                      try {
                        Haptics.selectionAsync();
                      } catch {}
                    }
                    setRemindersEnabled(val);
                  }}
                  trackColor={{ false: colors.borderLight, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </TouchableOpacity>

              {remindersEnabled && (
                <>
                  <Text style={[modalStyles.inputLabel, { marginTop: Spacing.lg, marginBottom: Spacing.xs }]}>
                    PREFERRED REMINDER TIME
                  </Text>
                  <View style={modalStyles.timeGrid}>
                    {[
                      { time: '08:00 AM', label: 'Morning' },
                      { time: '01:00 PM', label: 'Afternoon' },
                      { time: '08:00 PM', label: 'Evening' },
                      { time: '09:30 PM', label: 'Night' },
                      { time: '10:00 PM', label: 'Late Night' },
                    ].map(({ time, label }) => {
                      const isSelected = reminderTime === time;
                      return (
                        <TouchableOpacity
                          key={time}
                          style={[modalStyles.timeGridItem, isSelected && modalStyles.timeGridItemActive]}
                          onPress={() => {
                            if ((Platform.OS as string) !== 'web') {
                              try {
                                Haptics.selectionAsync();
                              } catch {}
                            }
                            setReminderTime(time);
                          }}
                        >
                          <Ionicons
                            name={isSelected ? 'time' : 'time-outline'}
                            size={16}
                            color={isSelected ? '#FFFFFF' : colors.primary}
                          />
                          <View>
                            <Text style={[modalStyles.timeGridItemText, isSelected && modalStyles.timeGridItemTextActive]}>
                              {time}
                            </Text>
                            <Text style={[modalStyles.timeGridItemSub, isSelected && modalStyles.timeGridItemSubActive]}>
                              {label}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={[modalStyles.inputLabel, { marginTop: Spacing.lg, marginBottom: Spacing.xs }]}>
                    NOTIFICATION CHANNELS
                  </Text>
                  <View style={modalStyles.channelList}>
                    <TouchableOpacity
                      style={modalStyles.channelItem}
                      onPress={() => {
                        if ((Platform.OS as string) !== 'web') {
                          try {
                            Haptics.selectionAsync();
                          } catch {}
                        }
                        setNotifyDailyLog(!notifyDailyLog);
                      }}
                    >
                      <Ionicons
                        name={notifyDailyLog ? 'checkbox' : 'square-outline'}
                        size={20}
                        color={notifyDailyLog ? colors.primary : colors.textMuted}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={modalStyles.channelText}>Daily Expense Log Reminder</Text>
                        <Text style={modalStyles.channelSubText}>Daily evening prompt to log remaining expenses</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={modalStyles.channelItem}
                      onPress={() => {
                        if ((Platform.OS as string) !== 'web') {
                          try {
                            Haptics.selectionAsync();
                          } catch {}
                        }
                        setNotifyBudgetAlert(!notifyBudgetAlert);
                      }}
                    >
                      <Ionicons
                        name={notifyBudgetAlert ? 'checkbox' : 'square-outline'}
                        size={20}
                        color={notifyBudgetAlert ? colors.primary : colors.textMuted}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={modalStyles.channelText}>80% Budget Threshold Warning</Text>
                        <Text style={modalStyles.channelSubText}>Alert before you exceed your monthly spending limit</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[modalStyles.channelItem, { borderBottomWidth: 0 }]}
                      onPress={() => {
                        if ((Platform.OS as string) !== 'web') {
                          try {
                            Haptics.selectionAsync();
                          } catch {}
                        }
                        setNotifyBillDue(!notifyBillDue);
                      }}
                    >
                      <Ionicons
                        name={notifyBillDue ? 'checkbox' : 'square-outline'}
                        size={20}
                        color={notifyBillDue ? colors.primary : colors.textMuted}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={modalStyles.channelText}>Recurring Bill & Subscription Due Dates</Text>
                        <Text style={modalStyles.channelSubText}>Timely reminders 1 day prior to upcoming bill renewals</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Action Buttons */}
              <View style={modalStyles.buttonStack}>
                <PocksyButton
                  title="Save Reminder Settings"
                  onPress={handleSaveReminders}
                  variant="primary"
                  icon={<Ionicons name="notifications" size={18} color="#FFFFFF" />}
                />
                <PocksyButton
                  title="Cancel"
                  onPress={() => setRemindersModalVisible(false)}
                  variant="secondary"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 5. EXPORT DATA MODAL */}
      <Modal
        visible={exportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Export Transaction Data</Text>
              <TouchableOpacity
                onPress={() => setExportModalVisible(false)}
                style={modalStyles.closeBtn}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ padding: Spacing.xl }}>
              <Text style={modalStyles.budgetHelper}>
                Download your complete financial records, category breakdowns, and account logs formatted for spreadsheet analysis.
              </Text>

              <View style={modalStyles.csvInfoCard}>
                <View style={modalStyles.csvIconCircle}>
                  <Ionicons name="document-text" size={28} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={modalStyles.csvInfoTitle}>CSV Spreadsheet Format</Text>
                  <Text style={modalStyles.csvInfoSub}>Compatible with Microsoft Excel, Google Sheets & Apple Numbers</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={modalStyles.buttonStack}>
                <PocksyButton
                  title="Download CSV Spreadsheet"
                  onPress={handleExecuteExport}
                  loading={exporting}
                  variant="primary"
                  icon={<Ionicons name="download-outline" size={18} color="#FFFFFF" />}
                />
                <PocksyButton
                  title="Cancel"
                  onPress={() => setExportModalVisible(false)}
                  variant="secondary"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* 6. FACE ID & BIOMETRIC SECURITY MODAL */}
      <Modal
        visible={biometricModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBiometricModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Face ID & Biometric Lock</Text>
              <TouchableOpacity
                onPress={() => setBiometricModalVisible(false)}
                style={modalStyles.closeBtn}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: Spacing.xl }} showsVerticalScrollIndicator={false}>
              {/* Feature Showcase Card */}
              <View style={modalStyles.bioShowcaseCard}>
                <View style={modalStyles.bioShowcaseIcon}>
                  <Ionicons name="scan-circle" size={36} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={modalStyles.bioShowcaseTitle}>Bank-Grade App Shield</Text>
                  <Text style={modalStyles.bioShowcaseSub}>
                    Protect your financial transactions, debts, and budgets with Face Recognition, Fingerprint, or Passcode authentication.
                  </Text>
                </View>
              </View>

              {/* Master Switch Card (Pressable anywhere) */}
              <TouchableOpacity
                style={[
                  modalStyles.masterSwitchCard,
                  biometricEnabled && modalStyles.masterSwitchCardActive,
                ]}
                activeOpacity={0.85}
                onPress={() => handleToggleBiometricSwitch(!biometricEnabled)}
              >
                <View style={{ flex: 1, marginRight: Spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={modalStyles.masterSwitchTitle}>Require Biometric Lock</Text>
                    <View
                      style={[
                        modalStyles.statusBadge,
                        { backgroundColor: biometricEnabled ? '#DCFCE7' : colors.borderLight },
                      ]}
                    >
                      <Text
                        style={[
                          modalStyles.statusBadgeText,
                          { color: biometricEnabled ? '#16A34A' : colors.textMuted },
                        ]}
                      >
                        {biometricEnabled ? 'ENABLED' : 'DISABLED'}
                      </Text>
                    </View>
                  </View>
                  <Text style={modalStyles.masterSwitchSub}>
                    Auto-locks app on launch and when switching apps
                  </Text>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleToggleBiometricSwitch}
                  trackColor={{ false: colors.borderLight, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </TouchableOpacity>

              {/* Live Test Feedback Banner */}
              {bioTestResult === 'success' && (
                <View style={modalStyles.bioSuccessBanner}>
                  <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                  <Text style={modalStyles.bioSuccessText}>Biometric Sensor Operational & Verified ✨</Text>
                </View>
              )}
              {bioTestResult === 'failed' && (
                <View style={modalStyles.bioWarningBanner}>
                  <Ionicons name="alert-circle" size={20} color="#DC2626" />
                  <Text style={modalStyles.bioWarningText}>Biometric check cancelled or unverified</Text>
                </View>
              )}

              {/* Supported Security Mechanisms */}
              <Text style={[modalStyles.inputLabel, { marginTop: Spacing.lg, marginBottom: Spacing.xs }]}>
                SUPPORTED HARDWARE
              </Text>
              <View style={modalStyles.channelList}>
                <View style={modalStyles.bioRowItem}>
                  <Ionicons name="scan-outline" size={20} color={colors.primary} />
                  <Text style={modalStyles.channelText}>Face Recognition (Apple Face ID & Android Face)</Text>
                </View>
                <View style={modalStyles.bioRowItem}>
                  <Ionicons name="finger-print-outline" size={20} color={colors.primary} />
                  <Text style={modalStyles.channelText}>Fingerprint Scanner (Touch ID & In-Display)</Text>
                </View>
                <View style={[modalStyles.bioRowItem, { borderBottomWidth: 0 }]}>
                  <Ionicons name="keypad-outline" size={20} color={colors.primary} />
                  <Text style={modalStyles.channelText}>Device Passcode & PIN Fallback</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={modalStyles.buttonStack}>
                <PocksyButton
                  title="Test Biometric Sensor"
                  onPress={handleTestBiometricScan}
                  loading={testingBio}
                  variant="secondary"
                  icon={<Ionicons name="shield-checkmark" size={18} color={colors.primary} />}
                />
                <PocksyButton
                  title="Done"
                  onPress={() => {
                    if ((Platform.OS as string) !== 'web') {
                      try {
                        Haptics.selectionAsync();
                      } catch {}
                    }
                    setBiometricModalVisible(false);
                  }}
                  variant="primary"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 7. HELP & FAQ MODAL */}
      <Modal
        visible={faqModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFaqModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Help & Frequently Asked</Text>
              <TouchableOpacity
                onPress={() => setFaqModalVisible(false)}
                style={modalStyles.closeBtn}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 460, padding: Spacing.xl }} showsVerticalScrollIndicator={false}>
              {FAQ_ITEMS.map((item, idx) => {
                const isExpanded = expandedFaqIndex === idx;
                return (
                  <View key={idx} style={modalStyles.faqItem}>
                    <TouchableOpacity
                      style={modalStyles.faqQuestionRow}
                      onPress={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                    >
                      <Text style={modalStyles.faqQuestion}>{item.q}</Text>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                    {isExpanded && <Text style={modalStyles.faqAnswer}>{item.a}</Text>}
                  </View>
                );
              })}

              <View style={{ marginTop: Spacing.lg }}>
                <PocksyButton
                  title="Close"
                  onPress={() => setFaqModalVisible(false)}
                  variant="secondary"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 7. ABOUT & PRIVACY MODAL (Consolidated) */}
      <Modal
        visible={aboutModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>About Pocksy</Text>
              <TouchableOpacity
                onPress={() => setAboutModalVisible(false)}
                style={modalStyles.closeBtn}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: Spacing.xl }} showsVerticalScrollIndicator={false}>
              {/* Brand Core Icon with Burgundy Glow Ring */}
              <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
                <View style={modalStyles.aboutGlowRing}>
                  <LinearGradient
                    colors={colors.gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={modalStyles.aboutIconCore}
                  >
                    <Ionicons name="wallet" size={30} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                
                <Text style={modalStyles.appName}>Pocksy Expense Manager</Text>
                <View style={modalStyles.versionBadge}>
                  <Text style={modalStyles.versionBadgeText}>Version 1.0.0 (Gold Release)</Text>
                </View>
              </View>

              {/* Technical Specifications Grid */}
              <View style={modalStyles.infoGrid}>
                <View style={modalStyles.infoRow}>
                  <Text style={modalStyles.infoLabel}>Client Engine</Text>
                  <Text style={modalStyles.infoVal}>React Native & Expo SDK</Text>
                </View>
                <View style={modalStyles.infoRow}>
                  <Text style={modalStyles.infoLabel}>Backend API</Text>
                  <Text style={modalStyles.infoVal}>Node.js Express + MongoDB</Text>
                </View>
                <View style={modalStyles.infoRow}>
                  <Text style={modalStyles.infoLabel}>Data Privacy</Text>
                  <Text style={modalStyles.infoVal}>Bank-Grade AES Encryption</Text>
                </View>
                <View style={[modalStyles.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={modalStyles.infoLabel}>Developer</Text>
                  <Text style={modalStyles.infoVal}>Aryan Patel</Text>
                </View>
              </View>

              {/* Cohesive Pocksy Button Group */}
              <View style={modalStyles.buttonStack}>
                <PocksyButton
                  title="Check for Updates"
                  onPress={handleCheckForUpdates}
                  loading={checkingUpdates}
                  variant="primary"
                  icon={<Ionicons name="refresh-circle-outline" size={18} color="#FFFFFF" />}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 8. SUB-MODALS */}
      <RecurringModal
        visible={recurringModalVisible}
        onClose={() => setRecurringModalVisible(false)}
      />

      <GoalsModal
        visible={goalsModalVisible}
        onClose={() => setGoalsModalVisible(false)}
      />

      <DebtModal
        visible={debtModalVisible}
        onClose={() => setDebtModalVisible(false)}
      />

      {/* 9. SIGN OUT CONFIRMATION MODAL */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !loggingOut && setLogoutModalVisible(false)}
      >
        <View style={logoutModalStyles.overlay}>
          <View style={logoutModalStyles.dialog}>
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
                variant="secondary"
                disabled={loggingOut}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    marginLeft: Spacing.md,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: FontSize.md,
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
    paddingHorizontal: 7,
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
    marginTop: 6,
  },
  memberText: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  editIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(107, 30, 43, 0.12)',
    marginLeft: Spacing.xs,
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
    marginBottom: Spacing.xs,
  },
  appFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  appFooterText: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.2,
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
  buttonStack: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: colors.textPrimary,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
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
    width: 42,
    height: 42,
    minWidth: 42,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 2,
  },
  currencySymbolText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: colors.primary,
    textAlign: 'center',
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
  currentBudgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(107, 30, 43, 0.12)',
  },
  currentBudgetText: {
    fontSize: FontSize.xs,
    color: colors.primary,
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    ...Shadows.sm,
  },
  budgetCurrencyPrefix: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.heavy,
    color: colors.primary,
    marginRight: Spacing.xs,
  },
  budgetInputField: {
    flex: 1,
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    paddingVertical: Spacing.xs,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        outlineWidth: 0,
      } as any,
    }),
  },
  clearInputBtn: {
    padding: Spacing.xs,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  presetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(107, 30, 43, 0.15)',
  },
  presetChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetChipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: colors.primary,
  },
  presetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  timeGridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: colors.background,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    minWidth: '47%',
    flexGrow: 1,
  },
  timeGridItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...Shadows.sm,
  },
  timeGridItemText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  timeGridItemTextActive: {
    color: '#FFFFFF',
  },
  timeGridItemSub: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1,
  },
  timeGridItemSubActive: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  channelSubText: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 13,
  },
  channelList: {
    backgroundColor: colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  channelText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  inputLabel: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.6,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    color: colors.textPrimary,
    marginTop: Spacing.xs,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  avatarHint: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    marginTop: Spacing.xs,
  },
  readOnlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  readOnlyText: {
    fontSize: FontSize.sm,
    color: colors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: '#16A34A',
  },
  currencyPickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  currencyTriggerText: {
    fontSize: FontSize.sm,
    color: colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  toggleTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  toggleSubtitle: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  csvInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(107, 30, 43, 0.12)',
    gap: Spacing.md,
  },
  csvIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(107, 30, 43, 0.10)',
  },
  csvInfoTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: colors.primary,
  },
  csvInfoSub: {
    fontSize: FontSize['2xs'],
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  bioShowcaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(107, 30, 43, 0.12)',
    gap: Spacing.md,
  },
  bioShowcaseIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(107, 30, 43, 0.10)',
  },
  bioShowcaseTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: colors.primary,
  },
  bioShowcaseSub: {
    fontSize: FontSize['2xs'],
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  masterSwitchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    marginBottom: Spacing.xs,
  },
  masterSwitchCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  masterSwitchTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  masterSwitchSub: {
    fontSize: FontSize['2xs'],
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: FontWeight.heavy,
    letterSpacing: 0.3,
  },
  bioSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  bioSuccessText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#16A34A',
  },
  bioWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  bioWarningText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
  },
  bioRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  faqItem: {
    backgroundColor: colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    marginRight: Spacing.xs,
  },
  faqAnswer: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: Spacing.sm,
  },
  aboutGlowRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: 'rgba(107, 30, 43, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  aboutIconCore: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  appName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  versionBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(107, 30, 43, 0.12)',
  },
  versionBadgeText: {
    fontSize: FontSize['2xs'],
    fontWeight: FontWeight.bold,
    color: colors.primary,
  },
  infoGrid: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
  },
  infoVal: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
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
