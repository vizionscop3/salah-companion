/**
 * Internet Archive Quran Service
 *
 * Fetches Quran data from Internet Archive collection:
 * https://ia903401.us.archive.org/30/items/quran-with-tajwid-and-english-translation/
 *
 * Provides Arabic text with Tajwid, transliteration, and English translation.
 */

import axios from 'axios';
import {createSecureAxiosInstance} from '@services/security/apiSecurityService';

const INTERNET_ARCHIVE_BASE = 'https://ia903401.us.archive.org/30/items/quran-with-tajwid-and-english-translation';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/semarketir/quranjson/master/source';

export interface InternetArchiveAyah {
  surah: number;
  ayah: number;
  arabic: string;
  transliteration: string;
  translation: string;
  page?: number;
}

export interface InternetArchiveSurah {
  number: number;
  name: string;
  englishName: string;
  ayahs: InternetArchiveAyah[];
}

/**
 * Cache for Quran data to avoid repeated API calls
 */
let quranDataCache: Map<number, InternetArchiveSurah> | null = null;
let pageMappingCache: Map<number, {surah: number; ayah: number}[]> | null = null;

/**
 * Fetch page numbers mapping from Internet Archive
 */
async function fetchPageMapping(): Promise<Map<number, {surah: number; ayah: number}[]>> {
  if (pageMappingCache) {
    return pageMappingCache;
  }

  try {
    const secureAxios = createSecureAxiosInstance();
    const response = await secureAxios.get(
      `${INTERNET_ARCHIVE_BASE}/quran-with-tajwid-and-english-translation_page_numbers.json`,
      {
        timeout: 15000,
      },
    );

    const pageMapping = new Map<number, {surah: number; ayah: number}[]>();
    
    // Parse the page numbers JSON to create a mapping
    // Note: The JSON structure may need adjustment based on actual format
    if (response.data && response.data.pages) {
      response.data.pages.forEach((page: any) => {
        if (page.pageNumber && page.pageNumber !== '') {
          const pageNum = parseInt(page.pageNumber, 10);
          if (!isNaN(pageNum)) {
            // Extract surah and ayah from OCR values or other metadata
            // This is a placeholder - actual implementation depends on JSON structure
            if (!pageMapping.has(pageNum)) {
              pageMapping.set(pageNum, []);
            }
          }
        }
      });
    }

    pageMappingCache = pageMapping;
    return pageMapping;
  } catch (error) {
    if (__DEV__) {
      console.error('Error fetching page mapping from Internet Archive:', error);
    }
    return new Map();
  }
}

/**
 * Fetch Quran data from Internet Archive
 * The collection may have different file formats - we'll try common patterns
 * Based on the page numbers JSON, we'll also try to construct data from available files
 */
