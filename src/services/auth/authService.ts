/**
 * Authentication Service
 *
 * Handles user authentication, registration, and session management.
 */

import {prisma} from '@services/database/prismaClient';
import bcrypt from 'bcryptjs';
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
  AUTH_TOKEN: '@salah_companion:auth_token',
};

/**
 * Register a new user
 */
export async function registerUser(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthResult> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {email},
    });

    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists',
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: displayName || null,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        subscriptionTier: true,
        onboardingCompleted: true,
      },
    });

    // Create default user settings
    await prisma.userSettings.create({
      data: {
        userId: user.id,
      },
    });

    // Store user ID in AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.id);

    return {
      success: true,
      user: user as User,
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
 * Login user
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: {email},
      select: {
        id: true,
        email: true,
        passwordHash: true,
        displayName: true,
        subscriptionTier: true,
        onboardingCompleted: true,
        isActive: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        error: 'Account is disabled. Please contact support.',
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Update last login
    await prisma.user.update({
      where: {id: user.id},
      data: {lastLogin: new Date()},
    });

    // Store user ID in AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.id);

    const {passwordHash: _, isActive: __, ...userWithoutSensitive} = user;

    return {
      success: true,
      user: userWithoutSensitive as User,
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
  await AsyncStorage.multiRemove([STORAGE_KEYS.USER_ID, STORAGE_KEYS.AUTH_TOKEN]);
}

/**
 * Get current user from storage
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {id: userId},
      select: {
        id: true,
        email: true,
        displayName: true,
        subscriptionTier: true,
        onboardingCompleted: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      // Clear invalid user from storage
      await logoutUser();
      return null;
    }

    return user as User;
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
 * Update user profile
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
    const user = await prisma.user.update({
      where: {id: userId},
      data: updates,
      select: {
        id: true,
        email: true,
        displayName: true,
        subscriptionTier: true,
        onboardingCompleted: true,
      },
    });

    return user as User;
  } catch (error) {
    console.error('Update profile error:', error);
    return null;
  }
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{success: boolean; error?: string}> {
  try {
    const user = await prisma.user.findUnique({
      where: {id: userId},
      select: {passwordHash: true},
    });

    if (!user) {
      return {success: false, error: 'User not found'};
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return {success: false, error: 'Current password is incorrect'};
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: {id: userId},
      data: {passwordHash: newPasswordHash},
    });

    return {success: true};
  } catch (error) {
    console.error('Change password error:', error);
    return {success: false, error: 'Failed to change password'};
  }
}

