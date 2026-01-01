/**
 * Register Screen
 *
 * User registration interface.
 */

import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TextInput, Button, Card, Divider} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '@context/ThemeContext';
import {useAuth} from '@context/AuthContext';
import {spacing, typography, colors, elevation} from '@constants/theme';
import {useNavigation} from '@react-navigation/native';

export const RegisterScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const {register, loading} = useAuth();
  // TODO: Re-enable Google Sign-In after configuration
  // const {register, loginWithGoogle, loading} = useAuth();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = await register(email, password, displayName || undefined);
    if (!result.success) {
      setError(result.error || 'Registration failed');
    }
    // Navigation will be handled by AppNavigator based on auth state
  };

  // TODO: Re-enable Google Sign-In after configuration
  // const handleGoogleSignIn = async () => {
  //   setError(null);
  //   const result = await loginWithGoogle();
  //   if (!result.success) {
  //     setError(result.error || 'Google sign in failed');
  //   }
  //   // Navigation will be handled by AppNavigator based on auth state
  // };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.title, {color: currentTheme.colors.text}]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, {color: currentTheme.colors.text}]}>
              Start your journey with Salah Companion
            </Text>
          </View>

          <Card style={[styles.card, elevation[2]]}>
            <Card.Content style={styles.cardContent}>
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={[styles.errorText, {color: currentTheme.colors.error}]}>
                    {error}
                  </Text>
                </View>
              )}

              <TextInput
                label="Display Name (Optional)"
                value={displayName}
                onChangeText={setDisplayName}
                mode="outlined"
                autoCapitalize="words"
                style={styles.input}
                disabled={loading}
              />

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
                disabled={loading}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                disabled={loading}
              />

              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                style={styles.input}
                disabled={loading}
              />

              <Button
                mode="contained"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={styles.registerButton}
                contentStyle={styles.registerButtonContent}>
                Create Account
              </Button>

              {/* TODO: Re-enable Google Sign-In after configuration */}
              {/* <View style={styles.dividerContainer}>
                <Divider style={styles.divider} />
                <Text style={[styles.dividerText, {color: currentTheme.colors.text}]}>OR</Text>
                <Divider style={styles.divider} />
              </View>

              <Button
                mode="outlined"
                onPress={handleGoogleSignIn}
                loading={loading}
                disabled={loading}
                style={styles.googleButton}
                contentStyle={styles.googleButtonContent}
                icon={() => (
                  <MaterialCommunityIcons name="google" size={20} color={colors.primary.main} />
                )}>
                Sign up with Google
              </Button> */}

              <View style={styles.loginLink}>
                <Text style={[styles.loginText, {color: currentTheme.colors.text}]}>
                  Already have an account?{' '}
                </Text>
                <Button
                  mode="text"
                  onPress={() => (navigation as any).navigate('Login')}
                  disabled={loading}>
                  Sign In
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.paper,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    opacity: 0.7,
  },
  card: {
    borderRadius: 12,
    backgroundColor: colors.surface.main,
  },
  cardContent: {
    padding: spacing.lg,
  },
  errorContainer: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.error.light + '20',
    borderRadius: 8,
  },
  errorText: {
    ...typography.body2,
    textAlign: 'center',
  },
  input: {
    marginBottom: spacing.md,
  },
  registerButton: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  registerButtonContent: {
    paddingVertical: spacing.sm,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  loginText: {
    ...typography.body2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...typography.body2,
    marginHorizontal: spacing.md,
    opacity: 0.5,
  },
  googleButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderColor: colors.primary.main,
  },
  googleButtonContent: {
    paddingVertical: spacing.sm,
  },
});

