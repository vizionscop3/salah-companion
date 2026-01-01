/**
 * Azan Education Screen - Material Neubrutomorphism
 *
 * Educational content about Azan (Call to Prayer) including meaning, response, and proper conduct.
 */

import React, {useState, useMemo} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors, borderRadius, brutalistShadows} from '@constants/theme';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '@context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NeubrutalCard, NeubrutalButton, AnimatedCard} from '@components/index';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Azan Education</Text>
          <Text style={styles.subtitle}>
            Learn the meaning and proper response to the Call to Prayer
          </Text>
        </View>

        {/* Introduction */}
        <AnimatedCard index={0} style={styles.card} shadowSize="medium">
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="information"
                size={24}
                color={colors.primary.main}
              />
              <Text style={styles.cardTitle}>What is Azan?</Text>
            </View>
            <Text style={styles.paragraph}>
              The Azan (أذان) is the Islamic call to prayer, recited by a
              Muadhin (caller) to announce the time for salah. It is one of the
              most beautiful and spiritually significant sounds in Islam.
            </Text>
            <Text style={styles.paragraph}>
              The Azan serves as a reminder to pause from our daily activities
              and turn our attention to Allah, establishing a connection between
              the worshipper and the Creator.
            </Text>
          </View>
        </AnimatedCard>

        {/* History and Significance */}
        <AnimatedCard index={1} style={styles.card} shadowSize="medium">
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="history"
                size={24}
                color={colors.primary.main}
              />
              <Text style={styles.cardTitle}>History and Significance</Text>
            </View>
            <Text style={styles.paragraph}>
              The Azan was established during the time of Prophet Muhammad (peace be upon him)
              in Madinah, approximately 1-2 years after the Hijrah (migration). The method
              of calling to prayer was revealed to Abdullah ibn Zaid in a dream, which he
              shared with the Prophet. The Prophet confirmed it and instructed Bilal ibn
              Rabah, a freed Abyssinian slave, to become the first Muadhin.
            </Text>
            <Text style={styles.boldText}>Spiritual Significance:</Text>
            <View style={styles.responseList}>
              <View style={styles.listItem}>
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={colors.primary.main}
                  style={styles.listIcon}
                />
                <Text style={styles.listText}>The Azan is a declaration of faith and unity</Text>
              </View>
              <View style={styles.listItem}>
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={colors.primary.main}
                  style={styles.listIcon}
                />
                <Text style={styles.listText}>It calls Muslims to remember their purpose in life</Text>
              </View>
              <View style={styles.listItem}>
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={colors.primary.main}
                  style={styles.listIcon}
                />
                <Text style={styles.listText}>It serves as a reminder of the five daily prayers</Text>
              </View>
              <View style={styles.listItem}>
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={colors.primary.main}
                  style={styles.listIcon}
                />
                <Text style={styles.listText}>The Azan is considered a form of worship (Ibadah)</Text>
              </View>
              <View style={styles.listItem}>
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={colors.primary.main}
                  style={styles.listIcon}
                />
                <Text style={styles.listText}>Responding to the Azan brings great reward</Text>
              </View>
            </View>
          </View>
        </AnimatedCard>

        {/* Azan Phrases */}
        <AnimatedCard index={2} style={styles.card} shadowSize="medium">
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="volume-high"
                size={24}
                color={colors.primary.main}
              />
              <Text style={styles.cardTitle}>The Azan Phrases</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Each phrase in the Azan has deep meaning and significance:
            </Text>
            {azanPhrases.map((phrase, index) => (
              <View key={index} style={styles.phraseContainer}>
                <View style={styles.arabicContainer}>
                  <Text style={styles.arabicText}>{phrase.arabic}</Text>
                </View>
                <Text style={styles.transliteration}>{phrase.transliteration}</Text>
                <Text style={styles.translation}>{phrase.translation}</Text>
                <Text style={styles.meaning}>{phrase.meaning}</Text>
                {index < azanPhrases.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </AnimatedCard>

        {/* How to Respond */}
        <AnimatedCard index={3} style={styles.card} shadowSize="medium">
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="hand-wave"
                size={24}
                color={colors.primary.main}
              />
              <Text style={styles.cardTitle}>How to Respond to Azan</Text>
            </View>
            <Text style={styles.sectionDescription}>
              When you hear the Azan, it is recommended (Sunnah) to:
            </Text>
            <View style={styles.responseList}>
              <View style={styles.listItem}>
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={colors.primary.main}
                  style={styles.listIcon}
                />
                <Text style={styles.listText}>Stop what you are doing and listen attentively</Text>
              </View>
              <View style={styles.listItem}>
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={colors.primary.main}
                  style={styles.listIcon}
                />
                <Text style={styles.listText}>Repeat the phrases after the Muadhin</Text>
              </View>
              <View style={styles.listItem}>
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={colors.primary.main}
                  style={styles.listIcon}
                />
                <Text style={styles.listText}>Say specific responses for certain phrases</Text>
              </View>
              <View style={styles.listItem}>
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={colors.primary.main}
                  style={styles.listIcon}
                />
                <Text style={styles.listText}>Make dua (supplication) after the Azan</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.subsectionTitle}>Response Phrases</Text>
            {responsePhrases.map((item, index) => (
              <View key={index} style={styles.responseContainer}>
                <Text style={styles.arabicText}>{item.arabic}</Text>
                <Text style={styles.transliteration}>{item.transliteration}</Text>
                <Text style={styles.responseText}>Response: {item.response}</Text>
                {index < responsePhrases.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </AnimatedCard>

        {/* Dua After Azan */}
        <AnimatedCard index={4} style={styles.card} shadowSize="medium">
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="pray"
                size={24}
                color={colors.primary.main}
              />
              <Text style={styles.cardTitle}>Dua After Azan</Text>
            </View>
            <Text style={styles.sectionDescription}>
              After the Azan is complete, it is recommended to recite this dua:
            </Text>
            <View style={styles.duaContainer}>
              <Text style={styles.arabicText}>
                اللهم رب هذه الدعوة التامة والصلاة القائمة آت محمداً الوسيلة والفضيلة وابعثه مقاماً محموداً الذي وعدته
              </Text>
              <Text style={styles.transliteration}>
                Allahumma rabba hadhihi ad-da'awati at-tammati wa as-salati al-qaimati, ati
                Muhammadan al-wasilata wa al-fadilata, wa b'athhu maqaman mahmudan alladhi
                wa'adtahu
              </Text>
              <Text style={styles.translation}>
                O Allah, Lord of this perfect call and established prayer, grant Muhammad the
                intercession and favor, and raise him to the honored station You have promised
                him.
              </Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Conduct Guidelines */}
        <AnimatedCard index={5} style={styles.card} shadowSize="medium">
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={24}
                color={colors.primary.main}
              />
              <Text style={styles.cardTitle}>Proper Conduct During Azan</Text>
            </View>
            <Text style={styles.sectionDescription}>
              When you hear the Azan, it is recommended (Sunnah) to:
            </Text>
            <View style={styles.responseList}>
              <View style={styles.listItem}>
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={colors.primary.main}
                  style={styles.listIcon}
                />
                <Text style={styles.listText}>Stop talking and listen attentively</Text>
              </View>
              <View style={styles.listItem}>
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={colors.primary.main}
                  style={styles.listIcon}
                />
                <Text style={styles.listText}>Do not engage in unnecessary activities</Text>
              </View>
              <View style={styles.listItem}>
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={colors.primary.main}
                  style={styles.listIcon}
                />
                <Text style={styles.listText}>
                  Repeat the phrases after the Muadhin (except during "Hayya ala as-Salah" and "Hayya ala al-Falah")
                </Text>
              </View>
              <View style={styles.listItem}>
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={colors.primary.main}
                  style={styles.listIcon}
                />
                <Text style={styles.listText}>Make dua after the Azan is complete</Text>
              </View>
              <View style={styles.listItem}>
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={colors.primary.main}
                  style={styles.listIcon}
                />
                <Text style={styles.listText}>Prepare for prayer mentally and physically</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.sectionDescription}>
              <Text style={styles.boldText}>Note:</Text> If you are in the bathroom, eating, or
              in a situation where you cannot respond, you may continue your activity but should
              respond mentally when possible.
            </Text>
          </View>
        </AnimatedCard>

        {/* Practice Button */}
        <NeubrutalButton
          title="Configure Azan Settings"
          onPress={() => {
            (navigation as any).navigate('Settings');
          }}
          variant="primary"
          size="medium"
          style={styles.practiceButton}
          icon={
            <MaterialCommunityIcons
              name="cog"
              size={20}
              color={colors.background.default}
            />
          }
        />
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
    gap: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Poppins',
  },
  subtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    fontFamily: 'Poppins',
  },
  card: {
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.primary.main,
    borderWidth: 3,
    borderRadius: borderRadius.lg,
  },
  cardContent: {
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.h5,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Poppins',
  },
  paragraph: {
    ...typography.body1,
    color: colors.text.secondary,
    lineHeight: 24,
    fontFamily: 'Inter',
  },
  sectionDescription: {
    ...typography.body1,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    fontFamily: 'Inter',
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
    color: colors.primary.main,
    marginBottom: spacing.xs,
    fontFamily: 'Amiri',
  },
  transliteration: {
    ...typography.body1,
    fontStyle: 'italic',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontFamily: 'Inter',
  },
  translation: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontFamily: 'Poppins',
  },
  meaning: {
    ...typography.body2,
    color: colors.text.secondary,
    lineHeight: 20,
    fontFamily: 'Inter',
  },
  divider: {
    height: 2,
    backgroundColor: colors.surface.tertiary,
    marginVertical: spacing.md,
  },
  responseList: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  listIcon: {
    marginTop: 2,
  },
  listText: {
    ...typography.body1,
    flex: 1,
    color: colors.text.secondary,
    lineHeight: 24,
    fontFamily: 'Inter',
  },
  subsectionTitle: {
    ...typography.h6,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontFamily: 'Poppins',
  },
  responseContainer: {
    marginBottom: spacing.md,
  },
  responseText: {
    ...typography.body1,
    marginTop: spacing.xs,
    fontStyle: 'italic',
    color: colors.text.secondary,
    fontFamily: 'Inter',
  },
  duaContainer: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  practiceButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  boldText: {
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Poppins',
  },
});
