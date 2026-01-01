/**
 * Database Seed Script
 * 
 * Seeds the database with initial data for development and testing.
 */

import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed achievements
  console.log('📜 Seeding achievements...');
  const achievements = [
    {
      achievementKey: 'first_step',
      title: 'First Step',
      description: 'Complete your first guided prayer',
      category: 'prayer',
      pointsAwarded: 10,
      requirementType: 'count',
      requirementValue: 1,
      isPremium: false,
    },
    {
      achievementKey: 'seven_days_light',
      title: 'Seven Days of Light',
      description: 'Pray all five daily prayers for 7 consecutive days',
      category: 'consistency',
      pointsAwarded: 50,
      requirementType: 'streak',
      requirementValue: 7,
      isPremium: false,
    },
    {
      achievementKey: 'the_opening',
      title: 'The Opening',
      description: 'Memorize Surah Al-Fatiha',
      category: 'learning',
      pointsAwarded: 25,
      requirementType: 'count',
      requirementValue: 1,
      isPremium: false,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: {achievementKey: achievement.achievementKey},
      update: {},
      create: achievement,
    });
  }

  // Seed holidays
  console.log('📅 Seeding Islamic holidays...');
  const holidays = [
    {
      holidayKey: 'ramadan',
      arabicName: 'رمضان',
      englishName: 'Ramadan',
      hijriMonth: 9,
      isMovable: true,
      significance:
        'Ramadan is the ninth month of the Islamic calendar and the month of fasting. It is one of the Five Pillars of Islam and holds immense spiritual significance. During this month, Muslims fast from dawn to sunset, abstaining from food, drink, and other physical needs.',
      recommendedPractices:
        'Fasting from dawn (Fajr) to sunset (Maghrib), increased prayer and recitation of Quran, performing Taraweeh prayers at night, giving charity (Zakat and Sadaqah), seeking Laylat al-Qadr (Night of Power) in the last 10 days, breaking fast with dates and water (Sunnah), making dua and seeking forgiveness, reading and reflecting on the Quran.',
      prohibitedActions:
        'Eating, drinking, or smoking during daylight hours, sexual relations during fasting hours, intentional vomiting, swearing, lying, or engaging in sinful behavior, gossiping or backbiting.',
      educationContent:
        'Ramadan commemorates the month in which the Quran was first revealed to Prophet Muhammad (peace be upon him) through the Angel Jibril (Gabriel). The first revelation occurred on Laylat al-Qadr (Night of Power), which is better than a thousand months. Muslims worldwide observe this holy month with fasting, prayer, charity, and increased devotion.',
    },
    {
      holidayKey: 'eid_al_fitr',
      arabicName: 'عيد الفطر',
      englishName: 'Eid al-Fitr',
      hijriMonth: 10,
      hijriDay: 1,
      isMovable: true,
      significance:
        'Eid al-Fitr, also known as the "Festival of Breaking the Fast," marks the end of Ramadan. It is a day of celebration, gratitude, and joy. Muslims gather for special prayers, exchange greetings, and share meals with family and friends.',
      recommendedPractices:
        'Perform Eid prayer in congregation (preferably at mosque), pay Zakat al-Fitr before Eid prayer, wear new or best clothes, take a bath (Ghusl) before going to prayer, eat dates (odd number) before leaving for prayer, recite Takbir on the way to prayer, exchange greetings: "Eid Mubarak" or "Taqabbal Allahu minna wa minkum", visit family and friends, give gifts especially to children, forgive others and seek forgiveness.',
      prohibitedActions: 'Fasting on Eid day (prohibited), missing Eid prayer without valid excuse.',
      educationContent:
        'Eid al-Fitr was established by Prophet Muhammad (peace be upon him) after the migration to Madinah. It is celebrated on the first day of Shawwal, the month following Ramadan. The day begins with a special congregational prayer, followed by celebrations, feasting, and acts of charity.',
    },
    {
      holidayKey: 'eid_al_adha',
      arabicName: 'عيد الأضحى',
      englishName: 'Eid al-Adha',
      hijriMonth: 12,
      hijriDay: 10,
      isMovable: true,
      significance:
        'Eid al-Adha, the "Festival of Sacrifice," commemorates Prophet Ibrahim\'s (Abraham\'s) willingness to sacrifice his son Ismail (Ishmael) as an act of obedience to Allah. Allah replaced Ismail with a ram, and this act of devotion is remembered through the sacrifice of animals.',
      recommendedPractices:
        'Perform Eid prayer in congregation, perform Qurbani (sacrifice) if financially able, distribute meat in three parts: family, relatives/friends, and the poor, wear new or best clothes, take a bath before prayer, recite Takbir during the days of Eid, visit family and friends, give charity.',
      prohibitedActions:
        'Fasting on Eid day (prohibited), cutting hair or nails if planning to sacrifice (from 1st Dhul-Hijjah until sacrifice).',
      educationContent:
        'Eid al-Adha occurs during the Hajj pilgrimage, on the 10th day of Dhul-Hijjah. It commemorates the ultimate test of faith when Prophet Ibrahim was commanded to sacrifice his beloved son, demonstrating complete submission to Allah\'s will. The meat from the sacrifice is distributed to family, friends, and those in need.',
    },
    {
      holidayKey: 'ashura',
      arabicName: 'عاشوراء',
      englishName: 'Ashura',
      hijriMonth: 1,
      hijriDay: 10,
      isMovable: false,
      significance:
        'Ashura is the 10th day of Muharram, the first month of the Islamic calendar. It holds historical significance as the day when Prophet Musa (Moses) and the Children of Israel were saved from Pharaoh. It is also the day when Prophet Nuh\'s (Noah\'s) ark came to rest.',
      recommendedPractices:
        'Fasting on the 9th and 10th of Muharram (or 10th and 11th), increased charity and good deeds, reflecting on historical events, making dua and seeking forgiveness.',
      prohibitedActions: 'None specific, but avoid innovations (Bid\'ah) not practiced by the Prophet.',
      educationContent:
        'The Prophet Muhammad (peace be upon him) fasted on Ashura and encouraged Muslims to fast on this day. When he learned that Jews also fasted on this day, he recommended fasting on the 9th as well to differentiate Muslim practice. It is a day of reflection on Allah\'s mercy and protection.',
    },
    {
      holidayKey: 'mawlid',
      arabicName: 'المولد النبوي',
      englishName: 'Mawlid an-Nabi',
      hijriMonth: 3,
      hijriDay: 12,
      isMovable: false,
      significance:
        'Mawlid an-Nabi commemorates the birth of Prophet Muhammad (peace be upon him) on the 12th day of Rabi\' al-awwal. It is a time to reflect on the Prophet\'s life, teachings, and example.',
      recommendedPractices:
        'Reading about the Prophet\'s life (Seerah), sending blessings upon the Prophet (Salawat), reciting Quran, giving charity, learning about the Prophet\'s character and teachings.',
      prohibitedActions: 'Avoid innovations not practiced by early Muslims.',
      educationContent:
        'The celebration of Mawlid varies among Muslim communities. The focus should be on learning about and following the Prophet\'s teachings rather than mere celebration. Muslims are encouraged to study the Seerah (biography) and implement the Prophet\'s Sunnah in their daily lives.',
    },
    {
      holidayKey: 'laylat_al_qadr',
      arabicName: 'ليلة القدر',
      englishName: 'Laylat al-Qadr',
      hijriMonth: 9,
      hijriDay: 27,
      isMovable: true,
      significance:
        'Laylat al-Qadr, the "Night of Power," is better than a thousand months. It is the night when the Quran was first revealed. Worship on this night is equivalent to worship for over 83 years.',
      recommendedPractices:
        'Spend the night in prayer and worship, recite Quran extensively, make sincere dua and seek forgiveness, perform extra prayers (Nawafil), engage in dhikr (remembrance of Allah), give charity, seek it in the odd nights of the last 10 days of Ramadan.',
      prohibitedActions: 'Avoid wasting time on worldly matters during this blessed night.',
      educationContent:
        'Laylat al-Qadr occurs during the last 10 days of Ramadan, most likely on one of the odd nights (21st, 23rd, 25th, 27th, or 29th). The exact night is known only to Allah, encouraging Muslims to seek it throughout these nights. The Quran describes it as "better than a thousand months" (Surah Al-Qadr).',
    },
    {
      holidayKey: 'isra_miraj',
      arabicName: 'الإسراء والمعراج',
      englishName: 'Isra and Mi\'raj',
      hijriMonth: 7,
      hijriDay: 27,
      isMovable: false,
      significance:
        'Isra and Mi\'raj commemorates the Night Journey and Ascension of Prophet Muhammad (peace be upon him) from Mecca to Jerusalem and then to the heavens. During this journey, the five daily prayers were prescribed.',
      recommendedPractices:
        'Reflecting on the significance of prayer, reading about the journey, increasing in prayer and worship, making dua, learning about the importance of the five daily prayers.',
      prohibitedActions: 'None specific.',
      educationContent:
        'The Isra and Mi\'raj occurred approximately one year before the Hijrah. It was during this miraculous journey that Allah prescribed the five daily prayers as a gift to the Muslim ummah. The journey demonstrates the Prophet\'s special status and the importance of prayer in Islam.',
    },
  ];

  for (const holiday of holidays) {
    await prisma.holiday.upsert({
      where: {holidayKey: holiday.holidayKey},
      update: {},
      create: holiday,
    });
  }

  // Seed basic surahs (Al-Fatiha and a few short surahs)
  console.log('📖 Seeding surahs...');
  const surahs = [
    {
      surahNumber: 1,
      arabicName: 'الفاتحة',
      transliteratedName: 'Al-Fatiha',
      englishName: 'The Opening',
      numberOfAyahs: 7,
      revelationType: 'meccan',
      juzNumber: 1,
      isShortSurah: true,
      isInJuzAmma: false,
    },
    {
      surahNumber: 112,
      arabicName: 'الإخلاص',
      transliteratedName: 'Al-Ikhlas',
      englishName: 'The Sincerity',
      numberOfAyahs: 4,
      revelationType: 'meccan',
      juzNumber: 30,
      isShortSurah: true,
      isInJuzAmma: true,
    },
    {
      surahNumber: 113,
      arabicName: 'الفلق',
      transliteratedName: 'Al-Falaq',
      englishName: 'The Daybreak',
      numberOfAyahs: 5,
      revelationType: 'meccan',
      juzNumber: 30,
      isShortSurah: true,
      isInJuzAmma: true,
    },
    {
      surahNumber: 114,
      arabicName: 'الناس',
      transliteratedName: 'An-Nas',
      englishName: 'Mankind',
      numberOfAyahs: 6,
      revelationType: 'meccan',
      juzNumber: 30,
      isShortSurah: true,
      isInJuzAmma: true,
    },
  ];

  for (const surah of surahs) {
    await prisma.surah.upsert({
      where: {surahNumber: surah.surahNumber},
      update: {},
      create: surah,
    });
  }

  console.log('✅ Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

