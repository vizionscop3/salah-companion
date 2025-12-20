/**
 * Islamic Calendar Service
 *
 * Converts between Gregorian and Hijri dates, and provides Islamic holidays.
 */

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  dayName?: string;
}

export interface IslamicHoliday {
  key: string;
  name: string;
  arabicName: string;
  hijriMonth: number;
  hijriDay: number;
  isMovable: boolean;
  description: string;
}

/**
 * Convert Gregorian date to Hijri (Islamic) date
 * Using approximate calculation (for production, use a more accurate library)
 */
export function gregorianToHijri(gregorianDate: Date): HijriDate {
  const year = gregorianDate.getFullYear();
  const month = gregorianDate.getMonth() + 1;
  const day = gregorianDate.getDate();

  // Approximate conversion (simplified)
  // For production, use a library like 'hijri-converter' or 'moment-hijri'
  const hijriYear = Math.floor((year - 622) * 1.0307);
  const hijriMonth = Math.floor(((month - 1) * 30.44 + day) / 29.53) + 1;
  const hijriDay = Math.floor(((month - 1) * 30.44 + day) % 29.53) + 1;

  const monthNames = [
    'Muharram',
    'Safar',
    "Rabi' al-awwal",
    "Rabi' al-thani",
    'Jumada al-awwal',
    'Jumada al-thani',
    'Rajab',
    "Sha'ban",
    'Ramadan',
    'Shawwal',
    "Dhu al-Qi'dah",
    "Dhu al-Hijjah",
  ];

  return {
    day: Math.max(1, Math.min(30, Math.round(hijriDay))),
    month: Math.max(1, Math.min(12, Math.round(hijriMonth))),
    year: Math.round(hijriYear),
    monthName: monthNames[Math.max(0, Math.min(11, Math.round(hijriMonth) - 1))],
  };
}

/**
 * Get current Hijri date
 */
export function getCurrentHijriDate(): HijriDate {
  return gregorianToHijri(new Date());
}

/**
 * Format Hijri date for display
 */
export function formatHijriDate(hijriDate: HijriDate): string {
  return `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year} AH`;
}

/**
 * Major Islamic holidays
 */
export const MAJOR_HOLIDAYS: IslamicHoliday[] = [
  {
    key: 'ashura',
    name: 'Ashura',
    arabicName: 'عاشوراء',
    hijriMonth: 1,
    hijriDay: 10,
    isMovable: false,
    description: 'The 10th day of Muharram',
  },
  {
    key: 'mawlid',
    name: 'Mawlid an-Nabi',
    arabicName: 'المولد النبوي',
    hijriMonth: 3,
    hijriDay: 12,
    isMovable: false,
    description: 'Birthday of Prophet Muhammad (PBUH)',
  },
  {
    key: 'isra_miraj',
    name: 'Isra and Mi\'raj',
    arabicName: 'الإسراء والمعراج',
    hijriMonth: 7,
    hijriDay: 27,
    isMovable: false,
    description: 'Night Journey and Ascension',
  },
  {
    key: 'laylat_al_qadr',
    name: 'Laylat al-Qadr',
    arabicName: 'ليلة القدر',
    hijriMonth: 9,
    hijriDay: 27,
    isMovable: true,
    description: 'Night of Power (last 10 days of Ramadan)',
  },
  {
    key: 'eid_al_fitr',
    name: 'Eid al-Fitr',
    arabicName: 'عيد الفطر',
    hijriMonth: 10,
    hijriDay: 1,
    isMovable: true,
    description: 'Festival of Breaking the Fast',
  },
  {
    key: 'eid_al_adha',
    name: 'Eid al-Adha',
    arabicName: 'عيد الأضحى',
    hijriMonth: 12,
    hijriDay: 10,
    isMovable: true,
    description: 'Festival of Sacrifice',
  },
  {
    key: 'hijri_new_year',
    name: 'Islamic New Year',
    arabicName: 'رأس السنة الهجرية',
    hijriMonth: 1,
    hijriDay: 1,
    isMovable: false,
    description: 'First day of Muharram',
  },
];

/**
 * Check if a date is an Islamic holiday
 */
export function isIslamicHoliday(date: Date): IslamicHoliday | null {
  const hijriDate = gregorianToHijri(date);

  for (const holiday of MAJOR_HOLIDAYS) {
    if (
      holiday.hijriMonth === hijriDate.month &&
      holiday.hijriDay === hijriDate.day
    ) {
      return holiday;
    }
  }

  return null;
}

/**
 * Get upcoming Islamic holidays
 */
export function getUpcomingHolidays(count: number = 5): Array<{
  holiday: IslamicHoliday;
  gregorianDate: Date;
  hijriDate: HijriDate;
}> {
  const today = new Date();
  const upcoming: Array<{
    holiday: IslamicHoliday;
    gregorianDate: Date;
    hijriDate: HijriDate;
  }> = [];

  // For movable holidays, we'd need more complex calculation
  // For now, return fixed holidays
  const fixedHolidays = MAJOR_HOLIDAYS.filter(h => !h.isMovable);

  for (const holiday of fixedHolidays) {
    // Approximate Gregorian date (simplified)
    // In production, use proper conversion
    const currentHijri = getCurrentHijriDate();
    let targetYear = currentHijri.year;

    if (
      holiday.hijriMonth < currentHijri.month ||
      (holiday.hijriMonth === currentHijri.month && holiday.hijriDay < currentHijri.day)
    ) {
      targetYear += 1;
    }

    // Approximate conversion back to Gregorian
    const gregorianYear = Math.round(622 + targetYear / 1.0307);
    const gregorianDate = new Date(gregorianYear, 0, 1);
    // This is simplified - proper conversion needed

    if (gregorianDate >= today) {
      upcoming.push({
        holiday,
        gregorianDate,
        hijriDate: {
          day: holiday.hijriDay,
          month: holiday.hijriMonth,
          year: targetYear,
          monthName: '',
        },
      });
    }
  }

  return upcoming.slice(0, count);
}

