/**
 * Settings Screen
 *
 * Comprehensive app settings including Azan preferences, notifications, and more.
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Card,
  Title,
  List,
  Switch,
  Button,
  Divider,
  TextInput,
} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {useAuth} from '@context/AuthContext';
import {spacing, typography, colors, elevation} from '@constants/theme';
import {azanService, AzanVoice} from '@services/azan/azanService';
import {prisma} from '@services/database/prismaClient';

export const SettingsScreen: React.FC = () => {
  const {currentTheme, isDark, toggleTheme} = useTheme();
  const {user} = useAuth();
  const [azanVoice, setAzanVoice] = useState<AzanVoice>('makkah');
  const [azanVolume, setAzanVolume] = useState(80);
  const [azanFadeIn, setAzanFadeIn] = useState(true);
  const [azanDndOverride, setAzanDndOverride] = useState(false);
  const [azanVibration, setAzanVibration] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const settings = await prisma.userSettings.findUnique({
        where: {userId: user.id},
      });

      if (settings) {
        setAzanVoice(settings.azanVoice as AzanVoice);
        setAzanVolume(settings.azanVolume);
        setAzanFadeIn(settings.azanFadeIn);
        setAzanDndOverride(settings.azanDndOverride);
        setAzanVibration(settings.azanVibration);
        setNotificationsEnabled(settings.notificationEnabled);

        // Update service config
        azanService.updateConfig({
          voice: settings.azanVoice as AzanVoice,
          volume: settings.azanVolume,
          fadeIn: settings.azanFadeIn,
          dndOverride: settings.azanDndOverride,
          vibration: settings.azanVibration,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await prisma.userSettings.update({
        where: {userId: user.id},
        data: {
          azanVoice,
          azanVolume,
          azanFadeIn,
          azanDndOverride,
          azanVibration,
          notificationEnabled: notificationsEnabled,
        },
      });

      // Update service config
      azanService.updateConfig({
        voice: azanVoice,
        volume: azanVolume,
        fadeIn: azanFadeIn,
        dndOverride: azanDndOverride,
        vibration: azanVibration,
      });

      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const AZAN_VOICES: Array<{value: AzanVoice; label: string}> = [
    {value: 'makkah', label: 'Makkah'},
    {value: 'madinah', label: 'Madinah'},
    {value: 'qatami', label: 'Al-Qatami'},
    {value: 'alafasy', label: 'Alafasy'},
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: currentTheme.colors.text}]}>
            Settings
          </Text>
        </View>

        {/* Azan Settings */}
        <Card style={[styles.card, elevation[2]]}>
          <Card.Content>
            <Title>Azan Settings</Title>

            <List.Item
              title="Azan Voice"
              description="Select preferred Azan voice"
              left={props => <List.Icon {...props} icon="account-voice" />}
            />
            <View style={styles.voiceOptions}>
              {AZAN_VOICES.map(voice => (
                <Button
                  key={voice.value}
                  mode={azanVoice === voice.value ? 'contained' : 'outlined'}
                  onPress={() => setAzanVoice(voice.value)}
                  style={styles.voiceButton}
                  compact>
                  {voice.label}
                </Button>
              ))}
            </View>

            <Divider style={styles.divider} />

            <List.Item
              title="Volume"
              description={`${azanVolume}%`}
              left={props => <List.Icon {...props} icon="volume-high" />}
            />
            <View style={styles.sliderContainer}>
              <View style={styles.volumeBar}>
                <View
                  style={[
                    styles.volumeFill,
                    {
                      width: `${azanVolume}%`,
                      backgroundColor: currentTheme.colors.primary,
                    },
                  ]}
                />
              </View>
              <View style={styles.volumeControls}>
                <Button
                  icon="volume-minus"
                  onPress={() => setAzanVolume(Math.max(0, azanVolume - 10))}
                  compact>
                  -
                </Button>
                <Text style={[styles.volumeText, {color: currentTheme.colors.text}]}>
                  {azanVolume}%
                </Text>
                <Button
                  icon="volume-plus"
                  onPress={() => setAzanVolume(Math.min(100, azanVolume + 10))}
                  compact>
                  +
                </Button>
              </View>
            </View>

            <Divider style={styles.divider} />

            <List.Item
              title="Fade In"
              description="Gradually increase volume when playing"
              left={props => <List.Icon {...props} icon="volume-plus" />}
              right={() => (
                <Switch value={azanFadeIn} onValueChange={setAzanFadeIn} />
              )}
            />
            <Divider />
            <List.Item
              title="Do Not Disturb Override"
              description="Play Azan even when DND is enabled"
              left={props => <List.Icon {...props} icon="bell-ring" />}
              right={() => (
                <Switch value={azanDndOverride} onValueChange={setAzanDndOverride} />
              )}
            />
            <Divider />
            <List.Item
              title="Vibration"
              description="Vibrate when Azan plays"
              left={props => <List.Icon {...props} icon="vibrate" />}
              right={() => (
                <Switch value={azanVibration} onValueChange={setAzanVibration} />
              )}
            />
          </Card.Content>
        </Card>

        {/* Notification Settings */}
        <Card style={[styles.card, elevation[2]]}>
          <Card.Content>
            <Title>Notifications</Title>
            <List.Item
              title="Enable Notifications"
              description="Receive prayer time notifications"
              left={props => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Appearance Settings */}
        <Card style={[styles.card, elevation[2]]}>
          <Card.Content>
            <Title>Appearance</Title>
            <List.Item
              title="Dark Mode"
              description="Toggle dark theme"
              left={props => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch value={isDark} onValueChange={toggleTheme} />
              )}
            />
          </Card.Content>
        </Card>

        {/* Save Button */}
        <Button
          mode="contained"
          onPress={saveSettings}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}>
          Save Settings
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.paper,
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
  card: {
    marginBottom: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface.main,
  },
  voiceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  voiceButton: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  divider: {
    marginVertical: spacing.sm,
  },
  sliderContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  volumeBar: {
    height: 8,
    backgroundColor: colors.surface.dark,
    borderRadius: 4,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    borderRadius: 4,
  },
  volumeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeText: {
    ...typography.body1,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  saveButtonContent: {
    paddingVertical: spacing.sm,
  },
});

