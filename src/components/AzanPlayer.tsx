/**
 * Azan Player Component
 *
 * Audio player component for Azan playback with controls,
 * volume adjustment, and voice selection.
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Card, Button, IconButton, Chip} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors, elevation} from '@constants/theme';
import {azanService, AzanVoice} from '@services/azan/azanService';

export interface AzanPlayerProps {
  prayerName?: string;
  autoPlay?: boolean;
  onComplete?: () => void;
}

const AZAN_VOICES: Array<{value: AzanVoice; label: string; description: string}> = [
  {value: 'makkah', label: 'Makkah', description: 'Grand Mosque, Makkah'},
  {value: 'madinah', label: 'Madinah', description: 'Prophet\'s Mosque, Madinah'},
  {value: 'qatami', label: 'Al-Qatami', description: 'Classic recitation'},
  {value: 'alafasy', label: 'Alafasy', description: 'Modern recitation'},
];

export const AzanPlayer: React.FC<AzanPlayerProps> = ({
  prayerName,
  autoPlay = false,
  onComplete,
}) => {
  const {currentTheme} = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<AzanVoice>('makkah');
  const [volume, setVolume] = useState(80);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-play if requested
    if (autoPlay && !isPlaying) {
      handlePlay();
    }

    // Cleanup on unmount
    return () => {
      azanService.stopAzan();
    };
  }, [autoPlay]);

  const handlePlay = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsPlaying(true);

      await azanService.playAzan(selectedVoice, volume);

      setIsPlaying(false);
      setIsLoading(false);
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Error playing Azan:', err);
      setError('Failed to play Azan. Please check audio files.');
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    azanService.stopAzan();
    setIsPlaying(false);
    setError(null);
  };

  const handleVoiceChange = (voice: AzanVoice) => {
    setSelectedVoice(voice);
    // Update service config
    azanService.updateConfig({voice});
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    azanService.updateConfig({volume: newVolume});
  };

  return (
    <Card style={[styles.card, elevation[2]]}>
      <Card.Content style={styles.content}>
        {prayerName && (
          <View style={styles.header}>
            <Text style={[styles.title, {color: currentTheme.colors.text}]}>
              Azan - {prayerName}
            </Text>
          </View>
        )}

        {/* Voice Selection */}
        <View style={styles.voiceSection}>
          <Text style={[styles.sectionTitle, {color: currentTheme.colors.text}]}>
            Select Voice
          </Text>
          <View style={styles.voiceChips}>
            {AZAN_VOICES.map((voice) => (
              <Chip
                key={voice.value}
                selected={selectedVoice === voice.value}
                onPress={() => handleVoiceChange(voice.value)}
                style={styles.voiceChip}
                selectedColor={currentTheme.colors.primary}>
                {voice.label}
              </Chip>
            ))}
          </View>
        </View>

        {/* Volume Control */}
        <View style={styles.volumeSection}>
          <Text style={[styles.sectionTitle, {color: currentTheme.colors.text}]}>
            Volume: {volume}%
          </Text>
          <View style={styles.volumeControls}>
            <IconButton
              icon="volume-minus"
              size={24}
              onPress={() => handleVolumeChange(Math.max(0, volume - 10))}
              disabled={volume <= 0}
            />
            <View style={styles.volumeBar}>
              <View
                style={[
                  styles.volumeFill,
                  {
                    width: `${volume}%`,
                    backgroundColor: currentTheme.colors.primary,
                  },
                ]}
              />
            </View>
            <IconButton
              icon="volume-plus"
              size={24}
              onPress={() => handleVolumeChange(Math.min(100, volume + 10))}
              disabled={volume >= 100}
            />
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, {color: currentTheme.colors.error}]}>
              {error}
            </Text>
          </View>
        )}

        {/* Playback Controls */}
        <View style={styles.controls}>
          {isPlaying ? (
            <Button
              mode="contained"
              onPress={handleStop}
              icon="stop"
              style={styles.controlButton}
              contentStyle={styles.controlButtonContent}
              loading={isLoading}>
              Stop
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handlePlay}
              icon="play"
              style={styles.controlButton}
              contentStyle={styles.controlButtonContent}
              loading={isLoading}
              disabled={isLoading}>
              Play Azan
            </Button>
          )}
        </View>

        {/* Azan Text */}
        <View style={styles.azanTextContainer}>
          <Text style={[styles.azanText, {color: currentTheme.colors.text}]}>
            اللهُ أَكْبَر
          </Text>
          <Text style={[styles.azanTransliteration, {color: currentTheme.colors.text}]}>
            Allahu Akbar
          </Text>
          <Text style={[styles.azanTranslation, {color: currentTheme.colors.text}]}>
            Allah is the Greatest
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface.main,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.h4,
    fontWeight: '600',
  },
  voiceSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  voiceChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  voiceChip: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  volumeSection: {
    marginBottom: spacing.lg,
  },
  volumeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  volumeBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surface.dark,
    borderRadius: 4,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    borderRadius: 4,
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
  controls: {
    marginBottom: spacing.lg,
  },
  controlButton: {
    width: '100%',
  },
  controlButtonContent: {
    paddingVertical: spacing.sm,
  },
  azanTextContainer: {
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface.dark,
  },
  azanText: {
    ...typography.h3,
    fontFamily: 'Amiri', // Arabic font
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  azanTransliteration: {
    ...typography.body1,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
    opacity: 0.8,
  },
  azanTranslation: {
    ...typography.body2,
    opacity: 0.7,
  },
});

