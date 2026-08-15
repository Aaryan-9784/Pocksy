/**
 * Pocksy Forgot Password Screen
 * Clean recovery flow with vector icons and card layout
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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/constants/theme';
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
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.branding}>
          <LinearGradient
            colors={colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconCircle}
          >
            <Ionicons name="key" size={28} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your registered email address and we'll send you instructions to reset your password.
          </Text>
        </View>

        {sent ? (
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={32} color="#16A34A" />
            </View>
            <Text style={styles.successTitle}>Check Your Inbox</Text>
            <Text style={styles.successMessage}>
              Password reset link has been dispatched to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
            <View style={styles.buttonContainer}>
              <PocksyButton
                title="Back to Sign In"
                onPress={() => router.back()}
              />
            </View>
          </View>
        ) : (
          <View style={styles.formCard}>
            <PocksyInput
              label="EMAIL ADDRESS"
              placeholder="your@email.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              error={error}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textSecondary} />}
            />

            <View style={styles.buttonContainer}>
              <PocksyButton
                title="Send Reset Link"
                onPress={handleSendReset}
                loading={loading}
                icon={<Ionicons name="send-outline" size={18} color="#FFFFFF" />}
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
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  branding: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.glow,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.base,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.md,
  },
  buttonContainer: {
    marginTop: Spacing.md,
  },
  successCard: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.md,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  successTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  successMessage: {
    fontSize: FontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  emailHighlight: {
    fontWeight: FontWeight.bold,
    color: colors.primary,
  },
});

