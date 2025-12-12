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
      significance: 'The month of fasting, one of the five pillars of Islam.',
      recommendedPractices: 'Fasting from dawn to sunset, increased prayer, recitation of Quran, charity.',
      prohibitedActions: 'Eating, drinking, and sexual relations during daylight hours.',
      educationContent: 'Ramadan is the ninth month of the Islamic calendar...',
    },
    {
      holidayKey: 'eid_al_fitr',
      arabicName: 'عيد الفطر',
      englishName: 'Eid al-Fitr',
      hijriMonth: 10,
      hijriDay: 1,
      isMovable: true,
      significance: 'Festival of Breaking the Fast, marking the end of Ramadan.',
      recommendedPractices: 'Eid prayer, Zakat al-Fitr, wearing new clothes, visiting family.',
      educationContent: 'Eid al-Fitr is celebrated on the first day of Shawwal...',
    },
    {
      holidayKey: 'eid_al_adha',
      arabicName: 'عيد الأضحى',
      englishName: 'Eid al-Adha',
      hijriMonth: 12,
      hijriDay: 10,
      isMovable: true,
      significance: 'Festival of Sacrifice, commemorating Ibrahim\'s willingness to sacrifice Ismail.',
      recommendedPractices: 'Eid prayer, Qurbani (sacrifice), distribution of meat.',
      educationContent: 'Eid al-Adha occurs during the Hajj pilgrimage...',
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

