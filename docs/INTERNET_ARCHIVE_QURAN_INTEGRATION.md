# Internet Archive Quran Integration

## Overview

This service integrates Quran data from the Internet Archive collection with Tajwid, transliteration, and English translation.

**Internet Archive Collection**: https://ia903401.us.archive.org/30/items/quran-with-tajwid-and-english-translation/

**GitHub Repository (Alternative)**: https://github.com/semarketir/quranjson

## Data Sources

### Primary: Internet Archive
- **Collection URL**: `https://ia903401.us.archive.org/30/items/quran-with-tajwid-and-english-translation/`
- **Page Numbers Metadata**: `quran-with-tajwid-and-english-translation_page_numbers.json`
- **Content Files**: Various formats (JSON, may be page-based or complete)

### Secondary: GitHub Repository
- **Repository**: `semarketir/quranjson`
- **Raw Content Base**: `https://raw.githubusercontent.com/semarketir/quranjson/master/source`
- **Translation Files**: Available in `translation/` directory

### Fallback: Existing Services
- **Quran Foundation API**: When configured
- **Al-Quran Cloud API**: Public fallback

## Service Implementation

### Location
`src/services/quran/internetArchiveQuranService.ts`

### Key Functions

1. **`getInternetArchiveSurah(surahNumber)`**
   - Fetches a specific surah with all ayahs
   - Returns Arabic text, transliteration, and English translation

2. **`getInternetArchiveAyah(surahNumber, ayahNumber)`**
   - Fetches a specific ayah
   - Returns complete ayah data

3. **`getAllInternetArchiveSurahs()`**
   - Fetches all 114 surahs
   - Returns sorted array of surahs

4. **`isInternetArchiveAvailable()`**
   - Checks if Internet Archive is accessible
   - Used for availability checks

## Data Structure

```typescript
interface InternetArchiveAyah {
  surah: number;
  ayah: number;
  arabic: string;           // Arabic text with Tajwid
  transliteration: string;  // Pronunciation guide
  translation: string;      // English translation
  page?: number;            // Page number (if available)
}

interface InternetArchiveSurah {
  number: number;
  name: string;             // Arabic name
  englishName: string;      // English name
  ayahs: InternetArchiveAyah[];
}
```

## Integration with Quran Screen

The `QuranScreen` component automatically:
1. Tries Internet Archive first
2. Falls back to GitHub repository
3. Uses existing services if both fail

This ensures users always get Quran data, even if one source is unavailable.

## File Discovery

The service attempts multiple file name patterns:

### Internet Archive
- `quran.json`
- `quran_en.json`
- `quran_complete.json`
- `quran-with-tajwid.json`
- `quran-full.json`
- `quran_with_translation.json`
- `complete_quran.json`
- `quran-tajwid-translation.json`

### GitHub Repository
- `quran.json`
- `quran_en.json`
- `translation/quran.json`
- `translation/quran_en.json`
- `quran-with-tajwid.json`

## Caching

- **Surah Cache**: Cached in memory to avoid repeated API calls
- **Page Mapping Cache**: Cached page number mappings
- **Cache Duration**: Until app restart or manual clear
- **Clear Cache**: Use `clearInternetArchiveCache()`

## Error Handling

The service implements graceful degradation:
1. Try Internet Archive
2. Try GitHub repository
3. Fall back to existing `quranicTextService`
4. Never fails completely - always provides data

## Usage Example

```typescript
import {
  getInternetArchiveSurah,
  isInternetArchiveAvailable,
} from '@services/quran/internetArchiveQuranService';

// Check availability
const available = await isInternetArchiveAvailable();

if (available) {
  // Fetch surah
  const surah = await getInternetArchiveSurah(1); // Al-Fatiha
  
  if (surah) {
    surah.ayahs.forEach((ayah) => {
      console.log('Arabic:', ayah.arabic);
      console.log('Transliteration:', ayah.transliteration);
      console.log('Translation:', ayah.translation);
    });
  }
}
```

## Notes

- The `page_numbers.json` file is metadata, not content
- Actual content files may have different names/structures
- Service automatically adapts to available file formats
- All requests use secure axios instance with timeout protection

## Future Enhancements

1. **Tajwid Highlighting**: Parse Tajwid markers for visual highlighting
2. **Page Navigation**: Use page numbers for page-based navigation
3. **Offline Support**: Cache complete Quran for offline reading
4. **Multiple Translations**: Support for multiple English translations
5. **Audio Integration**: Link to audio recitations by page/surah

## References

- **Internet Archive Collection**: https://ia903401.us.archive.org/30/items/quran-with-tajwid-and-english-translation/
- **GitHub Repository**: https://github.com/semarketir/quranjson
- **Page Numbers JSON**: https://ia903401.us.archive.org/30/items/quran-with-tajwid-and-english-translation/quran-with-tajwid-and-english-translation_page_numbers.json


