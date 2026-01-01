import axios from 'axios';

jest.mock('axios');

jest.mock('@services/quran/quranFoundationClient', () => ({
  isQuranFoundationConfigured: jest.fn(),
  quranFoundationGet: jest.fn(),
}));

import {getAyah, getSurah} from '@services/recitation/quranicTextService';

const mockedAxios = axios as jest.Mocked<typeof axios>;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  isQuranFoundationConfigured,
  quranFoundationGet,
} = require('@services/quran/quranFoundationClient') as {
  isQuranFoundationConfigured: jest.Mock<boolean, []>;
  quranFoundationGet: jest.Mock<Promise<any>, [string, Record<string, any>?]>;
};

describe('quranicTextService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAyah uses Al-Quran Cloud when Quran Foundation is not configured', async () => {
    isQuranFoundationConfigured.mockReturnValue(false);

    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          number: 1,
          text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
          numberInSurah: 1,
          juz: 1,
          manzil: 1,
          page: 1,
          ruku: 1,
          hizbQuarter: 1,
          sajda: false,
        },
      },
    } as any);

    const ayah = await getAyah(1, 1);

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get.mock.calls[0][0]).toContain(
      'https://api.alquran.cloud/v1/ayah/1:1',
    );
    expect(ayah.text).toBe('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
    expect(ayah.numberInSurah).toBe(1);
  });

  it('getAyah prefers Quran Foundation when configured', async () => {
    isQuranFoundationConfigured.mockReturnValue(true);

    quranFoundationGet.mockResolvedValue({
      verse: {
        id: 123,
        verse_key: '1:1',
        text_uthmani: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        juz_number: 1,
        manzil_number: 1,
        page_number: 1,
        ruku_number: 1,
        rub_el_hizb_number: 1,
        sajdah_type: 'none',
      },
    });

    const ayah = await getAyah(1, 1);

    // Should NOT call the fallback API when Quran Foundation succeeds
    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(ayah.text).toBe('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
    expect(ayah.numberInSurah).toBe(1);
    expect(ayah.juz).toBe(1);
  });

  it('getSurah falls back to Al-Quran Cloud when Quran Foundation fails', async () => {
    isQuranFoundationConfigured.mockReturnValue(true);
    quranFoundationGet.mockRejectedValue(new Error('API error'));

    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          number: 1,
          name: 'الفاتحة',
          englishName: 'Al-Fatihah',
          englishNameTranslation: 'The Opener',
          numberOfAyahs: 7,
          revelationType: 'Meccan',
          ayahs: [
            {
              number: 1,
              text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
              numberInSurah: 1,
              juz: 1,
              manzil: 1,
              page: 1,
              ruku: 1,
              hizbQuarter: 1,
              sajda: false,
            },
          ],
        },
      },
    } as any);

    const surah = await getSurah(1);

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(surah.number).toBe(1);
    expect(surah.name).toBe('الفاتحة');
    expect(surah.ayahs[0].text).toBe('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
  });
});

