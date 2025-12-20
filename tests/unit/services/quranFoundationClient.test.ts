import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const ORIGINAL_ENV = process.env;

describe('quranFoundationClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {...ORIGINAL_ENV};
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('throws when credentials are not configured', async () => {
    delete process.env.QURAN_FOUNDATION_CLIENT_ID;
    delete process.env.QURAN_FOUNDATION_CLIENT_SECRET;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {quranFoundationGet} = require('@services/quran/quranFoundationClient');

    await expect(quranFoundationGet('/chapters')).rejects.toThrow(
      'Quran Foundation credentials are not configured',
    );
  });

  it('fetches an access token and reuses it for subsequent requests', async () => {
    process.env.QURAN_FOUNDATION_CLIENT_ID = 'test-client-id';
    process.env.QURAN_FOUNDATION_CLIENT_SECRET = 'test-client-secret';

    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: 'ACCESS_TOKEN',
        expires_in: 3600,
      },
    } as any);

    mockedAxios.get.mockResolvedValue({
      data: {ok: true},
    } as any);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {
      quranFoundationGet,
      __resetQuranFoundationTokenCacheForTests,
    } = require('@services/quran/quranFoundationClient');

    // Ensure clean cache
    __resetQuranFoundationTokenCacheForTests();

    await quranFoundationGet('/chapters');
    await quranFoundationGet('/verses/by_chapter/1');

    // Token endpoint should have been called once
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);

    // GET should have been called twice with the cached token
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);

    const firstGetCall = mockedAxios.get.mock.calls[0];
    expect(firstGetCall[0]).toContain('/chapters');
    expect(firstGetCall[1]).toMatchObject({
      headers: {
        'x-auth-token': 'ACCESS_TOKEN',
        'x-client-id': 'test-client-id',
      },
    });
  });
});

