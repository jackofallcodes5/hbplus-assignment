export const APP_CONFIG = {
  // Target official domain that is exclusively allowed access
  ALLOWED_DOMAIN: (process.env.EXPO_PUBLIC_ALLOWED_DOMAIN || 'hbplus.fit').trim().toLowerCase(),
  
  // Google OAuth Client IDs (PKCE Flow)
  GOOGLE_CLIENT_ID_WEB: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '',
  GOOGLE_CLIENT_ID_IOS: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '',
  GOOGLE_CLIENT_ID_ANDROID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '',
  
  // Supabase (optional backend & auth)
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',

  // App Metadata
  APP_NAME: 'HB+ Secure Portal',
  ORGANIZATION_NAME: 'HB+ Health & Fitness',
  APP_VERSION: '1.0.0',
};

export const RESTRICTED_DOMAIN_ERROR_MESSAGE =
  'Access restricted. Please login using your official domain email.';
