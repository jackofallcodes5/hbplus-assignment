import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { UserProfile, AuditLogEntry, UserRole } from '../types';

const STORAGE_KEYS = {
  USERS: '@hbplus_db_users',
  AUDIT_LOGS: '@hbplus_db_audit_logs',
  SESSION: '@hbplus_session',
};

// Seed users for demonstration and testing of Role-based access
const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-001',
    name: 'Sarah Connor',
    email: 'sarah.connor@hbplus.fit',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: 'admin',
    department: 'Executive Leadership',
    createdAt: '2026-01-10T08:00:00Z',
    lastLoginAt: '2026-03-24T10:15:00Z',
    status: 'active',
    domain: 'hbplus.fit',
    authProvider: 'google',
  },
  {
    id: 'user-002',
    name: 'Marcus Vance',
    email: 'marcus.vance@hbplus.fit',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'user',
    department: 'Health Tech & AI',
    createdAt: '2026-02-15T09:30:00Z',
    lastLoginAt: '2026-03-25T14:20:00Z',
    status: 'active',
    domain: 'hbplus.fit',
    authProvider: 'google',
  },
  {
    id: 'user-003',
    name: 'Elena Rostova',
    email: 'elena.rostova@hbplus.fit',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'user',
    department: 'Product Operations',
    createdAt: '2026-03-01T11:00:00Z',
    lastLoginAt: '2026-03-25T16:45:00Z',
    status: 'active',
    domain: 'hbplus.fit',
    authProvider: 'google',
  },
];

const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    email: 'sarah.connor@hbplus.fit',
    domain: 'hbplus.fit',
    status: 'ALLOWED',
    reason: 'Google OAuth Domain Verified',
    platform: Platform.OS as 'web' | 'android' | 'ios',
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    email: 'intruder@external-corp.com',
    domain: 'external-corp.com',
    status: 'DENIED',
    reason: 'Access restricted: Unauthorized domain',
    platform: Platform.OS as 'web' | 'android' | 'ios',
  },
];

class DatabaseService {
  private initialized = false;

  private async initializeIfNeeded(): Promise<void> {
    if (this.initialized) return;
    try {
      const usersData = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      if (!usersData) {
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      }

      const logsData = await AsyncStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (!logsData) {
        await AsyncStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(DEFAULT_AUDIT_LOGS));
      }
      this.initialized = true;
    } catch (e) {
      console.warn('Error initializing mock database:', e);
    }
  }

  // --- Users Database Operations ---

  async getUsers(): Promise<UserProfile[]> {
    await this.initializeIfNeeded();
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  }

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    const users = await this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async saveOrUpdateUser(profile: Partial<UserProfile> & { email: string }): Promise<UserProfile> {
    await this.initializeIfNeeded();
    const users = await this.getUsers();
    const cleanEmail = profile.email.toLowerCase().trim();
    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

    const now = new Date().toISOString();
    let updatedUser: UserProfile;

    if (existingIndex >= 0) {
      const existing = users[existingIndex];
      updatedUser = {
        ...existing,
        ...profile,
        lastLoginAt: now,
      };
      users[existingIndex] = updatedUser;
    } else {
      // Determine default role: admin if specified or email starts with admin
      const isInitialAdmin = cleanEmail.startsWith('admin') || cleanEmail.includes('admin@');
      updatedUser = {
        id: `user-${Date.now()}`,
        name: profile.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        avatarUrl: profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || cleanEmail)}&background=0D9488&color=fff`,
        role: profile.role || (isInitialAdmin ? 'admin' : 'user'),
        department: profile.department || 'Engineering',
        createdAt: now,
        lastLoginAt: now,
        status: 'active',
        domain: cleanEmail.split('@')[1] || 'hbplus.fit',
        authProvider: profile.authProvider || 'google',
      };
      users.unshift(updatedUser);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return updatedUser;
  }

  async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    const users = await this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index >= 0) {
      users[index].role = newRole;
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  }

  // --- Audit Log Operations ---

  async logAuthAttempt(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'platform'>): Promise<AuditLogEntry> {
    await this.initializeIfNeeded();
    try {
      const logs = await this.getAuditLogs();
      const newEntry: AuditLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        platform: Platform.OS as 'web' | 'android' | 'ios',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        ...entry,
      };
      logs.unshift(newEntry);
      // Keep recent 50 logs
      const trimmed = logs.slice(0, 50);
      await AsyncStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(trimmed));
      return newEntry;
    } catch (e) {
      console.warn('Failed to record audit log:', e);
      return {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        platform: Platform.OS as 'web' | 'android' | 'ios',
        ...entry,
      };
    }
  }

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    await this.initializeIfNeeded();
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : DEFAULT_AUDIT_LOGS;
    } catch {
      return DEFAULT_AUDIT_LOGS;
    }
  }

  // --- Session Storage ---

  async saveSession(user: UserProfile): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  }

  async getSession(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async clearSession(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
  }
}

export const dbService = new DatabaseService();
