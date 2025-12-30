/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the app.
 */

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  // TODO: Re-enable Google Sign-In after configuration
  // signInWithGoogle,
  // signOutFromGoogle,
  User,
  AuthResult,
} from '@services/auth/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, displayName?: string) => Promise<AuthResult>;
  // TODO: Re-enable Google Sign-In after configuration
  // loginWithGoogle: () => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    const result = await loginUser(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const handleRegister = async (
    email: string,
    password: string,
    displayName?: string,
  ): Promise<AuthResult> => {
    const result = await registerUser(email, password, displayName);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  // TODO: Re-enable Google Sign-In after configuration
  // const handleLoginWithGoogle = async (): Promise<AuthResult> => {
  //   const result = await signInWithGoogle();
  //   if (result.success && result.user) {
  //     setUser(result.user);
  //   }
  //   return result;
  // };

  const handleLogout = async () => {
    // TODO: Re-enable Google Sign-In after configuration
    // await signOutFromGoogle();
    await logoutUser();
    setUser(null);
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    // Update user profile via auth service
    if (user) {
      try {
        const updateData: {
          displayName?: string;
          preferredLanguage?: string;
          timezone?: string;
          onboardingCompleted?: boolean;
        } = {};
        
        if (userData.displayName !== undefined) {
          updateData.displayName = userData.displayName || undefined;
        }
        if (userData.email !== undefined) {
          // Email updates would need separate API endpoint
          // For now, just update displayName
        }
        
        const updatedUser = await updateUserProfile(user.id, updateData);
        if (updatedUser) {
          setUser(updatedUser);
        } else {
          // Fallback: update local state
          const updatedUserLocal = {...user, ...userData};
          setUser(updatedUserLocal);
        }
      } catch (error) {
        console.error('Error updating user profile:', error);
        // Still update local state for immediate UI feedback
        const updatedUser = {...user, ...userData};
        setUser(updatedUser);
      }
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: user !== null,
    login: handleLogin,
    register: handleRegister,
    // TODO: Re-enable Google Sign-In after configuration
    // loginWithGoogle: handleLoginWithGoogle,
    logout: handleLogout,
    refreshUser,
    updateUser: handleUpdateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

