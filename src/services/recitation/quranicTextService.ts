/**
 * Quranic Text Service
 *
 * Provides Quranic text data (Arabic, transliteration, translation) for
 * recitation practice.
 *
 * Primary source (when configured):
 * - Quran Foundation / Quran.com Content API
 *
 * Fallback:
 * - Al-Quran Cloud public API
 */

import axios from 'axios';
import {
  isQuranFoundationConfigured,
  quranFoundationGet,
} from '@services/quran/quranFoundationClient';

const AL_QURAN_CLOUD_BASE = 'https://api.alquran.cloud/v1';

// Optional: comma-separated list of Quran Foundation translation IDs
// e.g. "20" for a particular English translation, or "20,131"
// When not configured, we fall back to Al-Quran Cloud for translations.
const QURAN_FOUNDATION_TRANSLATIONS =
  process.env.QURAN_FOUNDATION_TRANSLATIONS || '';

export interface Ayah {
  number: number;
  text: string; // Arabic text
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface Surah {
  number: number;
  name: string; // Arabic name
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  ayahs: Ayah[];
}

export interface Word {
  text: string; // Arabic word
  transliteration?: string;
  translation?: string;
  position: number;
}

export interface AyahTranslationInfo {
  id: number;
  resourceId: number;
  text: string;
  languageName?: string;
  resourceName?: string;
  authorName?: string;
}

/**
 * Map a Quran Foundation verse object into the local `Ayah` shape.
 * This is intentionally tolerant of missing fields to reduce coupling
 * to the exact upstream response.
 */
function mapQuranFoundationVerseToAyah(
  verse: any,
  surahNumber: number,
  ayahNumberFallback: number,
): Ayah {
  const verseKey: string | undefined = verse.verse_key;
  const derivedNumberInSurah =
    typeof verse.verse_number === 'number'
      ? verse.verse_number
      : verseKey && verseKey.includes(':')
      ? parseInt(verseKey.split(':')[1] || `${ayahNumberFallback}`, 10)
      : ayahNumberFallback;

  const text =
    verse.text_uthmani ||
    verse.text_uthmani_simple ||
    verse.text_indopak ||
    verse.text_imlaei ||
    verse.text ||
    '';

  return {
    number: typeof verse.id === 'number' ? verse.id : surahNumber * 1000 + derivedNumberInSurah,
    text,
    numberInSurah: derivedNumberInSurah,
    juz: verse.juz_number ?? verse.juz ?? 0,
    manzil: verse.manzil_number ?? verse.manzil ?? 0,
    page: verse.page_number ?? verse.page ?? 0,
    ruku: verse.ruku_number ?? verse.ruku ?? 0,
    hizbQuarter:
      verse.rub_el_hizb_number ??
      verse.hizb_quarter_number ??
      verse.hizbQuarter ??
      0,
    sajda:
      Boolean(verse.sajdah) ||
      verse.sajdah_type === 'obligatory' ||
      verse.sajdah_type === 'recommended',
  };
}

/**
 * Get surah data with all ayahs.
 *
 * Tries Quran Foundation first (if credentials are configured) and
 * falls back to Al-Quran Cloud.
 */
export async function getSurah(surahNumber: number): Promise<Surah> {
  // Prefer Quran Foundation when credentials are available
  if (isQuranFoundationConfigured()) {
    try {
      // Chapter metadata
      const chapterResponse: any = await quranFoundationGet(`/chapters/${surahNumber}`, {
        language: 'en',
      });
      const chapter =
        chapterResponse.chapter ||
        (Array.isArray(chapterResponse.chapters)
          ? chapterResponse.chapters[0]
          : chapterResponse);

      if (!chapter) {
        throw new Error('Invalid chapter response from Quran Foundation');
      }

      const verses: any[] = [];
      const perPage = 50;
      let page = 1;
      let totalRecords: number | undefined;

      // Paginate through verses for this chapter
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const versesResponse: any = await quranFoundationGet(
          `/verses/by_chapter/${surahNumber}`,
          {
            page,
            per_page: perPage,
            language: 'en',
            words: false,
            fields:
              'text_uthmani,juz_number,page_number,manzil_number,ruku_number,rub_el_hizb_number,sajdah_type',
          },
        );

        const batch: any[] = versesResponse.verses || [];
        verses.push(...batch);

        const pagination = versesResponse.pagination;
        if (pagination) {
          totalRecords =
            typeof pagination.total_records === 'number'
              ? pagination.total_records
              : totalRecords;

          const hasMore =
            typeof pagination.next_page === 'number' &&
            pagination.next_page > pagination.current_page;

          if (!hasMore) {
            break;
          }

          page = pagination.next_page;
        } else {
          // No pagination info; assume single page
          break;
        }

        if (totalRecords && verses.length >= totalRecords) {
          break;
        }
      }

      return {
        number: chapter.id ?? surahNumber,
        name: chapter.name_arabic || chapter.name || '',
        englishName: chapter.name_simple || chapter.name_complex || '',
        englishNameTranslation:
          chapter.translated_name?.name ||
          chapter.englishNameTranslation ||
          chapter.name_simple ||
          '',
        numberOfAyahs: chapter.verses_count || verses.length,
        revelationType:
          chapter.revelation_place &&
          typeof chapter.revelation_place === 'string' &&
          chapter.revelation_place.toLowerCase().startsWith('makka')
            ? 'Meccan'
            : 'Medinan',
        ayahs: verses.map((v, index) =>
          mapQuranFoundationVerseToAyah(v, surahNumber, index + 1),
        ),
      };
    } catch (error) {
      console.warn(
        `Quran Foundation getSurah failed for ${surahNumber}, falling back to Al-Quran Cloud:`,
        error,
      );
    }
  }

