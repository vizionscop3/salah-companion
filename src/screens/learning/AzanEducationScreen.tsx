/**
 * Azan Education Screen
 *
 * Educational content about Azan (Call to Prayer) including meaning, response, and proper conduct.
 */

import React, {useState, useMemo} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Title, Paragraph, Button, Divider} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography} from '@constants/theme';
import {islamicShadows, islamicBorderRadius} from '@constants/islamicTheme';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '@context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AzanPhrase {
  arabic: string;
  transliteration: string;
  translation: string;
  meaning: string;
}

export const AzanEducationScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const navigation = useNavigation();
  const {user} = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Mark education as completed when screen is viewed
  React.useEffect(() => {
    if (user?.id) {
      AsyncStorage.setItem(
        `@salah_companion:azan_education_completed:${user.id}`,
        'true',
      );
    }
  }, [user]);

  const azanPhrases: AzanPhrase[] = [
    {
      arabic: 'الله أكبر',
      transliteration: 'Allahu Akbar',
      translation: 'Allah is the Greatest',
      meaning:
        'Declares the greatness of Allah, reminding us that nothing is greater than our Creator.',
    },
    {
      arabic: 'أشهد أن لا إله إلا الله',
      transliteration: 'Ashhadu an la ilaha illa Allah',
      translation: 'I bear witness that there is no deity except Allah',
      meaning:
        'The declaration of faith (Shahada), affirming the oneness of Allah.',
    },
    {
      arabic: 'أشهد أن محمداً رسول الله',
      transliteration: 'Ashhadu anna Muhammadan rasulu Allah',
      translation: 'I bear witness that Muhammad is the Messenger of Allah',
      meaning:
        'Acknowledging Prophet Muhammad (peace be upon him) as the final messenger.',
    },
    {
      arabic: 'حي على الصلاة',
      transliteration: 'Hayya ala as-Salah',
      translation: 'Come to prayer',
      meaning: 'An invitation to join the congregational prayer.',
    },
    {
      arabic: 'حي على الفلاح',
      transliteration: 'Hayya ala al-Falah',
      translation: 'Come to success',
      meaning:
        'Success in this life and the Hereafter comes through prayer and obedience to Allah.',
    },
    {
      arabic: 'الله أكبر',
      transliteration: 'Allahu Akbar',
      translation: 'Allah is the Greatest',
      meaning: 'Repeated to emphasize the greatness of Allah.',
    },
    {
      arabic: 'لا إله إلا الله',
      transliteration: 'La ilaha illa Allah',
      translation: 'There is no deity except Allah',
      meaning:
        'Final declaration of the oneness of Allah (only in Fajr Azan).',
    },
  ];

  const responsePhrases: {arabic: string; transliteration: string; response: string}[] = [
    {
      arabic: 'الله أكبر',
      transliteration: 'Allahu Akbar',
      response: 'Repeat after the Muadhin',
    },
    {
      arabic: 'أشهد أن لا إله إلا الله',
      transliteration: 'Ashhadu an la ilaha illa Allah',
      response: 'Repeat after the Muadhin',
    },
    {
      arabic: 'أشهد أن محمداً رسول الله',
      transliteration: 'Ashhadu anna Muhammadan rasulu Allah',
      response: 'Repeat after the Muadhin',
    },
    {
      arabic: 'حي على الصلاة',
      transliteration: 'Hayya ala as-Salah',
      response: 'لا حول ولا قوة إلا بالله (La hawla wa la quwwata illa billah)',
    },
    {
      arabic: 'حي على الفلاح',
      transliteration: 'Hayya ala al-Falah',
      response: 'لا حول ولا قوة إلا بالله (La hawla wa la quwwata illa billah)',
    },
    {
      arabic: 'الصلاة خير من النوم',
      transliteration: 'As-Salatu khayrun min an-nawm',
      response: 'صدقت وبررت (Sadaqta wa bararta)',
    },
  ];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: currentTheme.colors.text}]}>
            Azan Education
          </Text>
          <Text style={[styles.subtitle, {color: currentTheme.colors.text}]}>
            Learn the meaning and proper response to the Call to Prayer
          </Text>
        </View>

        {/* Introduction */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>What is Azan?</Title>
            <Paragraph style={styles.paragraph}>
              The Azan (أذان) is the Islamic call to prayer, recited by a
              Muadhin (caller) to announce the time for salah. It is one of the
              most beautiful and spiritually significant sounds in Islam.
            </Paragraph>
            <Paragraph style={styles.paragraph}>
              The Azan serves as a reminder to pause from our daily activities
              and turn our attention to Allah, establishing a connection between
              the worshipper and the Creator.
            </Paragraph>
          </Card.Content>
        </Card>

        {/* History and Significance */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>History and Significance</Title>
            <Paragraph style={styles.paragraph}>
              The Azan was established during the time of Prophet Muhammad (peace be upon him)
              in Madinah, approximately 1-2 years after the Hijrah (migration). The method
              of calling to prayer was revealed to Abdullah ibn Zaid in a dream, which he
              shared with the Prophet. The Prophet confirmed it and instructed Bilal ibn
              Rabah, a freed Abyssinian slave, to become the first Muadhin.
            </Paragraph>
            <Paragraph style={styles.paragraph}>
              <Text style={styles.boldText}>Spiritual Significance:</Text>
            </Paragraph>
            <View style={styles.responseList}>
              <Text style={[styles.listItem, {color: currentTheme.colors.text}]}>
                • The Azan is a declaration of faith and unity
              </Text>
              <Text style={[styles.listItem, {color: currentTheme.colors.text}]}>
                • It calls Muslims to remember their purpose in life
              </Text>
              <Text style={[styles.listItem, {color: currentTheme.colors.text}]}>
                • It serves as a reminder of the five daily prayers
              </Text>
              <Text style={[styles.listItem, {color: currentTheme.colors.text}]}>
                • The Azan is considered a form of worship (Ibadah)
              </Text>
              <Text style={[styles.listItem, {color: currentTheme.colors.text}]}>
                • Responding to the Azan brings great reward
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Azan Phrases */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>The Azan Phrases</Title>
            <Paragraph style={styles.sectionDescription}>
              Each phrase in the Azan has deep meaning and significance:
            </Paragraph>
            {azanPhrases.map((phrase, index) => (
              <View key={index} style={styles.phraseContainer}>
                <View style={styles.arabicContainer}>
                  <Text style={[styles.arabicText, {color: currentTheme.colors.primary}]}>
                    {phrase.arabic}
                  </Text>
                </View>
                <Text style={[styles.transliteration, {color: currentTheme.colors.text}]}>
                  {phrase.transliteration}
                </Text>
                <Text style={[styles.translation, {color: currentTheme.colors.text}]}>
                  {phrase.translation}
                </Text>
                <Text style={[styles.meaning, {color: currentTheme.colors.text}]}>
                  {phrase.meaning}
                </Text>
                {index < azanPhrases.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* How to Respond */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>How to Respond to Azan</Title>
            <Paragraph style={styles.sectionDescription}>
              When you hear the Azan, it is recommended (Sunnah) to:
            </Paragraph>
            <View style={styles.responseList}>
              <Text style={[styles.listItem, {color: currentTheme.colors.text}]}>
                • Stop what you are doing and listen attentively
              </Text>
              <Text style={[styles.listItem, {color: currentTheme.colors.text}]}>
                • Repeat the phrases after the Muadhin
              </Text>
              <Text style={[styles.listItem, {color: currentTheme.colors.text}]}>
                • Say specific responses for certain phrases
              </Text>
              <Text style={[styles.listItem, {color: currentTheme.colors.text}]}>
                • Make dua (supplication) after the Azan
              </Text>
            </View>
            <Divider style={styles.divider} />
            <Title style={styles.subsectionTitle}>Response Phrases</Title>
            {responsePhrases.map((item, index) => (
              <View key={index} style={styles.responseContainer}>
                <Text style={[styles.arabicText, {color: currentTheme.colors.primary}]}>
                  {item.arabic}
                </Text>
                <Text style={[styles.transliteration, {color: currentTheme.colors.text}]}>
                  {item.transliteration}
                </Text>
                <Text style={[styles.responseText, {color: currentTheme.colors.text}]}>
                  Response: {item.response}
                </Text>
                {index < responsePhrases.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Dua After Azan */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Dua After Azan</Title>
            <Paragraph style={styles.sectionDescription}>
              After the Azan is complete, it is recommended to recite this dua:
            </Paragraph>
            <View style={styles.duaContainer}>
              <Text style={[styles.arabicText, {color: currentTheme.colors.primary}]}>
                اللهم رب هذه الدعوة التامة والصلاة القائمة آت محمداً الوسيلة والفضيلة وابعثه مقاماً محموداً الذي وعدته
              </Text>
              <Text style={[styles.transliteration, {color: currentTheme.colors.text}]}>
                Allahumma rabba hadhihi ad-da'awati at-tammati wa as-salati al-qaimati, ati
                Muhammadan al-wasilata wa al-fadilata, wa b'athhu maqaman mahmudan alladhi
                wa'adtahu
              </Text>
              <Text style={[styles.translation, {color: currentTheme.colors.text}]}>
                O Allah, Lord of this perfect call and established prayer, grant Muhammad the
                intercession and favor, and raise him to the honored station You have promised
                him.
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Conduct Guidelines */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Proper Conduct During Azan</Title>
            <Paragraph style={styles.sectionDescription}>
              When you hear the Azan, it is recommended (Sunnah) to:
            </Paragraph>
            <View style={styles.responseList}>
              <Text style={[styles.listItem, {color: currentTheme.colors.text}]}>
                • Stop talking and listen attentively
              </Text>
              <Text style={[styles.listItem, {color: currentTheme.colors.text}]}>
                • Do not engage in unnecessary activities
              </Text>
              <Text style={[styles.listItem, {color: currentTheme.colors.text}]}>
                • Repeat the phrases after the Muadhin (except during "Hayya ala as-Salah" and "Hayya ala al-Falah")
              </Text>
              <Text style={[styles.listItem, {color: currentTheme.colors.text}]}>
                • Make dua after the Azan is complete
              </Text>
              <Text style={[styles.listItem, {color: currentTheme.colors.text}]}>
                • Prepare for prayer mentally and physically
              </Text>
            </View>
            <Divider style={styles.divider} />
            <Paragraph style={styles.sectionDescription}>
              <Text style={styles.boldText}>Note:</Text> If you are in the bathroom, eating, or
              in a situation where you cannot respond, you may continue your activity but should
              respond mentally when possible.
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Practice Button */}
        <Button
          mode="contained"
          onPress={() => {
            // Navigate to settings to configure Azan
            (navigation as any).navigate('Settings');
          }}
          style={styles.practiceButton}
          contentStyle={styles.practiceButtonContent}>
          Configure Azan Settings
        </Button>
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
    backgroundColor: '#FFFFFF',
  },
  paragraph: {
    ...typography.body1,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  sectionDescription: {
    ...typography.body1,
    marginBottom: spacing.md,
    opacity: 0.8,
  },
  phraseContainer: {
    marginBottom: spacing.md,
  },
  arabicContainer: {
    marginBottom: spacing.xs,
  },
  arabicText: {
    ...typography.h4,
    fontSize: 24,
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  transliteration: {
    ...typography.body1,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  translation: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  meaning: {
    ...typography.body2,
    opacity: 0.7,
    lineHeight: 20,
  },
  divider: {
    marginVertical: spacing.md,
  },
  responseList: {
    marginBottom: spacing.md,
  },
  listItem: {
    ...typography.body1,
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  subsectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  responseContainer: {
    marginBottom: spacing.md,
  },
  responseText: {
    ...typography.body1,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  duaContainer: {
    marginTop: spacing.sm,
  },
  practiceButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: islamicBorderRadius.medium,
    ...islamicShadows.small,
  },
  practiceButtonContent: {
    paddingVertical: spacing.sm,
  },
  boldText: {
    fontWeight: '700',
  },
});
