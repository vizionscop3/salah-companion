/**
 * Edit Profile Screen
 *
 * Allows users to update their profile information.
 */

import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Card,
  Title,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography} from '@constants/theme';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '@context/AuthContext';
import {islamicShadows, islamicBorderRadius} from '@constants/islamicTheme';
import {LoadingState} from '@components/LoadingState';

export const EditProfileScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const navigation = useNavigation();
  const {user, updateUser} = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
  });

  const handleSave = useCallback(async () => {
    // Validate form
    if (!formData.displayName.trim()) {
      Alert.alert('Validation Error', 'Display name is required');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      
      // Update user profile
      // Note: In production, this would call a backend API
      // For now, we'll update the local auth context
      // Note: Email updates may require separate API endpoint
      await updateUser({
        displayName: formData.displayName.trim() || null,
        // Email updates would need backend support
        // email: formData.email.trim(),
      });

      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, user, updateUser, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Title style={[styles.title, {color: currentTheme.colors.text}]}>
              Edit Profile
            </Title>
            <Text style={[styles.subtitle, {color: currentTheme.colors.text}]}>
              Update your profile information
            </Text>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Display Name *"
                value={formData.displayName}
                onChangeText={text => setFormData({...formData, displayName: text})}
                mode="outlined"
                style={styles.input}
                disabled={loading}
                placeholder="Enter your name"
              />

              <TextInput
                label="Email *"
                value={formData.email}
                onChangeText={text => setFormData({...formData, email: text})}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                disabled={loading}
              />
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
              contentStyle={styles.buttonContent}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                'Save Changes'
              )}
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              contentStyle={styles.buttonContent}
              disabled={loading}>
              Cancel
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body2,
    opacity: 0.7,
  },
  card: {
    marginBottom: spacing.lg,
    elevation: 2,
  },
  input: {
    marginBottom: spacing.md,
  },
  buttonContainer: {
    marginTop: spacing.md,
  },
  saveButton: {
    marginBottom: spacing.md,
    borderRadius: islamicBorderRadius.medium,
    ...islamicShadows.small,
  },
  cancelButton: {
    marginBottom: spacing.lg,
    borderRadius: islamicBorderRadius.medium,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
});