  // Fallback: existing Al-Quran Cloud behaviour
  try {
    const response = await axios.get(`${AL_QURAN_CLOUD_BASE}/surah/${surahNumber}`);
    const data = response.data.data;

    return {
      number: data.number,
      name: data.name,
      englishName: data.englishName,
      englishNameTranslation: data.englishNameTranslation,
      numberOfAyahs: data.numberOfAyahs,
      revelationType: data.revelationType,
      ayahs: data.ayahs.map((ayah: any) => ({
        number: ayah.number,
        text: ayah.text,
        numberInSurah: ayah.numberInSurah,
        juz: ayah.juz,
        manzil: ayah.manzil,
        page: ayah.page,
        ruku: ayah.ruku,
        hizbQuarter: ayah.hizbQuarter,
        sajda: ayah.sajda,
      })),
    };
  } catch (error) {
    console.error(
      `Error fetching surah ${surahNumber} from Al-Quran Cloud:`,
      error,
    );
    throw error;
  }
}

/**
 * Get single ayah data
 */
export async function getAyah(surahNumber: number, ayahNumber: number): Promise<Ayah> {
  if (isQuranFoundationConfigured()) {
    try {
      const verseKey = `${surahNumber}:${ayahNumber}`;
      const response: any = await quranFoundationGet(`/verses/${verseKey}`, {
        fields:
          'text_uthmani,juz_number,page_number,manzil_number,ruku_number,rub_el_hizb_number,sajdah_type',
      });

      const verse =
        response.verse ||
        (Array.isArray(response.verses) ? response.verses[0] : response);

      if (!verse) {
        throw new Error('Invalid verse response from Quran Foundation');
      }

      return mapQuranFoundationVerseToAyah(verse, surahNumber, ayahNumber);
    } catch (error) {
      console.warn(
        `Quran Foundation getAyah failed for ${surahNumber}:${ayahNumber}, falling back to Al-Quran Cloud:`,
        error,
      );
    }
  }

  // Fallback: existing Al-Quran Cloud behaviour
  try {
    const response = await axios.get(
      `${AL_QURAN_CLOUD_BASE}/ayah/${surahNumber}:${ayahNumber}`,
    );
    const data = response.data.data;

    return {
      number: data.number,
      text: data.text,
      numberInSurah: data.numberInSurah,
      juz: data.juz,
      manzil: data.manzil,
      page: data.page,
      ruku: data.ruku,
      hizbQuarter: data.hizbQuarter,
      sajda: data.sajda,
    };
  } catch (error) {
    console.error(
      `Error fetching ayah ${surahNumber}:${ayahNumber} from Al-Quran Cloud:`,
      error,
    );
    throw error;
  }
}

/**
 * Split ayah text into words
 * Note: This is a simple split - for accurate word boundaries, consider using a proper Arabic tokenizer
 */
