import React, { createContext, useContext, useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { APP_CONFIG, RESTRICTED_DOMAIN_ERROR_MESSAGE } from '../config.js';
import { validateEmailDomain } from '../utils/domainValidator.js';
import {
  saveUserToDatabase,
  getLocalSession,
  clearSessionLocally,
  logAuthEvent,
  isSupabaseConnected,
} from '../services/supabase.js';

// Ensure redirect completes in browser popup
WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallbacks prevent Google.useAuthRequest from throwing invariant errors when .env is unconfigured
  const safeWebClientId =
    APP_CONFIG.GOOGLE_CLIENT_ID_WEB || 'placeholder-web.apps.googleusercontent.com';
  const safeIosClientId =
    APP_CONFIG.GOOGLE_CLIENT_ID_IOS || 'placeholder-ios.apps.googleusercontent.com';
  const safeAndroidClientId =
    APP_CONFIG.GOOGLE_CLIENT_ID_ANDROID || 'placeholder-android.apps.googleusercontent.com';

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: safeWebClientId,
    webClientId: safeWebClientId,
    iosClientId: safeIosClientId,
    androidClientId: safeAndroidClientId,
    scopes: ['profile', 'email'],
  });

  // 1. Session Restoration on App Launch
  useEffect(() => {
    async function restoreSession() {
      try {
        const storedUser = await getLocalSession();
        if (storedUser && storedUser.email) {
          // Re-verify session domain strictly against allowed domain
          const validation = validateEmailDomain(storedUser.email);
          if (validation.isValid) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            await clearSessionLocally();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.warn('Session restoration error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  // 2. Handle Google OAuth redirect response
  useEffect(() => {
    async function handleGoogleResponse() {
      if (response?.type === 'success' && response.authentication?.accessToken) {
        setIsLoading(true);
        setError(null);

        try {
          // Fetch Google User Profile using OAuth access token
          const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: {
              Authorization: `Bearer ${response.authentication.accessToken}`,
            },
          });

          if (!res.ok) {
            throw new Error('Could not fetch user profile from Google.');
          }

          const googleUser = await res.json();
          await authenticateUser({
            email: googleUser.email,
            name: googleUser.name || googleUser.email.split('@')[0],
            avatarUrl: googleUser.picture || '',
            authProvider: 'google',
          });
        } catch (err) {
          const msg = err.message || 'Google authentication failed.';
          setError(msg);
          await logAuthEvent({
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
        setError(response.error?.message || 'Google sign-in encountered an error.');
      } else if (response?.type === 'dismiss') {
        setIsLoading(false);
      }
    }

    if (response) {
      handleGoogleResponse();
    }
  }, [response]);

  /**
   * Internal Core Authentication & Domain Enforcement Function
   */
  const authenticateUser = async ({ email, name, avatarUrl, authProvider = 'google' }) => {
    setError(null);

    // Strict Domain Validation
    const validation = validateEmailDomain(email);

    if (!validation.isValid) {
      // Access Denied: Domain restriction triggered
      setError(validation.error || RESTRICTED_DOMAIN_ERROR_MESSAGE);

      await logAuthEvent({
        email,
        domain: validation.domain,
        status: 'DENIED',
        reason: validation.error || RESTRICTED_DOMAIN_ERROR_MESSAGE,
      });

      // Clear any partial session tokens
      await clearSessionLocally();
      setUser(null);
      setIsAuthenticated(false);

      return {
        success: false,
        error: validation.error || RESTRICTED_DOMAIN_ERROR_MESSAGE,
      };
    }

    // Access Allowed: Save user to Supabase DB & initialize active session
    const userProfile = await saveUserToDatabase({
      email,
      name: name || email.split('@')[0],
      avatarUrl: avatarUrl || '',
      authProvider,
    });

    await logAuthEvent({
      email,
      domain: validation.domain,
      status: 'ALLOWED',
      reason: 'Domain verified successfully',
    });

    setUser(userProfile);
    setIsAuthenticated(true);
    return { success: true, user: userProfile };
  };

  /**
   * Public Google Sign-In Trigger
   */
  const loginWithGoogle = async () => {
    setError(null);

    const hasClientId = Boolean(
      APP_CONFIG.GOOGLE_CLIENT_ID_WEB ||
      APP_CONFIG.GOOGLE_CLIENT_ID_IOS ||
      APP_CONFIG.GOOGLE_CLIENT_ID_ANDROID
    );

    if (!hasClientId) {
      return { requiresManualSelection: true };
    }

    try {
      setIsLoading(true);
      await promptAsync();
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Failed to initialize Google login prompt.');
      return { success: false, error: err.message };
    }
  };

  /**
   * Normal Email Sign-In (Subject to strict domain check)
   */
  const loginWithEmail = async (email, name = '') => {
    setIsLoading(true);
    try {
      const result = await authenticateUser({
        email,
        name: name || email.split('@')[0],
        avatarUrl: '',
        authProvider: 'email',
      });
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout Functionality
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      await clearSessionLocally();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (e) {
      console.warn('Logout error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        allowedDomain: APP_CONFIG.ALLOWED_DOMAIN,
        isSupabaseConnected: isSupabaseConnected(),
        loginWithGoogle,
        loginWithEmail,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
