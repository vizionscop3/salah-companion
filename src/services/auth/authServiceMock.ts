/**
 * Mock Authentication Service for React Native
 * 
 * Prisma cannot run in React Native (Node.js only).
 * This mock service uses AsyncStorage only for development.
 * 
 * TODO: Replace with proper backend API integration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  subscriptionTier: string;
  onboardingCompleted: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  token?: string;
}

const STORAGE_KEYS = {
  USER_ID: '@salah_companion:user_id',
  USER_DATA: '@salah_companion:user_data',
  AUTH_TOKEN: '@salah_companion:auth_token',
};

// In-memory user store (temporary - replace with API)
const mockUsers: Map<string, {password: string; user: User}> = new Map();

/**
 * Register a new user (mock implementation)
 */
export async function registerUser(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthResult> {
  try {
    // Check if user already exists
    if (mockUsers.has(email)) {
      return {
        success: false,
        error: 'User with this email already exists',
      };
    }

    // Create mock user
    const user: User = {
      id: `user_${Date.now()}`,
      email,
      displayName: displayName || null,
      subscriptionTier: 'free',
      onboardingCompleted: false,
    };

    // Store user in memory (temporary)
    mockUsers.set(email, {password, user});

    // Store user data in AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.id);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'Failed to register user. Please try again.',
    };
  }
}

/**
 * Login user (mock implementation)
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    const userData = mockUsers.get(email);

    if (!userData) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Simple password check (in production, use proper hashing)
    if (userData.password !== password) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Store user data in AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userData.user.id);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData.user));

    return {
      success: true,
      user: userData.user,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Failed to login. Please try again.',
    };
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEYS.USER_ID, STORAGE_KEYS.USER_DATA, STORAGE_KEYS.AUTH_TOKEN]);
}

/**
 * Get current user from storage
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const userDataJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userDataJson) {
      return null;
    }

    const user = JSON.parse(userDataJson) as User;
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Update user profile (mock)
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    displayName?: string;
    preferredLanguage?: string;
    timezone?: string;
  },
): Promise<User | null> {
  try {
    const userDataJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userDataJson) {
      return null;
    }

    const user = JSON.parse(userDataJson) as User;
    const updatedUser = {...user, ...updates};

    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));

    return updatedUser;
  } catch (error) {
    console.error('Update profile error:', error);
    return null;
  }
}

/**
 * Change user password (mock)
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{success: boolean; error?: string}> {
  try {
    const userDataJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userDataJson) {
      return {success: false, error: 'User not found'};
    }

    const user = JSON.parse(userDataJson) as User;
    const userData = mockUsers.get(user.email);

    if (!userData || userData.password !== currentPassword) {
      return {success: false, error: 'Current password is incorrect'};
    }

    // Update password in memory
    mockUsers.set(user.email, {...userData, password: newPassword});

    return {success: true};
  } catch (error) {
    console.error('Change password error:', error);
    return {success: false, error: 'Failed to change password'};
  }
}
