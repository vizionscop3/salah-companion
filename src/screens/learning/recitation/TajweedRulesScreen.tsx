/**
 * Tajweed Rules Screen
 *
 * Displays tajweed rules with color coding, explanations, and examples.
 */

import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Title, Paragraph, Chip} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors} from '@constants/theme';
import {islamicShadows, islamicBorderRadius} from '@constants/islamicTheme';
import {
  getAllTajweedRules,
  TajweedRuleInfo,
  analyzeTajweed,
  formatTextWithTajweed,
} from '@services/recitation/tajweedService';

export const TajweedRulesScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const [selectedRule, setSelectedRule] = useState<TajweedRuleInfo | null>(null);
  const [exampleText] = useState('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');

  const rules = getAllTajweedRules();
  const tajweedAnalysis = analyzeTajweed(exampleText);
  const formattedText = formatTextWithTajweed(exampleText, tajweedAnalysis);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: currentTheme.colors.text}]}>
            Tajweed Rules
          </Text>
          <Text style={[styles.subtitle, {color: currentTheme.colors.text}]}>
            Learn the rules of proper Quranic recitation
          </Text>
        </View>

        {/* Example with Color Coding */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Example: Color-Coded Text</Title>
            <View style={styles.exampleContainer}>
              {formattedText.map((segment, index) => (
                <Text
                  key={index}
                  style={[
                    styles.exampleText,
                    segment.color && {color: segment.color, fontWeight: 'bold'},
                    {color: segment.color || currentTheme.colors.text},
                  ]}>
                  {segment.text}
                </Text>
              ))}
            </View>
            <Paragraph style={styles.exampleNote}>
              Colors indicate different tajweed rules applied to the text
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Rules List */}
        <View style={styles.rulesContainer}>
          {rules.map(rule => (
            <TouchableOpacity
              key={rule.id}
              onPress={() => setSelectedRule(rule)}
              style={styles.ruleCard}>
              <Card
                style={[
                  styles.card,
                  selectedRule?.id === rule.id && {
                    borderWidth: 3,
                    borderColor: rule.color,
                  },
                ]}>
                <Card.Content>
                  <View style={styles.ruleHeader}>
                    <View style={[styles.colorIndicator, {backgroundColor: rule.color}]} />
                    <View style={styles.ruleInfo}>
                      <Title style={styles.ruleName}>{rule.name}</Title>
                      <Text style={[styles.ruleArabic, {color: currentTheme.colors.text}]}>
                        {rule.arabicName}
                      </Text>
                    </View>
                  </View>
                  <Paragraph style={styles.ruleDescription}>{rule.description}</Paragraph>
                  {selectedRule?.id === rule.id && (
                    <View style={styles.ruleDetails}>
                      <Paragraph style={styles.ruleExplanation}>
                        {rule.explanation}
                      </Paragraph>
                      <View style={styles.examplesContainer}>
                        <Text style={[styles.examplesTitle, {color: currentTheme.colors.text}]}>
                          Examples:
                        </Text>
                        {rule.examples.map((example, index) => (
                          <View key={index} style={styles.exampleItem}>
                            <Text style={[styles.exampleArabic, {color: rule.color}]}>
                              {example}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
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
    ...islamicShadows.medium,
    borderRadius: islamicBorderRadius.large,
    backgroundColor: colors.surface.secondary,
  },
  exampleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderRadius: islamicBorderRadius.medium,
  },
  exampleText: {
    ...typography.h4,
    fontSize: 24,
    textAlign: 'right',
    lineHeight: 36,
  },
  exampleNote: {
    ...typography.caption,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  rulesContainer: {
    marginBottom: spacing.lg,
  },
  ruleCard: {
    marginBottom: spacing.md,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border.primary,
  },
  ruleInfo: {
    flex: 1,
  },
  ruleName: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  ruleArabic: {
    ...typography.body1,
    fontSize: 18,
    textAlign: 'right',
  },
  ruleDescription: {
    ...typography.body1,
    marginTop: spacing.xs,
  },
  ruleDetails: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  ruleExplanation: {
    ...typography.body1,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  examplesContainer: {
    marginTop: spacing.sm,
  },
  examplesTitle: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  exampleItem: {
    marginBottom: spacing.xs,
    padding: spacing.xs,
    backgroundColor: colors.background.paper,
    borderRadius: 8,
  },
  exampleArabic: {
    ...typography.body1,
    fontSize: 20,
    textAlign: 'right',
  },
});

