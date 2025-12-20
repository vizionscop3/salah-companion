/**
 * Login Screen
 *
 * User login interface with email and password.
 */

import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TextInput, Button, Card, Title, Paragraph} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {useAuth} from '@context/AuthContext';
import {spacing, typography, colors, elevation} from '@constants/theme';
import {useNavigation} from '@react-navigation/native';

export const LoginScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const {login, loading} = useAuth();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    // Navigation will be handled by AppNavigator based on auth state
  };

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
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, {color: currentTheme.colors.text}]}>
              Sign in to continue your journey
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
                autoComplete="password"
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                disabled={loading}
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                contentStyle={styles.loginButtonContent}>
                Sign In
              </Button>

              <View style={styles.registerLink}>
                <Text style={[styles.registerText, {color: currentTheme.colors.text}]}>
                  Don't have an account?{' '}
                </Text>
                <Button
                  mode="text"
                  onPress={() => (navigation as any).navigate('Register')}
                  disabled={loading}>
                  Sign Up
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
  loginButton: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  loginButtonContent: {
    paddingVertical: spacing.sm,
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  registerText: {
    ...typography.body2,
  },
});