export function splitAyahIntoWords(ayahText: string): Word[] {
  // Remove diacritics for splitting (optional)
  // Simple word splitting by space and Arabic punctuation
  const words = ayahText
    .split(/[\s\u200C\u200D\u200E\u200F\u202A-\u202E\u2066-\u2069]+/)
    .filter(word => word.trim().length > 0)
    .map((text, index) => ({
      text: text.trim(),
      position: index + 1,
    }));
  
  return words;
}

/**
 * Get transliteration for ayah.
 *
 * When Quran Foundation is configured, fetches word-level transliteration
 * and combines into a full ayah transliteration string.
 *
 * Falls back to empty string if Quran Foundation is unavailable or
 * transliteration data is missing.
 */
export async function getAyahTransliteration(
  surahNumber: number,
  ayahNumber: number,
): Promise<string> {
  if (isQuranFoundationConfigured()) {
    try {
      const verseKey = `${surahNumber}:${ayahNumber}`;
      const response: any = await quranFoundationGet(`/verses/${verseKey}`, {
        words: true,
        word_fields: 'transliteration',
      });

      const verse =
        response.verse ||
        (Array.isArray(response.verses) ? response.verses[0] : response);

      if (!verse) {
        throw new Error('Invalid verse response from Quran Foundation');
      }

      // Extract word-level transliterations and combine
      const words: any[] = verse.words || [];
      const transliterations = words
        .map((w: any) => {
          const translit = w.transliteration?.text || w.transliteration || '';
          return translit.trim();
        })
        .filter((t: string) => t.length > 0);

      if (transliterations.length > 0) {
        return transliterations.join(' ');
      }
    } catch (error) {
      console.warn(
        `Quran Foundation getAyahTransliteration failed for ${surahNumber}:${ayahNumber}:`,
        error,
      );
    }
  }

  // Al-Quran Cloud doesn't provide transliteration
  // Return empty string as fallback
  return '';
}

/**
 * Get translations for a single ayah.
 *
 * When Quran Foundation is configured and QURAN_FOUNDATION_TRANSLATIONS
 * is set, this will return one entry per configured translation ID,
 * including basic metadata (resource name, author, language).
 *
 * When Quran Foundation is not available, falls back to a single
 * translation from Al-Quran Cloud with minimal metadata.
 */
export async function getAyahTranslations(
  surahNumber: number,
  ayahNumber: number,
  language: string = 'en',
): Promise<AyahTranslationInfo[]> {
  // Prefer Quran Foundation when:
  // - credentials are configured
  // - a default translations list is provided
  // - and we're requesting English (the common case for now)
  if (isQuranFoundationConfigured() && QURAN_FOUNDATION_TRANSLATIONS && language === 'en') {
    try {
      const verseKey = `${surahNumber}:${ayahNumber}`;
      const response: any = await quranFoundationGet(
        `/verses/${verseKey}/translations`,
        {
          translations: QURAN_FOUNDATION_TRANSLATIONS,
          translation_fields: 'language_name,resource_name,author_name',
        },
      );

      const translations: any[] = response.translations || [];

      return translations.map((t: any): AyahTranslationInfo => ({
        id: typeof t.id === 'number' ? t.id : 0,
        resourceId:
          typeof t.resource_id === 'number'
            ? t.resource_id
            : typeof t.resourceId === 'number'
            ? t.resourceId
            : 0,
        text: typeof t.text === 'string' ? t.text : '',
        languageName: t.language_name || t.languageName,
        resourceName: t.resource_name || t.resourceName,
        authorName: t.author_name || t.authorName,
      }));
    } catch (error) {
      console.warn(
        `Quran Foundation getAyahTranslations failed for ${surahNumber}:${ayahNumber}, falling back to Al-Quran Cloud:`,
        error,
      );
    }
  }

  // Fallback: Al-Quran Cloud translation by language code
  try {
    const response = await axios.get(
      `${AL_QURAN_CLOUD_BASE}/ayah/${surahNumber}:${ayahNumber}/${language}`,
    );
    const text = response.data.data.text as string;

    const translation: AyahTranslationInfo = {
      id: response.data.data.number ?? 0,
      resourceId: 0,
      text,
      languageName: language,
      resourceName: 'Al-Quran Cloud',
    };

    return [translation];
  } catch (error) {
    console.error(`Error fetching translation from Al-Quran Cloud:`, error);
    return [];
  }
}

