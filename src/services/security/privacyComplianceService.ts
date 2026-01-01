/**
 * Privacy Compliance Service
 *
 * Utilities for GDPR, CCPA, and other privacy compliance requirements.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIVACY_CONSENT_KEY = '@salah_companion:privacy_consent';
const DATA_COLLECTION_KEY = '@salah_companion:data_collection_enabled';
const ANALYTICS_CONSENT_KEY = '@salah_companion:analytics_consent';

export interface PrivacyConsent {
  timestamp: number;
  version: string;
  dataCollection: boolean;
  analytics: boolean;
  marketing: boolean;
}

/**
 * Get user privacy consent status
 */
export async function getPrivacyConsent(): Promise<PrivacyConsent | null> {
  try {
    const consentJson = await AsyncStorage.getItem(PRIVACY_CONSENT_KEY);
    if (!consentJson) return null;
    return JSON.parse(consentJson);
  } catch {
    return null;
  }
}

/**
 * Save user privacy consent
 */
export async function savePrivacyConsent(consent: PrivacyConsent): Promise<void> {
  try {
    await AsyncStorage.setItem(PRIVACY_CONSENT_KEY, JSON.stringify(consent));
    await AsyncStorage.setItem(
      DATA_COLLECTION_KEY,
      consent.dataCollection ? 'true' : 'false',
    );
    await AsyncStorage.setItem(
      ANALYTICS_CONSENT_KEY,
      consent.analytics ? 'true' : 'false',
    );
  } catch (error) {
    console.error('Error saving privacy consent:', error);
    throw error;
  }
}

/**
 * Check if data collection is enabled
 */
export async function isDataCollectionEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(DATA_COLLECTION_KEY);
    return enabled === 'true';
  } catch {
    return false;
  }
}

/**
 * Check if analytics is enabled
 */
export async function isAnalyticsEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(ANALYTICS_CONSENT_KEY);
    return enabled === 'true';
  } catch {
    return false;
  }
}

/**
 * Request user data (GDPR right to access)
 */
export async function exportUserData(userId: string): Promise<any> {
  // In production, fetch all user data from database
  // For now, return structure
  return {
    userId,
    timestamp: Date.now(),
    data: {
      profile: 'User profile data',
      progress: 'Progress data',
      achievements: 'Achievement data',
      preferences: 'User preferences',
    },
  };
}

/**
 * Delete user data (GDPR right to erasure)
 */
export async function deleteUserData(userId: string): Promise<void> {
  // In production, delete all user data from database
  // Clear local storage
  try {
    await AsyncStorage.multiRemove([
      PRIVACY_CONSENT_KEY,
      DATA_COLLECTION_KEY,
      ANALYTICS_CONSENT_KEY,
    ]);
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
}

/**
 * Check if user has given consent
 */
export async function hasPrivacyConsent(): Promise<boolean> {
  const consent = await getPrivacyConsent();
  return consent !== null;
}

/**
 * Get privacy policy version
 */
export function getPrivacyPolicyVersion(): string {
  return '1.0.0'; // Update when privacy policy changes
}

