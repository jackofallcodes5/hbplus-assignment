/**
 * Application Configuration
 * Loaded dynamically from environment variables.
 * No domains, secrets, or passwords are hardcoded in the source code.
 */

export const APP_CONFIG = {
  // Official allowed domain read exclusively from environment variables
  ALLOWED_DOMAIN: (process.env.EXPO_PUBLIC_ALLOWED_DOMAIN || '').trim().toLowerCase(),

  // Google OAuth 2.0 Client IDs
  GOOGLE_CLIENT_ID_WEB: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '',
  GOOGLE_CLIENT_ID_IOS: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '',
  GOOGLE_CLIENT_ID_ANDROID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '',

  // Supabase Database Connection
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',

  // Optional list of admin emails (comma-separated in env)
  ADMIN_EMAILS: (process.env.EXPO_PUBLIC_ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),

  // Application Details
  APP_NAME: 'HB+ Secure Portal',
  ORGANIZATION_NAME: 'HB+ Health & Fitness',
};

// Required exact error message for unauthorized domains
export const RESTRICTED_DOMAIN_ERROR_MESSAGE =
  'Access restricted. Please login using your official domain email.';
