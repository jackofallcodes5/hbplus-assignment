export type UserRole = 'admin' | 'user';

export type UserStatus = 'active' | 'suspended';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  department: string;
  createdAt: string;
  lastLoginAt: string;
  status: UserStatus;
  domain: string;
  authProvider: 'google' | 'supabase' | 'demo';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  email: string;
  domain: string;
  status: 'ALLOWED' | 'DENIED';
  reason: string;
  platform: 'web' | 'android' | 'ios';
  userAgent?: string;
}

export interface DomainValidationResult {
  isValid: boolean;
  domain: string;
  allowedDomain: string;
  error?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  allowedDomain: string;
  loginWithGoogle: () => Promise<void>;
  loginWithDemo: (email: string, name?: string, role?: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUserRole?: (userId: string, newRole: UserRole) => Promise<void>;
}
