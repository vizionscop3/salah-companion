/**
 * Holiday Education Screen
 *
 * Educational content about Islamic holidays including significance, practices, and conduct guidelines.
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Title, Paragraph, Divider, Chip} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography} from '@constants/theme';
import {islamicShadows, islamicBorderRadius} from '@constants/islamicTheme';
import {useNavigation, useRoute} from '@react-navigation/native';
import {MAJOR_HOLIDAYS, IslamicHoliday} from '@services/calendar/islamicCalendarService';

interface HolidayContent {
  key: string;
  arabicName: string;
  englishName: string;
  significance: string;
  recommendedPractices: string[];
  prohibitedActions?: string[];
  conductGuidelines: string[];
  historicalContext?: string;
}

const HOLIDAY_CONTENT: Record<string, HolidayContent> = {
  ramadan: {
    key: 'ramadan',
    arabicName: 'رمضان',
    englishName: 'Ramadan',
    significance:
      'Ramadan is the ninth month of the Islamic calendar and the month of fasting. It is one of the Five Pillars of Islam and holds immense spiritual significance. During this month, Muslims fast from dawn to sunset, abstaining from food, drink, and other physical needs.',
    recommendedPractices: [
      'Fasting from dawn (Fajr) to sunset (Maghrib)',
      'Increased prayer and recitation of Quran',
      'Performing Taraweeh prayers at night',
      'Giving charity (Zakat and Sadaqah)',
      'Seeking Laylat al-Qadr (Night of Power) in the last 10 days',
      'Breaking fast with dates and water (Sunnah)',
      'Making dua and seeking forgiveness',
      'Reading and reflecting on the Quran',
    ],
    prohibitedActions: [
      'Eating, drinking, or smoking during daylight hours',
      'Sexual relations during fasting hours',
      'Intentional vomiting',
      'Swearing, lying, or engaging in sinful behavior',
      'Gossiping or backbiting',
    ],
    conductGuidelines: [
      'Be patient and maintain good character',
      'Control anger and negative emotions',
      'Be generous and help those in need',
      'Attend Taraweeh prayers at the mosque',
      'Wake up for Suhoor (pre-dawn meal)',
      'Break fast promptly at Maghrib time',
      'Spend time in reflection and self-improvement',
    ],
    historicalContext:
      'Ramadan commemorates the month in which the Quran was first revealed to Prophet Muhammad (peace be upon him) through the Angel Jibril (Gabriel). The first revelation occurred on Laylat al-Qadr (Night of Power), which is better than a thousand months.',
  },
  eid_al_fitr: {
    key: 'eid_al_fitr',
    arabicName: 'عيد الفطر',
    englishName: 'Eid al-Fitr',
    significance:
      'Eid al-Fitr, also known as the "Festival of Breaking the Fast," marks the end of Ramadan. It is a day of celebration, gratitude, and joy. Muslims gather for special prayers, exchange greetings, and share meals with family and friends.',
    recommendedPractices: [
      'Perform Eid prayer in congregation (preferably at mosque)',
      'Pay Zakat al-Fitr before Eid prayer',
      'Wear new or best clothes',
      'Take a bath (Ghusl) before going to prayer',
      'Eat dates (odd number) before leaving for prayer',
      'Recite Takbir on the way to prayer',
      'Exchange greetings: "Eid Mubarak" or "Taqabbal Allahu minna wa minkum"',
      'Visit family and friends',
      'Give gifts, especially to children',
      'Forgive others and seek forgiveness',
    ],
    prohibitedActions: [
      'Fasting on Eid day (prohibited)',
      'Missing Eid prayer without valid excuse',
    ],
    conductGuidelines: [
      'Wake up early and prepare for prayer',
      'Take different routes to and from the prayer ground',
      'Show happiness and gratitude',
      'Be generous and charitable',
      'Reconcile with those you have disagreements with',
      'Remember those less fortunate',
      'Avoid excessive spending or wastefulness',
    ],
    historicalContext:
      'Eid al-Fitr was established by Prophet Muhammad (peace be upon him) after the migration to Madinah. It is celebrated on the first day of Shawwal, the month following Ramadan.',
  },
  eid_al_adha: {
    key: 'eid_al_adha',
    arabicName: 'عيد الأضحى',
    englishName: 'Eid al-Adha',
    significance:
      'Eid al-Adha, the "Festival of Sacrifice," commemorates Prophet Ibrahim\'s (Abraham\'s) willingness to sacrifice his son Ismail (Ishmael) as an act of obedience to Allah. Allah replaced Ismail with a ram, and this act of devotion is remembered through the sacrifice of animals.',
    recommendedPractices: [
      'Perform Eid prayer in congregation',
      'Perform Qurbani (sacrifice) if financially able',
      'Distribute meat in three parts: family, relatives/friends, and the poor',
      'Wear new or best clothes',
      'Take a bath before prayer',
      'Recite Takbir during the days of Eid',
      'Visit family and friends',
      'Give charity',
    ],
    prohibitedActions: [
      'Fasting on Eid day (prohibited)',
      'Cutting hair or nails if planning to sacrifice (from 1st Dhul-Hijjah until sacrifice)',
    ],
    conductGuidelines: [
      'Reflect on the story of Ibrahim and Ismail',
      'Be grateful for Allah\'s blessings',
      'Share the meat with those in need',
      'Perform sacrifice with proper Islamic guidelines',
      'Remember the spirit of sacrifice and obedience',
      'Spend time in prayer and reflection',
    ],
    historicalContext:
      'Eid al-Adha occurs during the Hajj pilgrimage, on the 10th day of Dhul-Hijjah. It commemorates the ultimate test of faith when Prophet Ibrahim was commanded to sacrifice his beloved son, demonstrating complete submission to Allah\'s will.',
  },
  ashura: {
    key: 'ashura',
    arabicName: 'عاشوراء',
    englishName: 'Ashura',
    significance:
      'Ashura is the 10th day of Muharram, the first month of the Islamic calendar. It holds historical significance as the day when Prophet Musa (Moses) and the Children of Israel were saved from Pharaoh. It is also the day when Prophet Nuh\'s (Noah\'s) ark came to rest.',
    recommendedPractices: [
      'Fasting on the 9th and 10th of Muharram (or 10th and 11th)',
      'Increased charity and good deeds',
      'Reflecting on historical events',
      'Making dua and seeking forgiveness',
    ],
    conductGuidelines: [
      'Fast with the intention of following Sunnah',
      'Remember the lessons from the stories of the Prophets',
      'Be grateful for Allah\'s mercy and protection',
      'Avoid innovations (Bid\'ah) not practiced by the Prophet',
    ],
    historicalContext:
      'The Prophet Muhammad (peace be upon him) fasted on Ashura and encouraged Muslims to fast on this day. When he learned that Jews also fasted on this day, he recommended fasting on the 9th as well to differentiate Muslim practice.',
  },
  mawlid: {
    key: 'mawlid',
    arabicName: 'المولد النبوي',
    englishName: 'Mawlid an-Nabi',
    significance:
      'Mawlid an-Nabi commemorates the birth of Prophet Muhammad (peace be upon him) on the 12th day of Rabi\' al-awwal. It is a time to reflect on the Prophet\'s life, teachings, and example.',
    recommendedPractices: [
      'Reading about the Prophet\'s life (Seerah)',
      'Sending blessings upon the Prophet (Salawat)',
      'Reciting Quran',
      'Giving charity',
      'Learning about the Prophet\'s character and teachings',
    ],
    conductGuidelines: [
      'Focus on following the Prophet\'s example',
      'Increase in sending Salawat',
      'Study the Seerah and Hadith',
      'Reflect on the Prophet\'s mercy and compassion',
      'Avoid innovations not practiced by early Muslims',
    ],
    historicalContext:
      'The celebration of Mawlid varies among Muslim communities. The focus should be on learning about and following the Prophet\'s teachings rather than mere celebration.',
  },
  laylat_al_qadr: {
    key: 'laylat_al_qadr',
    arabicName: 'ليلة القدر',
    englishName: 'Laylat al-Qadr',
    significance:
      'Laylat al-Qadr, the "Night of Power," is better than a thousand months. It is the night when the Quran was first revealed. Worship on this night is equivalent to worship for over 83 years.',
    recommendedPractices: [
      'Spend the night in prayer and worship',
      'Recite Quran extensively',
      'Make sincere dua and seek forgiveness',
      'Perform extra prayers (Nawafil)',
      'Engage in dhikr (remembrance of Allah)',
      'Give charity',
      'Seek it in the odd nights of the last 10 days of Ramadan',
    ],
    conductGuidelines: [
      'Stay awake and worship throughout the night',
      'Make sincere repentance',
      'Ask for guidance and blessings',
      'Read and reflect on the Quran',
      'Avoid wasting time on worldly matters',
    ],
    historicalContext:
      'Laylat al-Qadr occurs during the last 10 days of Ramadan, most likely on one of the odd nights (21st, 23rd, 25th, 27th, or 29th). The exact night is known only to Allah, encouraging Muslims to seek it throughout these nights.',
  },
};

export const HolidayEducationScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const holidayKey = (route.params as any)?.holidayKey || 'ramadan';
  const [selectedHoliday, setSelectedHoliday] = useState<HolidayContent | null>(
    HOLIDAY_CONTENT[holidayKey] || HOLIDAY_CONTENT.ramadan,
  );

  useEffect(() => {
    const key = (route.params as any)?.holidayKey;
    if (key && HOLIDAY_CONTENT[key]) {
      setSelectedHoliday(HOLIDAY_CONTENT[key]);
    }
  }, [route.params]);

  if (!selectedHoliday) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={[styles.errorText, {color: currentTheme.colors.error}]}>
          Holiday not found
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: currentTheme.colors.text}]}>
            {selectedHoliday.englishName}
          </Text>
          <Text style={[styles.arabicTitle, {color: currentTheme.colors.primary}]}>
            {selectedHoliday.arabicName}
          </Text>
        </View>

        {/* Holiday Selector */}
        <View style={styles.holidaySelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.values(HOLIDAY_CONTENT).map(holiday => (
              <TouchableOpacity
                key={holiday.key}
                onPress={() => setSelectedHoliday(holiday)}
                style={[
                  styles.holidayChip,
                  selectedHoliday.key === holiday.key && styles.holidayChipSelected,
                ]}>
                <Text
                  style={[
                    styles.holidayChipText,
                    selectedHoliday.key === holiday.key && styles.holidayChipTextSelected,
                    {color: currentTheme.colors.text},
                  ]}>
                  {holiday.englishName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Significance */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Significance</Title>
            <Paragraph style={styles.paragraph}>{selectedHoliday.significance}</Paragraph>
            {selectedHoliday.historicalContext && (
              <>
                <Divider style={styles.divider} />
                <Title style={styles.subsectionTitle}>Historical Context</Title>
                <Paragraph style={styles.paragraph}>
                  {selectedHoliday.historicalContext}
                </Paragraph>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Recommended Practices */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Recommended Practices</Title>
            {selectedHoliday.recommendedPractices.map((practice, index) => (
              <View key={index} style={styles.practiceItem}>
                <Text style={[styles.bullet, {color: currentTheme.colors.primary}]}>•</Text>
                <Text style={[styles.practiceText, {color: currentTheme.colors.text}]}>
                  {practice}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Prohibited Actions */}
        {selectedHoliday.prohibitedActions && selectedHoliday.prohibitedActions.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Prohibited Actions</Title>
              {selectedHoliday.prohibitedActions.map((action, index) => (
                <View key={index} style={styles.practiceItem}>
                  <Text style={[styles.bullet, {color: currentTheme.colors.error}]}>✗</Text>
                  <Text style={[styles.practiceText, {color: currentTheme.colors.text}]}>
                    {action}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Conduct Guidelines */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Conduct Guidelines</Title>
            {selectedHoliday.conductGuidelines.map((guideline, index) => (
              <View key={index} style={styles.practiceItem}>
                <Text style={[styles.bullet, {color: currentTheme.colors.primary}]}>✓</Text>
                <Text style={[styles.practiceText, {color: currentTheme.colors.text}]}>
                  {guideline}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
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
  arabicTitle: {
    ...typography.h4,
    fontSize: 28,
    textAlign: 'right',
  },
  holidaySelector: {
    marginBottom: spacing.md,
  },
  holidayChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: islamicBorderRadius.medium,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  holidayChipSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
    borderWidth: 2,
  },
  holidayChipText: {
    ...typography.body1,
    fontWeight: '500',
  },
  holidayChipTextSelected: {
    fontWeight: '700',
    color: '#1976D2',
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
  divider: {
    marginVertical: spacing.md,
  },
  subsectionTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  practiceItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  bullet: {
    ...typography.h4,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  practiceText: {
    ...typography.body1,
    flex: 1,
    lineHeight: 24,
  },
  errorText: {
    ...typography.body1,
    textAlign: 'center',
    padding: spacing.lg,
  },
});

