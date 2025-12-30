/**
 * Authentication Service
 *
 * Handles user authentication, registration, and session management.
 * 
 * NOTE: Prisma cannot run in React Native (Node.js only).
 * This service uses AsyncStorage for local storage.
 * TODO: Replace with proper backend API integration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Re-enable Google Sign-In after configuration
// import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';

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
  IS_PREMIUM: '@salah_companion:is_premium',
};

// In-memory user store (temporary - replace with API)
const mockUsers: Map<string, {password: string; user: User}> = new Map();

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
    if (mockUsers.has(email)) {
      return {
        success: false,
        error: 'User with this email already exists',
      };
    }

    // Create user
    const user: User = {
      id: `user_${Date.now()}`,
      email,
      displayName: displayName || null,
      subscriptionTier: 'free',
      onboardingCompleted: false,
    };

    // Store user in memory (temporary - replace with API)
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
 * Login user
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

    // Simple password check (in production, use proper hashing via API)
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
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    displayName?: string;
    preferredLanguage?: string;
    timezone?: string;
    onboardingCompleted?: boolean;
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
 * Change user password
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

// TODO: Re-enable Google Sign-In after configuration
/**
 * Initialize Google Sign-In
 * Call this once when the app starts
 */
// export async function initializeGoogleSignIn(): Promise<void> {
//   try {
//     GoogleSignin.configure({
//       // Web client ID from Google Cloud Console
//       // TODO: Replace with your actual Web Client ID
//       webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
//       offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
//     });
//   } catch (error) {
//     console.error('Google Sign-In initialization error:', error);
//   }
// }

/**
 * Sign in with Google
 */
// export async function signInWithGoogle(): Promise<AuthResult> {
//   try {
//     // Check if Google Play Services are available
//     await GoogleSignin.hasPlayServices();
//
//     // Get user info from Google
//     const userInfo = await GoogleSignin.signIn();
//
//     if (!userInfo.data?.user) {
//       return {
//         success: false,
//         error: 'Failed to get user information from Google',
//       };
//     }
//
//     const googleUser = userInfo.data.user;
//     const email = googleUser.email;
//     const displayName = googleUser.name || null;
//
//     if (!email) {
//       return {
//         success: false,
//         error: 'Email not available from Google account',
//       };
//     }
//
//     // Check if user already exists
//     let user: User;
//     const existingUserData = mockUsers.get(email);
//
//     if (existingUserData) {
//       // User exists, use existing data
//       user = existingUserData.user;
//     } else {
//       // Create new user from Google account
//       user = {
//         id: `user_${Date.now()}`,
//         email,
//         displayName,
//         subscriptionTier: 'free',
//         onboardingCompleted: false,
//       };
//
//       // Store user in memory (no password for Google users)
//       mockUsers.set(email, {password: '', user});
//     }
//
//     // Store user data in AsyncStorage
//     await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.id);
//     await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
//
//     // Store Google access token if available
//     if (userInfo.data.idToken) {
//       await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, userInfo.data.idToken);
//     }
//
//     return {
//       success: true,
//       user,
//       token: userInfo.data.idToken,
//     };
//   } catch (error: any) {
//     console.error('Google Sign-In error:', error);
//
//     if (error.code === statusCodes.SIGN_IN_CANCELLED) {
//       return {
//         success: false,
//         error: 'Sign in was cancelled',
//       };
//     } else if (error.code === statusCodes.IN_PROGRESS) {
//       return {
//         success: false,
//         error: 'Sign in is already in progress',
//       };
//     } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
//       return {
//         success: false,
//         error: 'Google Play Services not available',
//       };
//     }
//
//     return {
//       success: false,
//       error: 'Failed to sign in with Google. Please try again.',
//     };
//   }
// }

/**
 * Sign out from Google
 */
// export async function signOutFromGoogle(): Promise<void> {
//   try {
//     await GoogleSignin.signOut();
//   } catch (error) {
//     console.error('Google Sign-Out error:', error);
//   }
// }
