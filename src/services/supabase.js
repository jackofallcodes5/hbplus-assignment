import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { APP_CONFIG } from '../config.js';

const STORAGE_KEYS = {
  ACTIVE_SESSION: '@hbplus_session_user',
  LOCAL_USERS: '@hbplus_local_users',
  AUDIT_LOGS: '@hbplus_audit_logs',
};

// Initialize Supabase Client if credentials are provided in .env
let supabase = null;

if (APP_CONFIG.SUPABASE_URL && APP_CONFIG.SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(APP_CONFIG.SUPABASE_URL, APP_CONFIG.SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    console.log('[Supabase] Initialized database client successfully.');
  } catch (err) {
    console.warn('[Supabase] Initialization error:', err);
  }
}

export const isSupabaseConnected = () => Boolean(supabase);

/**
 * Determine default role (admin / user) based on environment list or default
 * @param {string} email
 * @returns {'admin' | 'user'}
 */
export function determineUserRole(email) {
  if (!email) return 'user';
  const cleanEmail = email.trim().toLowerCase();
  if (APP_CONFIG.ADMIN_EMAILS.includes(cleanEmail)) {
    return 'admin';
  }
  return 'user';
}

/**
 * Save / Upsert user profile to Supabase Database (with local storage fallback)
 * @param {Object} userProfile
 * @returns {Promise<Object>}
 */
export async function saveUserToDatabase(userProfile) {
  const timestamp = new Date().toISOString();
  const role = userProfile.role || determineUserRole(userProfile.email);

  const payload = {
    id: userProfile.id || `user_${Date.now()}`,
    email: userProfile.email.toLowerCase().trim(),
    name: userProfile.name || userProfile.email.split('@')[0],
    avatar_url: userProfile.avatarUrl || userProfile.avatar_url || '',
    role: role,
    auth_provider: userProfile.authProvider || 'google',
    last_login_at: timestamp,
  };

  // 1. If Supabase is connected, save directly to Supabase DB table 'users'
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(payload, { onConflict: 'email' })
        .select()
        .single();

      if (error) {
        console.warn('[Supabase] Upsert error (falling back to local):', error.message);
      } else if (data) {
        await persistSessionLocally({ ...payload, ...data });
        return { ...payload, ...data };
      }
    } catch (e) {
      console.warn('[Supabase] Database call failed:', e);
    }
  }

  // 2. Local AsyncStorage fallback ensuring full offline reliability
  try {
    const existingRaw = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_USERS);
    const users = existingRaw ? JSON.parse(existingRaw) : [];
    const index = users.findIndex((u) => u.email === payload.email);

    if (index >= 0) {
      users[index] = { ...users[index], ...payload };
    } else {
      payload.created_at = timestamp;
      users.push(payload);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_USERS, JSON.stringify(users));
  } catch (err) {
    console.warn('[Storage] Failed to save local user cache:', err);
  }

  await persistSessionLocally(payload);
  return payload;
}

/**
 * Save active session locally
 */
export async function persistSessionLocally(user) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(user));
  } catch (e) {
    console.warn('[Storage] Failed to persist session:', e);
  }
}

/**
 * Retrieve active session locally
 */
export async function getLocalSession() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('[Storage] Failed to read session:', e);
    return null;
  }
}

/**
 * Clear session upon logout
 */
export async function clearSessionLocally() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
  } catch (e) {
    console.warn('[Storage] Failed to clear session:', e);
  }
}

/**
 * Log authentication attempt (allowed or denied) to Supabase / local audit table
 */
export async function logAuthEvent({ email, domain, status, reason }) {
  const logEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: (email || 'unknown').toLowerCase(),
    domain: domain || 'unknown',
    status: status, // 'ALLOWED' or 'DENIED'
    reason: reason || '',
    platform: Platform.OS,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      await supabase.from('audit_logs').insert([logEntry]);
    } catch (e) {
      // Fallback silently if table does not exist
    }
  }

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    const logs = raw ? JSON.parse(raw) : [];
    logs.unshift(logEntry);
    // Keep last 50 entries
    if (logs.length > 50) logs.pop();
    await AsyncStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  } catch (e) {
    // Ignore audit log storage errors
  }
}

export { supabase };
