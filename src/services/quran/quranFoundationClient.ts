/**
 * Quran Foundation API Client
 *
 * Handles OAuth2 Client Credentials authentication and authenticated
 * requests to the Quran Foundation (Quran.com) content APIs.
 *
 * Notes:
 * - Credentials (client ID / secret) must be provided via environment
 *   variables and MUST NOT be hard-coded in the source code.
 * - This client is intentionally small and generic so it can be reused
 *   by text, audio, and other Quran-related services.
 */

import axios from 'axios';
import {createSecureAxiosInstance, sanitizeApiResponse} from '@services/security/apiSecurityService';

const QURAN_FOUNDATION_OAUTH_BASE =
  process.env.QURAN_FOUNDATION_OAUTH_BASE || 'https://oauth2.quran.foundation';

/**
 * Default content API base is selected to match the OAuth environment:
 * - If using the prelive OAuth host, default to the prelive content host
 * - Otherwise, default to the production content host
 *
 * This prevents accidentally sending pre-production tokens to the
 * production API (and vice versa) when QURAN_FOUNDATION_CONTENT_BASE
 * is not explicitly configured in .env.
 */
const DEFAULT_QURAN_FOUNDATION_CONTENT_BASE = QURAN_FOUNDATION_OAUTH_BASE.includes(
  'prelive-oauth2.quran.foundation',
)
  ? 'https://apis-prelive.quran.foundation/content/api/v4'
  : 'https://apis.quran.foundation/content/api/v4';

const QURAN_FOUNDATION_CONTENT_BASE =
  process.env.QURAN_FOUNDATION_CONTENT_BASE || DEFAULT_QURAN_FOUNDATION_CONTENT_BASE;

type TokenCache = {
  accessToken: string;
  expiresAt: number; // epoch millis
} | null;

let tokenCache: TokenCache = null;

function getClientId(): string | undefined {
  return process.env.QURAN_FOUNDATION_CLIENT_ID;
}

function getClientSecret(): string | undefined {
  return process.env.QURAN_FOUNDATION_CLIENT_SECRET;
}

/**
 * Helper to determine if Quran Foundation credentials are configured.
 */
export function isQuranFoundationConfigured(): boolean {
  return !!(getClientId() && getClientSecret());
}

/**
 * Encode client credentials for HTTP Basic auth.
 *
 * Works in both React Native (using global `btoa`) and Node/Jest (using Buffer).
 */
function encodeBasicAuth(clientId: string, clientSecret: string): string {
  const raw = `${clientId}:${clientSecret}`;

  // React Native / browser-style global
  // eslint-disable-next-line no-undef
  if (typeof btoa === 'function') {
    // eslint-disable-next-line no-undef
    return btoa(raw);
  }

  // Node / environments with Buffer
  // eslint-disable-next-line no-undef
  if (typeof Buffer !== 'undefined') {
    // eslint-disable-next-line no-undef
    return Buffer.from(raw).toString('base64');
  }

  throw new Error('No base64 encoder available for Quran Foundation auth');
}

/**
 * Fetch (or reuse) an access token using the Client Credentials flow.
 *
 * Tokens are cached in-memory until shortly before expiry to avoid
 * unnecessary token requests.
 */
async function getAccessToken(): Promise<string> {
  const clientId = getClientId();
  const clientSecret = getClientSecret();

  if (!clientId || !clientSecret) {
    throw new Error('Quran Foundation client credentials are not configured');
  }

  const now = Date.now();

  if (tokenCache && now < tokenCache.expiresAt - 60_000) {
    // Reuse cached token with 60 second safety window
    return tokenCache.accessToken;
  }

  const basicAuth = encodeBasicAuth(clientId, clientSecret);

  const response = await axios.post(
    `${QURAN_FOUNDATION_OAUTH_BASE}/oauth2/token`,
    'grant_type=client_credentials&scope=content',
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  const accessToken = response.data?.access_token as string | undefined;
  const expiresIn = (response.data?.expires_in as number | undefined) ?? 3600;

  if (!accessToken) {
    throw new Error('Quran Foundation token response missing access_token');
  }

  tokenCache = {
    accessToken,
    expiresAt: now + expiresIn * 1000,
  };

  return accessToken;
}

/**
 * Perform an authenticated GET request against the Quran Foundation
 * content API.
 *
 * @param path   Relative path starting with `/`, e.g. `/chapters`
 * @param params Optional query parameters
 */
export async function quranFoundationGet<T = any>(
  path: string,
  params?: Record<string, any>,
): Promise<T> {
  if (!isQuranFoundationConfigured()) {
    throw new Error('Quran Foundation credentials are not configured');
  }

  const accessToken = await getAccessToken();

  // Use secure axios instance
  const secureAxios = createSecureAxiosInstance(QURAN_FOUNDATION_CONTENT_BASE);
  
  const response = await secureAxios.get<T>(path, {
    params,
    headers: {
      'x-auth-token': accessToken,
      // Quran Foundation recommends sending client ID with each request
      'x-client-id': getClientId() as string,
    },
  });

  // Sanitize response data
  const sanitizedData = sanitizeApiResponse(response.data);
  return sanitizedData as T;
}

/**
 * Internal helper for tests to reset cached token state.
 */
export function __resetQuranFoundationTokenCacheForTests(): void {
  tokenCache = null;
}

