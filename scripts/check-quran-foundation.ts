/**
 * Integration check for Quran Foundation (Quran.com) API
 *
 * This script:
 * 1. Loads environment variables from `.env`
 * 2. Verifies that Quran Foundation credentials are present
 * 3. Uses the shared quranFoundationClient to:
 *    - Fetch chapter metadata for Surah Al-Fatihah (1)
 *    - Fetch the first few verses of Surah 1
 *
 * Run locally (with network access) via:
 *   npm run check:quran-api
 */

import 'dotenv/config';
import {quranFoundationGet} from '@services/quran/quranFoundationClient';

async function main() {
  const clientId = process.env.QURAN_FOUNDATION_CLIENT_ID;
  const clientSecret = process.env.QURAN_FOUNDATION_CLIENT_SECRET;
  const oauthBase =
    process.env.QURAN_FOUNDATION_OAUTH_BASE || 'https://oauth2.quran.foundation';

  // Match content base to OAuth environment by default
  const defaultContentBase = oauthBase.includes('prelive-oauth2.quran.foundation')
    ? 'https://apis-prelive.quran.foundation/content/api/v4'
    : 'https://apis.quran.foundation/content/api/v4';

  const contentBase =
    process.env.QURAN_FOUNDATION_CONTENT_BASE || defaultContentBase;

  console.log('🔎 Quran Foundation integration check');
  console.log('  OAuth base   :', oauthBase);
  console.log('  Content base :', contentBase);
  console.log('  Client ID    :', clientId ? `${clientId.slice(0, 6)}…` : '(missing)');

  if (!clientId || !clientSecret) {
    console.error(
      '❌ QURAN_FOUNDATION_CLIENT_ID or QURAN_FOUNDATION_CLIENT_SECRET is missing. ' +
        'Please set them in your .env file before running this script.',
    );
    process.exit(1);
  }

  try {
    console.log('\n1) Fetching chapter metadata for Surah 1 (Al-Fatihah)…');
    const chapterResponse: any = await quranFoundationGet('/chapters/1', {
      language: 'en',
    });

    const chapter =
      chapterResponse.chapter ||
      (Array.isArray(chapterResponse.chapters)
        ? chapterResponse.chapters[0]
        : chapterResponse);

    if (!chapter) {
      throw new Error('No chapter data returned from Quran Foundation');
    }

    console.log('   ✅ Chapter fetched:');
    console.log('      ID           :', chapter.id);
    console.log('      Name (arabic):', chapter.name_arabic || chapter.name);
    console.log('      Name (simple):', chapter.name_simple || chapter.name_complex);
    console.log(
      '      Translation  :',
      chapter.translated_name?.name || chapter.englishNameTranslation || '(unknown)',
    );

    console.log('\n2) Fetching first few verses of Surah 1…');
    const versesResponse: any = await quranFoundationGet(
      '/verses/by_chapter/1',
      {
        page: 1,
        per_page: 7,
        words: false,
        fields: 'text_uthmani,verse_key',
      },
    );

    const verses: any[] = versesResponse.verses || [];
    console.log(`   ✅ Received ${verses.length} verses (showing first few):`);
    verses.slice(0, 3).forEach((v, idx) => {
      const text =
        v.text_uthmani ||
        v.text_uthmani_simple ||
        v.text ||
        '';
      console.log(
        `      [${idx + 1}] ${v.verse_key || ''} → ${text.substring(0, 80)}${
          text.length > 80 ? '…' : ''
        }`,
      );
    });

    console.log('\n✅ Quran Foundation pre-production connectivity looks good.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Quran Foundation integration check failed.');
    console.error(error);
    process.exit(1);
  }
}

main();

