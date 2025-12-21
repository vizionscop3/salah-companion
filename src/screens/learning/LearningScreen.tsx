/**
 * Learning Screen
 *
 * Access to learning modules: Arabic Pronunciation, Recitation Practice, etc.
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Title, Paragraph, Button} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography} from '@constants/theme';
import {useNavigation} from '@react-navigation/native';

export const LearningScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const navigation = useNavigation();

  const learningModules = [
    {
      title: 'Guided Prayer',
      description: 'Step-by-step guidance through each prayer',
      progress: 0,
      type: 'guided',
    },
    {
      title: 'Arabic Pronunciation Academy',
      description: 'Learn Arabic letters and sounds systematically',
      progress: 0,
      type: 'pronunciation',
    },
    {
      title: 'Recitation Practice',
      description: 'Practice recitation with AI-powered feedback',
      progress: 0,
      type: 'recitation',
    },
    {
      title: 'Surah Library',
      description: 'Explore surahs with translations and audio',
      progress: 0,
      type: 'surah',
    },
    {
      title: 'Azan Education',
      description: 'Learn the meaning and response to Azan',
      progress: 0,
      type: 'azan',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: currentTheme.colors.text}]}>
            Learning Center
          </Text>
          <Text style={[styles.subtitle, {color: currentTheme.colors.text}]}>
            Build understanding and connection
          </Text>
        </View>

        {learningModules.map((module, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <Title>{module.title}</Title>
              <Paragraph>{module.description}</Paragraph>
              <Button
                mode="contained"
                onPress={() => {
                  if (module.type === 'guided') {
                    (navigation as any).navigate('GuidedSalah', {
                      prayer: 'fajr',
                    });
                  } else if (module.type === 'pronunciation') {
                    (navigation as any).navigate('PronunciationAcademy');
                  } else if (module.type === 'recitation') {
                    (navigation as any).navigate('RecitationPractice');
                  } else {
                    // Other modules - to be implemented
                    console.log('Opening:', module.type);
                  }
                }}
                style={styles.button}
                contentStyle={styles.buttonContent}>
                Start Learning
              </Button>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
    marginBottom: spacing.md,
    elevation: 2,
  },
  button: {
    marginTop: spacing.md,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
});

