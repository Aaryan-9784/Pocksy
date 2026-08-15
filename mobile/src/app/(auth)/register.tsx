/**
 * Pocksy Register Screen
 * High-conversion sign up screen with gradient logo and vector inputs
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
import { useAuthStore } from '@/store/authStore';

const colors = Colors.light;

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const register = useAuthStore((s) => s.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
      });
    } catch (err: any) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
        {/* Branding */}
        <View style={styles.branding}>
          <LinearGradient
            colors={colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoContainer}
          >
            <Ionicons name="sparkles" size={30} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.appName}>Create Account</Text>
          <Text style={styles.tagline}>Start mastering your finances today</Text>
        </View>

        {/* API Error Banner */}
        {apiError ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorBannerText}>{apiError}</Text>
          </View>
        ) : null}

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Get Started with Pocksy</Text>
          <Text style={styles.formSubtitle}>Enter your details below to create your account</Text>

          <PocksyInput
            label="FULL NAME"
            placeholder="John Doe"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={errors.name}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            leftIcon={<Ionicons name="person-outline" size={18} color={colors.textSecondary} />}
          />

          <PocksyInput
            label="EMAIL ADDRESS"
            placeholder="name@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors((prev) => ({ ...prev, email: '' }));
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textSecondary} />}
          />

          <PocksyInput
            label="PASSWORD"
            placeholder="Minimum 8 characters"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors((prev) => ({ ...prev, password: '' }));
            }}
            error={errors.password}
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            textContentType="newPassword"
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />}
            rightIcon={
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.textMuted}
              />
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <PocksyInput
            label="CONFIRM PASSWORD"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            error={errors.confirmPassword}
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            leftIcon={<Ionicons name="shield-checkmark-outline" size={18} color={colors.textSecondary} />}
          />

          <View style={styles.buttonContainer}>
            <PocksyButton
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              icon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
            />
          </View>
        </View>

        {/* Login link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
  branding: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.glow,
  },
  appName: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.dangerLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: colors.danger + '30',
  },
  errorBannerText: {
    color: colors.danger,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  formTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  formSubtitle: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  buttonContainer: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.base,
  },
  footerText: {
    fontSize: FontSize.sm,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: FontSize.sm,
    color: colors.primary,
    fontWeight: FontWeight.bold,
  },
});

