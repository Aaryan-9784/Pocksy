/**
 * Pocksy Forgot Password Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { PocksyButton, PocksyInput } from '@/components/ui';

const colors = Colors.light;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = (): boolean => {
    if (!email.trim()) {
      setError('Email is required.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSendReset = async () => {
    if (!validate()) return;

    setLoading(true);
    // API wiring comes in Phase 3
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.branding}>
          <Text style={styles.iconLarge}>🔒</Text>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you instructions to reset your password.
          </Text>
        </View>

        {sent ? (
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Email Sent!</Text>
            <Text style={styles.successMessage}>
              We've sent password reset instructions to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
            <View style={styles.buttonContainer}>
              <PocksyButton
                title="Back to Login"
                onPress={() => router.back()}
              />
            </View>
          </View>
        ) : (
          <View style={styles.form}>
            <PocksyInput
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              error={error}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <View style={styles.buttonContainer}>
              <PocksyButton
                title="Send Reset Link"
                onPress={handleSendReset}
                loading={loading}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  backButton: {
    marginTop: Spacing.base,
    marginBottom: Spacing.xl,
  },
  backText: {
    fontSize: FontSize.base,
    color: colors.primary,
    fontWeight: FontWeight.medium,
  },
  branding: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  iconLarge: {
    fontSize: 48,
    marginBottom: Spacing.base,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {},
  buttonContainer: {
    marginTop: Spacing.sm,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  successIcon: {
    fontSize: 48,
    marginBottom: Spacing.base,
  },
  successTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  successMessage: {
    fontSize: FontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  emailHighlight: {
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
});