async function fetchQuranDataFromArchive(): Promise<Map<number, InternetArchiveSurah>> {
  if (quranDataCache) {
    return quranDataCache;
  }

  try {
    const secureAxios = createSecureAxiosInstance();
    
    // Try to fetch the main Quran JSON file
    // Common patterns based on Internet Archive collections
    const possibleFiles = [
      'quran.json',
      'quran_en.json',
      'quran_complete.json',
      'quran-with-tajwid.json',
      'quran-full.json',
      'quran_with_translation.json',
      'complete_quran.json',
      'quran-tajwid-translation.json',
    ];

    let quranData: any = null;

    for (const filename of possibleFiles) {
      try {
        const response = await secureAxios.get(
          `${INTERNET_ARCHIVE_BASE}/${filename}`,
          {
            timeout: 15000,
          },
        );
        quranData = response.data;
        if (__DEV__) {
          console.log(`✅ Found Quran data file: ${filename}`);
        }
        break;
      } catch (fileError) {
        // Try next file
        if (__DEV__) {
          console.log(`⚠️ File ${filename} not found, trying next...`);
        }
        continue;
      }
    }

    // If Internet Archive doesn't have the file, try GitHub repository
    if (!quranData) {
      if (__DEV__) {
        console.log('Trying GitHub repository as alternative source...');
      }
      
      const githubFiles = [
        'quran.json',
        'quran_en.json',
        'translation/quran.json',
        'translation/quran_en.json',
        'quran-with-tajwid.json',
      ];
      
      for (const filename of githubFiles) {
        try {
          const response = await secureAxios.get(
            `${GITHUB_RAW_BASE}/${filename}`,
            {
              timeout: 15000,
            },
          );
          quranData = response.data;
          if (__DEV__) {
            console.log(`✅ Found Quran data file on GitHub: ${filename}`);
          }
          break;
        } catch (fileError) {
          continue;
        }
      }
    }

    // If still no data found, throw error to trigger fallback
    if (!quranData) {
      if (__DEV__) {
        console.warn('Quran data file not found in Internet Archive or GitHub, will use fallback services');
      }
      throw new Error('Quran data file not found in available sources');
    }

    // Parse the JSON data into our structure
    const surahsMap = new Map<number, InternetArchiveSurah>();

    // The structure may vary - we'll handle common formats
    if (Array.isArray(quranData)) {
      // If it's an array of surahs
      quranData.forEach((surah: any) => {
        if (surah.number && surah.ayahs) {
          surahsMap.set(surah.number, {
            number: surah.number,
            name: surah.name || surah.arabicName || '',
            englishName: surah.englishName || surah.name || '',
            ayahs: surah.ayahs.map((ayah: any) => ({
              surah: surah.number,
              ayah: ayah.number || ayah.ayah || 0,
              arabic: ayah.arabic || ayah.text || '',
              transliteration: ayah.transliteration || ayah.translit || '',
              translation: ayah.translation || ayah.english || '',
              page: ayah.page,
            })),
          });
        }
      });
    } else if (quranData.surahs || quranData.chapters) {
      // If it's an object with surahs/chapters property
      const surahsArray = quranData.surahs || quranData.chapters || [];
      surahsArray.forEach((surah: any) => {
        if (surah.number && surah.ayahs) {
          surahsMap.set(surah.number, {
            number: surah.number,
            name: surah.name || surah.arabicName || '',
            englishName: surah.englishName || surah.name || '',
            ayahs: surah.ayahs.map((ayah: any) => ({
              surah: surah.number,
              ayah: ayah.number || ayah.ayah || 0,
              arabic: ayah.arabic || ayah.text || '',
              transliteration: ayah.transliteration || ayah.translit || '',
              translation: ayah.translation || ayah.english || '',
              page: ayah.page,
            })),
          });
        }
      });
    }

    quranDataCache = surahsMap;
    return surahsMap;
  } catch (error) {
    if (__DEV__) {
      console.error('Error fetching Quran data from Internet Archive:', error);
    }
    throw error;
  }
}

/**
 * Get a specific surah from Internet Archive
 */
export async function getInternetArchiveSurah(
  surahNumber: number,
): Promise<InternetArchiveSurah | null> {
  try {
    const quranData = await fetchQuranDataFromArchive();
    return quranData.get(surahNumber) || null;
  } catch (error) {
    if (__DEV__) {
      console.error(`Error fetching surah ${surahNumber} from Internet Archive:`, error);
    }
    return null;
  }
}

/**
 * Get a specific ayah from Internet Archive
 */
export async function getInternetArchiveAyah(
  surahNumber: number,
  ayahNumber: number,
): Promise<InternetArchiveAyah | null> {
  try {
    const surah = await getInternetArchiveSurah(surahNumber);
    if (!surah) {
      return null;
    }
    return surah.ayahs.find((a) => a.ayah === ayahNumber) || null;
  } catch (error) {
    if (__DEV__) {
      console.error(
        `Error fetching ayah ${surahNumber}:${ayahNumber} from Internet Archive:`,
        error,
      );
    }
    return null;
  }
}

/**
 * Get all surahs from Internet Archive
 */
export async function getAllInternetArchiveSurahs(): Promise<InternetArchiveSurah[]> {
  try {
    const quranData = await fetchQuranDataFromArchive();
    return Array.from(quranData.values()).sort((a, b) => a.number - b.number);
  } catch (error) {
    if (__DEV__) {
      console.error('Error fetching all surahs from Internet Archive:', error);
    }
    return [];
  }
}

/**
 * Clear the cache (useful for testing or forcing refresh)
 */
export function clearInternetArchiveCache(): void {
  quranDataCache = null;
  pageMappingCache = null;
  if (__DEV__) {
    console.log('🗑️ Internet Archive Quran cache cleared');
  }
}

/**
 * Check if Internet Archive is available
 */
export async function isInternetArchiveAvailable(): Promise<boolean> {
  try {
    const secureAxios = createSecureAxiosInstance();
    await secureAxios.get(
      `${INTERNET_ARCHIVE_BASE}/quran-with-tajwid-and-english-translation_page_numbers.json`,
      {
        timeout: 5000,
      },
    );
    return true;
  } catch {
    return false;
  }
}

