import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { UserProfile, AuthContextType, UserRole } from '../types';
import { APP_CONFIG, RESTRICTED_DOMAIN_ERROR_MESSAGE } from '../utils/config';
import { validateEmailDomain } from '../utils/domainValidator';
import { dbService } from '../services/database';

// Complete auth session if redirected back to web
WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Configure Expo Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: APP_CONFIG.GOOGLE_CLIENT_ID_WEB || undefined,
    webClientId: APP_CONFIG.GOOGLE_CLIENT_ID_WEB || undefined,
    iosClientId: APP_CONFIG.GOOGLE_CLIENT_ID_IOS || undefined,
    androidClientId: APP_CONFIG.GOOGLE_CLIENT_ID_ANDROID || undefined,
    scopes: ['profile', 'email'],
  });

  // Restore existing session on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const storedUser = await dbService.getSession();
        if (storedUser) {
          // Re-verify stored session domain against allowed domain
          const validation = validateEmailDomain(storedUser.email, APP_CONFIG.ALLOWED_DOMAIN);
          if (validation.isValid) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // Revoke if domain is no longer permitted
            await dbService.clearSession();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (e) {
        console.error('Session restoration failed:', e);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  // Handle Google OAuth response from promptAsync
  useEffect(() => {
    async function handleGoogleResponse() {
      if (response?.type === 'success' && response.authentication?.accessToken) {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch Google user profile using the accessToken
          const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: { Authorization: `Bearer ${response.authentication.accessToken}` },
          });

          if (!userInfoResponse.ok) {
            throw new Error('Failed to retrieve user profile from Google.');
          }

          const googleUser = await userInfoResponse.json();
          await processAuthenticatedUser({
            email: googleUser.email,
            name: googleUser.name || googleUser.email.split('@')[0],
            avatarUrl: googleUser.picture,
            authProvider: 'google',
          });
        } catch (err: any) {
          const msg = err?.message || 'Authentication with Google failed.';
          setError(msg);
          await dbService.logAuthAttempt({
            email: 'unknown',
            domain: 'unknown',
            status: 'DENIED',
            reason: msg,
          });
        } finally {
          setIsLoading(false);
        }
      } else if (response?.type === 'error') {
        setIsLoading(false);
        setError(response.error?.message || 'Google sign-in was cancelled or encountered an error.');
      } else if (response?.type === 'dismiss') {
        setIsLoading(false);
      }
    }

    if (response) {
      handleGoogleResponse();
    }
  }, [response]);

  /**
   * Domain Verification Gatekeeper
   * Strictly verifies email domain before creating user profile or granting session
   */
  const processAuthenticatedUser = async (profileData: {
    email: string;
    name?: string;
    avatarUrl?: string;
    role?: UserRole;
    authProvider?: 'google' | 'supabase' | 'demo';
  }): Promise<boolean> => {
    const { email, name, avatarUrl, role, authProvider = 'google' } = profileData;

    // 1. Strict Domain Validation
    const validation = validateEmailDomain(email, APP_CONFIG.ALLOWED_DOMAIN);

    if (!validation.isValid) {
      // Access Denied: Record Security Audit Log
      await dbService.logAuthAttempt({
        email,
        domain: validation.domain || 'unknown',
        status: 'DENIED',
        reason: `Access restricted: Domain '${validation.domain || 'unknown'}' is not authorized. Must end with @${APP_CONFIG.ALLOWED_DOMAIN}`,
      });

      // Clear any remaining state
      setUser(null);
      setIsAuthenticated(false);
      setError(RESTRICTED_DOMAIN_ERROR_MESSAGE);
      return false;
    }

    // 2. Access Granted: Save or update user in database
    const savedUser = await dbService.saveOrUpdateUser({
      email,
      name: name || email.split('@')[0],
      avatarUrl,
      role: role || (email.toLowerCase().includes('admin') ? 'admin' : 'user'),
      authProvider,
      domain: validation.domain,
    });

    // 3. Record Audit Log for successful domain authentication
    await dbService.logAuthAttempt({
      email: savedUser.email,
      domain: validation.domain,
      status: 'ALLOWED',
      reason: `Google OAuth Domain Verified: Allowed access for @${validation.domain}`,
    });

    // 4. Save persistent session & update state
    await dbService.saveSession(savedUser);
    setUser(savedUser);
    setIsAuthenticated(true);
    setError(null);
    return true;
  };

  /**
   * Google Sign-In Trigger
   */
  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const hasClientId = Boolean(
      APP_CONFIG.GOOGLE_CLIENT_ID_WEB ||
      APP_CONFIG.GOOGLE_CLIENT_ID_IOS ||
      APP_CONFIG.GOOGLE_CLIENT_ID_ANDROID
    );

    if (hasClientId && request) {
      try {
        await promptAsync();
      } catch (err: any) {
        setIsLoading(false);
        setError(err?.message || 'Failed to initialize Google Sign-In.');
      }
    } else {
      // If client ID is not configured in environment, notify user
      setIsLoading(false);
      setError(
        'Google Client ID is not configured in .env. Please set EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB or use the interactive Google Sign-In test accounts below.'
      );
    }
  };

  /**
   * Demo / Test Account Login
   * Runs through the exact same Domain Validation Gatekeeper as real Google OAuth
   */
  const loginWithDemo = async (
    email: string,
    name?: string,
    role?: UserRole
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate OAuth network latency
      await new Promise((resolve) => setTimeout(resolve, 600));
      return await processAuthenticatedUser({
        email,
        name,
        role,
        authProvider: 'demo',
      });
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout Functionality
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (user) {
        await dbService.logAuthAttempt({
          email: user.email,
          domain: user.domain,
          status: 'ALLOWED',
          reason: 'User logged out',
        });
      }
      await dbService.clearSession();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const updateUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
    await dbService.updateUserRole(userId, newRole);
    if (user && user.id === userId) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      await dbService.saveSession(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        allowedDomain: APP_CONFIG.ALLOWED_DOMAIN,
        loginWithGoogle,
        loginWithDemo,
        logout,
        clearError,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