/**
 * Get primary translation text for ayah (first configured translation).
 * Wrapper around getAyahTranslations for existing callers.
 */
export async function getAyahTranslation(
  surahNumber: number,
  ayahNumber: number,
  language: string = 'en',
): Promise<string> {
  const translations = await getAyahTranslations(surahNumber, ayahNumber, language);
  return translations[0]?.text ?? '';
}

/**
 * Get common surahs for practice (Juz Amma - last 37 surahs)
 */
export const COMMON_SURAHS = [
  {number: 78, name: 'An-Naba', englishName: 'The Great News'},
  {number: 79, name: 'An-Nazi\'at', englishName: 'Those who drag forth'},
  {number: 80, name: 'Abasa', englishName: 'He Frowned'},
  {number: 81, name: 'At-Takwir', englishName: 'The Overthrowing'},
  {number: 82, name: 'Al-Infitar', englishName: 'The Cleaving'},
  {number: 83, name: 'Al-Mutaffifin', englishName: 'The Defrauding'},
  {number: 84, name: 'Al-Inshiqaq', englishName: 'The Splitting Open'},
  {number: 85, name: 'Al-Buruj', englishName: 'The Constellations'},
  {number: 86, name: 'At-Tariq', englishName: 'The Nightcomer'},
  {number: 87, name: 'Al-A\'la', englishName: 'The Most High'},
  {number: 88, name: 'Al-Ghashiyah', englishName: 'The Overwhelming'},
  {number: 89, name: 'Al-Fajr', englishName: 'The Dawn'},
  {number: 90, name: 'Al-Balad', englishName: 'The City'},
  {number: 91, name: 'Ash-Shams', englishName: 'The Sun'},
  {number: 92, name: 'Al-Layl', englishName: 'The Night'},
  {number: 93, name: 'Ad-Duha', englishName: 'The Morning Hours'},
  {number: 94, name: 'Ash-Sharh', englishName: 'The Relief'},
  {number: 95, name: 'At-Tin', englishName: 'The Fig'},
  {number: 96, name: 'Al-Alaq', englishName: 'The Clot'},
  {number: 97, name: 'Al-Qadr', englishName: 'The Power'},
  {number: 98, name: 'Al-Bayyinah', englishName: 'The Evidence'},
  {number: 99, name: 'Az-Zalzalah', englishName: 'The Earthquake'},
  {number: 100, name: 'Al-Adiyat', englishName: 'Those that run'},
  {number: 101, name: 'Al-Qari\'ah', englishName: 'The Calamity'},
  {number: 102, name: 'At-Takathur', englishName: 'The Rivalry'},
  {number: 103, name: 'Al-Asr', englishName: 'The Time'},
  {number: 104, name: 'Al-Humazah', englishName: 'The Slanderer'},
  {number: 105, name: 'Al-Fil', englishName: 'The Elephant'},
  {number: 106, name: 'Quraysh', englishName: 'Quraysh'},
  {number: 107, name: 'Al-Ma\'un', englishName: 'The Small kindnesses'},
  {number: 108, name: 'Al-Kawthar', englishName: 'The Abundance'},
  {number: 109, name: 'Al-Kafirun', englishName: 'The Disbelievers'},
  {number: 110, name: 'An-Nasr', englishName: 'The Divine Support'},
  {number: 111, name: 'Al-Masad', englishName: 'The Palm Fibre'},
  {number: 112, name: 'Al-Ikhlas', englishName: 'The Sincerity'},
  {number: 113, name: 'Al-Falaq', englishName: 'The Daybreak'},
  {number: 114, name: 'An-Nas', englishName: 'The Mankind'},
];

/**
 * Get surah info (lightweight, no ayahs)
 */
export interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

export async function getSurahInfo(surahNumber: number): Promise<SurahInfo> {
  try {
    const response = await axios.get(`${AL_QURAN_CLOUD_BASE}/surah/${surahNumber}`);
    const data = response.data.data;
    
    return {
      number: data.number,
      name: data.name,
      englishName: data.englishName,
      numberOfAyahs: data.numberOfAyahs,
    };
  } catch (error) {
    console.error(`Error fetching surah info ${surahNumber}:`, error);
    throw error;
  }
}

