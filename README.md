# HB+ Secure Portal

> **Production Deployment (Netlify)**: [https://hbplusassessmentgaurang.netlify.app](https://hbplusassessmentgaurang.netlify.app)

A secure cross-platform **React Native (Web & Mobile)** application written in **JavaScript**, featuring **Google OAuth 2.0**, strict **Dynamic Domain Restriction**, **Protected Routing**, and **Supabase Database** integration.

---

## 🌐 B. Deployment Link

* **Live Web App**: [https://hbplusassessmentgaurang.netlify.app](https://hbplusassessmentgaurang.netlify.app)
* **GitHub Repository**: [https://github.com/jackofallcodes5/hbplus-assignment](https://github.com/jackofallcodes5/hbplus-assignment)

---

## 📖 A. Core Documentation

### 1. Setup Instructions

#### Prerequisites
- Node.js (v18 or higher recommended, tested on Node v22)
- npm or bun

#### Step 1: Clone and Install
```bash
git clone https://github.com/jackofallcodes5/hbplus-assignment.git
cd hbplus-assignment
npm install
```

#### Step 2: Configure Environment Variables
Create a `.env` file in the project root:
```env
# Target official domain restricted exclusively for login access
EXPO_PUBLIC_ALLOWED_DOMAIN=hbplus.fit

# Admin email list (comma-separated) for Role-Based Access Control
EXPO_PUBLIC_ADMIN_EMAILS=admin@hbplus.fit

# Google OAuth 2.0 Client IDs (Google Cloud Console)
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your-android-client-id.apps.googleusercontent.com

# Supabase REST API (Project: toezjlwmafgdeaknkpgq)
EXPO_PUBLIC_SUPABASE_URL=https://toezjlwmafgdeaknkpgq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Direct PostgreSQL Database Connection String (Transaction Pooler)
DATABASE_URL=postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

#### Step 3: Supabase Database Schema
In your Supabase project's **SQL Editor**, run the following schema to initialize tables and Row Level Security (RLS):

```sql
-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    auth_provider TEXT DEFAULT 'google',
    last_login_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    domain TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ALLOWED', 'DENIED')),
    reason TEXT,
    platform TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Public Policies
CREATE POLICY "Allow anonymous read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow anonymous upsert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous read audit_logs" ON public.audit_logs FOR SELECT USING (true);
```

#### Step 4: Verify Database Connection
Verify that your database is reachable and configured properly:
```bash
npm run db:check
```

---

### 2. Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Login Page
    participant OAuth as Google OAuth / Normal Input
    participant Gatekeeper as Domain Gatekeeper
    participant Supabase as Supabase Database
    participant Dashboard as Protected Dashboard

    User->>UI: Click "Sign in with Google" or Normal Login
    UI->>OAuth: Request user credentials
    OAuth-->>UI: Return email & profile info
    UI->>Gatekeeper: validateEmailDomain(email, ALLOWED_DOMAIN)

    alt Email domain matches configured domain (e.g. employee@hbplus.fit)
        Gatekeeper-->>UI: ALLOWED
        UI->>Supabase: Save/Upsert user profile & log ALLOWED event
        UI->>Dashboard: Render Dashboard ("Hello [Name]!" + Log Out button)
    else Email belongs to external domain (e.g. example@gmail.com)
        Gatekeeper-->>UI: DENIED
        UI->>Supabase: Log DENIED security attempt in audit_logs
        UI->>UI: Discard session tokens immediately
        UI-->>User: Show Error: "Access restricted. Please login using your official domain email."
    end
```

#### Flow Summary:
1. **Trigger**: User clicks the Google Sign-In button or submits via the normal official email field.
2. **OAuth / Input Processing**: Retrieves authenticated email and profile details.
3. **Domain Gatekeeper Check**: Strictly compares the user's email domain against the dynamically loaded official domain from `EXPO_PUBLIC_ALLOWED_DOMAIN`.
4. **Allowed Domain (`@hbplus.fit`)**:
   - Access granted.
   - User profile saved/updated in Supabase `public.users`.
   - Security audit event recorded as `ALLOWED`.
   - State redirects to the protected Dashboard displaying `"Hello, [Name]!"` and a prominent **Log Out** button.
5. **Restricted Domain (`@gmail.com`, `@yahoo.com`, etc.)**:
   - Access denied.
   - Any active session tokens are wiped immediately.
   - Attempt logged as `DENIED` in Supabase `public.audit_logs`.
   - Required exact error banner displayed:
     > *"Access restricted. Please login using your official domain email."*
6. **Logout**:
   - Clicking **Log Out** clears persistent credentials from storage and returns the user to the login screen.
7. **Protected Route Guard**:
   - Direct web URL access to `#/dashboard` without an active authenticated session automatically redirects back to `#/login`.

---

### 3. How Domain Restriction Works

The validation logic is isolated in [`src/utils/domainValidator.js`](src/utils/domainValidator.js) with **zero hardcoded values**:

```javascript
import { APP_CONFIG, RESTRICTED_DOMAIN_ERROR_MESSAGE } from '../config.js';

export function validateEmailDomain(email, allowedDomainOverride = null) {
  // Domain dynamically read from environment variables
  const allowedDomain = (
    allowedDomainOverride !== null ? allowedDomainOverride : APP_CONFIG.ALLOWED_DOMAIN
  )
    .trim()
    .toLowerCase();

  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Please enter a valid email address.', domain: null };
  }

  const cleanEmail = email.trim().toLowerCase();
  const atIndex = cleanEmail.lastIndexOf('@');

  if (atIndex <= 0 || atIndex === cleanEmail.length - 1) {
    return { isValid: false, error: 'Please enter a valid email address format.', domain: null };
  }

  const domain = cleanEmail.substring(atIndex + 1);

  // Strict domain match check
  if (domain !== allowedDomain) {
    return {
      isValid: false,
      error: RESTRICTED_DOMAIN_ERROR_MESSAGE, // "Access restricted. Please login using your official domain email."
      domain,
    };
  }

  return { isValid: true, error: null, domain };
}
```

#### Security Highlights:
- **No Hardcoding**: The allowed domain is configured via `EXPO_PUBLIC_ALLOWED_DOMAIN` in `.env`.
- **Normalization**: Automatically strips whitespace and converts emails and domains to lowercase before evaluation.
- **Spoofing Prevention**: Strict substring matching (`atIndex + 1`) prevents subdomain spoofing attacks (e.g. `user@hbplus.fit.attacker.com` is safely rejected).
- **Session Verification**: The domain is re-checked on app launch during session restoration from local storage.

---

## 💻 Running the App

### 1. Web Browser
```bash
npm run web
# Opens at http://localhost:8081
```

### 2. Android Emulator
```bash
npm run android
```

### 3. iOS Simulator (macOS)
```bash
npm run ios
```

### 4. Run Automated Unit Tests
```bash
npm test
# Executes 7 automated test suites for domain verification using Node's native test runner
```

---

## 📦 Building Standalone App Files (APK & iOS IPA)

### Android APK (Direct installable file)
```bash
# Cloud build via EAS (Generates direct .apk download link)
npx eas-cli build -p android --profile preview

# Or local build using Gradle:
npx expo prebuild
cd android && ./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

### iOS App (.ipa / Simulator build)
```bash
npx eas-cli build -p ios --profile preview
```

---

## 📂 Project Structure

```
├── App.js                          # Root navigator with protected route guards
├── index.js                        # Root entry point
├── netlify.toml                    # Netlify deployment configuration & SPA redirects
├── package.json                    # Dependencies & scripts
├── scripts/
│   └── db-check.js                 # Database health & tables inspection script
└── src/
    ├── config.js                   # Dynamic environment variable loader
    ├── components/
    │   ├── ErrorBanner.js          # Domain restriction error alert banner
    │   └── GoogleSignInButton.js   # Official Google-branded sign-in button
    ├── context/
    │   └── AuthContext.js          # Central authentication, OAuth & Supabase sync state
    ├── screens/
    │   ├── DashboardScreen.js      # Minimal Dashboard ("Hello, [Name]!" + Log Out button)
    │   └── LoginScreen.js          # Login page with Google OAuth, normal login, and test chooser
    ├── services/
    │   └── supabase.js             # Supabase client, persistence, and audit logging
    └── utils/
        ├── domainValidator.js      # Core domain validation logic
        └── domainValidator.test.js # Unit test suite
```

---

## 📜 Complete Code Reference

### 1. `src/config.js`
```javascript
export const APP_CONFIG = {
  ALLOWED_DOMAIN: (process.env.EXPO_PUBLIC_ALLOWED_DOMAIN || '').trim().toLowerCase(),
  GOOGLE_CLIENT_ID_WEB: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '',
  GOOGLE_CLIENT_ID_IOS: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '',
  GOOGLE_CLIENT_ID_ANDROID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '',
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  ADMIN_EMAILS: (process.env.EXPO_PUBLIC_ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  APP_NAME: 'HB+ Secure Portal',
};

export const RESTRICTED_DOMAIN_ERROR_MESSAGE =
  'Access restricted. Please login using your official domain email.';
```

### 2. `src/utils/domainValidator.js`
```javascript
import { APP_CONFIG, RESTRICTED_DOMAIN_ERROR_MESSAGE } from '../config.js';

export function validateEmailDomain(email, allowedDomainOverride = null) {
  const allowedDomain = (
    allowedDomainOverride !== null ? allowedDomainOverride : APP_CONFIG.ALLOWED_DOMAIN
  )
    .trim()
    .toLowerCase();

  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Please enter a valid email address.', domain: null };
  }

  const cleanEmail = email.trim().toLowerCase();
  const atIndex = cleanEmail.lastIndexOf('@');

  if (atIndex <= 0 || atIndex === cleanEmail.length - 1) {
    return { isValid: false, error: 'Please enter a valid email address format.', domain: null };
  }

  const domain = cleanEmail.substring(atIndex + 1);

  if (!allowedDomain) {
    return {
      isValid: false,
      error: 'Official allowed domain is not configured. Please set EXPO_PUBLIC_ALLOWED_DOMAIN in .env',
      domain,
    };
  }

  if (domain !== allowedDomain) {
    return { isValid: false, error: RESTRICTED_DOMAIN_ERROR_MESSAGE, domain };
  }

  return { isValid: true, error: null, domain };
}

export function extractDomain(email) {
  if (!email || typeof email !== 'string') return '';
  const atIndex = email.lastIndexOf('@');
  return atIndex !== -1 ? email.substring(atIndex + 1).toLowerCase().trim() : '';
}
```

### 3. `src/screens/DashboardScreen.js`
```javascript
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext.js';

export const DashboardScreen = () => {
  const { user, logout, isSupabaseConnected } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) {
        logout();
      }
    } else {
      Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout },
      ]);
    }
  };

  const displayName = user.name || user.email?.split('@')[0] || 'User';
  const role = user.role || 'user';
  const isAdmin = role === 'admin';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <FontAwesome5 name="user-check" size={28} color="#0D9488" />
          </View>

          <Text style={styles.greetingTitle}>Hello, {displayName}!</Text>
          <Text style={styles.emailText}>{user.email}</Text>

          <View style={styles.badgeRow}>
            <View
              style={[
                styles.roleBadge,
                isAdmin ? styles.adminBadge : styles.userBadge,
              ]}
            >
              <MaterialCommunityIcons
                name={isAdmin ? 'shield-crown' : 'account'}
                size={14}
                color={isAdmin ? '#6D28D9' : '#0F766E'}
              />
              <Text
                style={[
                  styles.roleBadgeText,
                  isAdmin ? styles.adminBadgeText : styles.userBadgeText,
                ]}
              >
                {isAdmin ? 'Admin' : 'Member'}
              </Text>
            </View>

            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isSupabaseConnected ? '#10B981' : '#3B82F6' },
                ]}
              />
              <Text style={styles.statusBadgeText}>
                {isSupabaseConnected ? 'Supabase Synced' : 'Authenticated'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="logout-variant" size={20} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      },
      default: {
        elevation: 3,
      },
    }),
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 18,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  adminBadge: {
    backgroundColor: '#EDE9FE',
  },
  userBadge: {
    backgroundColor: '#F0FDFA',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  adminBadgeText: {
    color: '#6D28D9',
  },
  userBadgeText: {
    color: '#0F766E',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    gap: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
```

### 4. `src/screens/LoginScreen.js`
```javascript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext.js';
import { GoogleSignInButton } from '../components/GoogleSignInButton.js';
import { ErrorBanner } from '../components/ErrorBanner.js';
import { APP_CONFIG } from '../config.js';

export const LoginScreen = () => {
  const {
    loginWithGoogle,
    loginWithEmail,
    isLoading,
    error,
    clearError,
    allowedDomain,
    isSupabaseConnected,
  } = useAuth();

  const [normalEmail, setNormalEmail] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [modalCustomEmail, setModalCustomEmail] = useState('');

  const hasGoogleClientId = Boolean(
    APP_CONFIG.GOOGLE_CLIENT_ID_WEB ||
    APP_CONFIG.GOOGLE_CLIENT_ID_IOS ||
    APP_CONFIG.GOOGLE_CLIENT_ID_ANDROID
  );

  const handleGoogleClick = async () => {
    clearError();
    const result = await loginWithGoogle();
    if (result?.requiresManualSelection) {
      setShowTestModal(true);
    }
  };

  const handleNormalLogin = async () => {
    if (!normalEmail.trim()) return;
    clearError();
    await loginWithEmail(normalEmail.trim());
  };

  const handleSelectTestAccount = async (testEmail) => {
    setShowTestModal(false);
    await loginWithEmail(testEmail);
  };

  const handleCustomModalSubmit = async () => {
    if (!modalCustomEmail.trim()) return;
    const emailToTest = modalCustomEmail.trim();
    setShowTestModal(false);
    setModalCustomEmail('');
    await loginWithEmail(emailToTest);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardContainer}>
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <FontAwesome5 name="heartbeat" size={26} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>{APP_CONFIG.APP_NAME}</Text>
            <Text style={styles.appSubtitle}>Enterprise Internal Access Portal</Text>

            {allowedDomain ? (
              <View style={styles.domainBadge}>
                <MaterialCommunityIcons name="shield-check" size={14} color="#0D9488" />
                <Text style={styles.domainBadgeText}>
                  Authorized Domain: <Text style={styles.domainBadgeHighlight}>@{allowedDomain}</Text>
                </Text>
              </View>
            ) : null}
          </View>

          <ErrorBanner
            message={error}
            onDismiss={clearError}
            allowedDomain={allowedDomain}
          />

          <View style={styles.section}>
            <GoogleSignInButton
              onPress={handleGoogleClick}
              disabled={isLoading}
              isLoading={isLoading && hasGoogleClientId}
            />

            {!hasGoogleClientId ? (
              <TouchableOpacity
                onPress={() => setShowTestModal(true)}
                style={styles.quickTestPill}
              >
                <Ionicons name="flask-outline" size={14} color="#0D9488" />
                <Text style={styles.quickTestPillText}>
                  One-Click Domain Test Accounts
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or normal login</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.normalLoginSection}>
            <Text style={styles.inputLabel}>Official Domain Email</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color="#94A3B8"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder={allowedDomain ? `example@${allowedDomain}` : 'user@official-domain.com'}
                placeholderTextColor="#94A3B8"
                value={normalEmail}
                onChangeText={(text) => {
                  setNormalEmail(text);
                  if (error) clearError();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                onSubmitEditing={handleNormalLogin}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.normalLoginBtn,
                (!normalEmail.trim() || isLoading) && styles.normalLoginBtnDisabled,
              ]}
              onPress={handleNormalLogin}
              disabled={!normalEmail.trim() || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.normalLoginBtnText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footerInfo}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isSupabaseConnected ? '#10B981' : '#F59E0B' },
              ]}
            />
            <Text style={styles.footerText}>
              {isSupabaseConnected
                ? 'Connected to Supabase Database'
                : 'Local Database Mode (Supabase URL unconfigured)'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showTestModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTestModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="shield-checkmark" size={22} color="#0D9488" />
                <Text style={styles.modalTitle}>Domain Gatekeeper Test</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowTestModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Simulate Google OAuth responses to verify allowed vs. restricted access:
            </Text>

            <TouchableOpacity
              style={[styles.accountOption, styles.allowedOption]}
              onPress={() =>
                handleSelectTestAccount(`employee@${allowedDomain || 'hbplus.fit'}`)
              }
            >
              <View style={styles.accountIconGreen}>
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
              </View>
              <View style={styles.accountTextContainer}>
                <View style={styles.tagRow}>
                  <Text style={styles.accountName}>Official Employee</Text>
                  <View style={styles.allowedTag}>
                    <Text style={styles.allowedTagText}>ALLOWED</Text>
                  </View>
                </View>
                <Text style={styles.accountEmail}>
                  employee@{allowedDomain || 'hbplus.fit'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.accountOption, styles.deniedOption]}
              onPress={() => handleSelectTestAccount('example@gmail.com')}
            >
              <View style={styles.accountIconRed}>
                <Ionicons name="close-circle" size={20} color="#DC2626" />
              </View>
              <View style={styles.accountTextContainer}>
                <View style={styles.tagRow}>
                  <Text style={styles.accountName}>Public Email User</Text>
                  <View style={styles.deniedTag}>
                    <Text style={styles.deniedTagText}>DENIED</Text>
                  </View>
                </View>
                <Text style={styles.accountEmail}>example@gmail.com</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.customInputSection}>
              <Text style={styles.customLabel}>Or test custom email:</Text>
              <View style={styles.customInputRow}>
                <TextInput
                  style={styles.customTextInput}
                  placeholder="name@any-domain.com"
                  placeholderTextColor="#94A3B8"
                  value={modalCustomEmail}
                  onChangeText={setModalCustomEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TouchableOpacity
                  style={styles.customTestBtn}
                  onPress={handleCustomModalSubmit}
                >
                  <Text style={styles.customTestBtnText}>Test</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  appSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 12,
  },
  domainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 6,
  },
  domainBadgeText: {
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '500',
  },
  domainBadgeHighlight: {
    fontWeight: '700',
    color: '#0D9488',
  },
  section: {
    width: '100%',
    alignItems: 'center',
  },
  quickTestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F0FDFA',
    gap: 6,
  },
  quickTestPillText: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  normalLoginSection: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#CBD5E1',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    outlineStyle: 'none',
  },
  normalLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 13,
    gap: 6,
  },
  normalLoginBtnDisabled: {
    opacity: 0.6,
  },
  normalLoginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  allowedOption: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  deniedOption: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  accountIconGreen: {
    marginRight: 12,
  },
  accountIconRed: {
    marginRight: 12,
  },
  accountTextContainer: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  allowedTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  allowedTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  deniedTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  deniedTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#991B1B',
  },
  accountEmail: {
    fontSize: 12,
    color: '#64748B',
  },
  customInputSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  customLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  customTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: '#F8FAFC',
    outlineStyle: 'none',
  },
  customTestBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  customTestBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
```

### 5. `App.js`
```javascript
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/context/AuthContext.js';
import { LoginScreen } from './src/screens/LoginScreen.js';
import { DashboardScreen } from './src/screens/DashboardScreen.js';

const RootNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (!isLoading) {
        if (isAuthenticated && user) {
          if (window.location.hash !== '#/dashboard') {
            window.history.replaceState(null, '', '#/dashboard');
          }
        } else {
          if (window.location.hash !== '#/login') {
            window.history.replaceState(null, '', '#/login');
          }
        }
      }
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <View style={styles.logoBadge}>
          <FontAwesome5 name="heartbeat" size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.loadingTitle}>HB+ SECURE PORTAL</Text>
        <Text style={styles.loadingSubtitle}>Verifying security credentials...</Text>
        <ActivityIndicator size="large" color="#0D9488" style={styles.spinner} />
      </View>
    );
  }

  return isAuthenticated && user ? <DashboardScreen /> : <LoginScreen />;
};

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  loadingSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    marginBottom: 20,
  },
  spinner: {
    marginTop: 8,
  },
});
```
