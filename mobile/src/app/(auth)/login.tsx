/**
 * Pocksy Login Screen
 * High-conversion authentication screen with gradient logo and vector inputs
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

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      await login({ email: email.trim().toLowerCase(), password });
      router.replace('/(tabs)');
    } catch (err: any) {
      setApiError(err.message || 'Login failed. Please verify credentials.');
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
            <Ionicons name="wallet" size={32} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.appName}>Pocksy</Text>
          <Text style={styles.tagline}>Smart Wealth & Expense Tracking</Text>
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
          <Text style={styles.formTitle}>Welcome back</Text>
          <Text style={styles.formSubtitle}>Sign in to access your financial dashboard</Text>

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
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors((prev) => ({ ...prev, password: '' }));
            }}
            error={errors.password}
            secureTextEntry={!showPassword}
            autoComplete="password"
            textContentType="password"
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

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <PocksyButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            icon={<Ionicons name="log-in-outline" size={18} color="#FFFFFF" />}
          />
        </View>

        {/* Register link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Create Account</Text>
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
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  branding: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
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
    marginBottom: Spacing.xl,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: -Spacing.xs,
  },
  forgotPassword: {
    fontSize: FontSize.xs,
    color: colors.primary,
    fontWeight: FontWeight.semibold,
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

