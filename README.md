# HB+ Secure Portal — Cross-Platform React Native Application

A cross-platform application built with **React Native** and **React Native for Web**, supporting **Mobile (Android & iOS)** and **Web (Desktop & Mobile Browsers)** from a single codebase.

The application implements **Google OAuth 2.0** authentication and enforces a strict zero-trust **Domain Gatekeeper** that restricts access exclusively to verified organization email domains (e.g., `@hbplus.fit`).

---

## 🚀 Key Features

### 1. Google OAuth 2.0 & Domain Verification Gatekeeper
* **Google Sign-In Button**: Follows official Google branding and design specifications with loading indicators.
* **Strict Domain Validation Engine**:
  * If `email` ends in `@hbplus.fit` (e.g., `sarah.connor@hbplus.fit`) ➔ **Access Granted** ➔ Generates authenticated session, updates database, and navigates to Dashboard.
  * If `email` belongs to any other domain (e.g., `example@gmail.com`, `contractor@yahoo.com`) ➔ **Access Denied** ➔ Revokes tokens immediately, logs security violation in database audit trail, and displays high-visibility alert:
    > *"Access restricted. Please login using your official domain email."*

### 2. Cross-Platform Single Codebase
* **Web (Desktop & Mobile Browsers)**: Full responsive web experience with URL hash synchronization (`#/login` ↔ `#/dashboard`).
* **Mobile (Android / iOS)**: Native gesture handling, safe area support, and deep-link authentication callback handlers.

### 3. Protected Routes & Route Guards
* Direct URL access without login is blocked; unauthenticated users trying to access `#/dashboard` or reload the page without an active session are intercepted and forced to the login page.
* Secure session persistence via `@react-native-async-storage/async-storage` with integrity verification on app cold-start.

### 4. Role-Based Access Control (RBAC) [Bonus]
* **Staff User**:
  * Personal profile overview with official `@hbplus.fit` domain verification badge.
  * Domain security policy details.
  * Searchable Team Directory.
* **Administrator**:
  * Full User Management console with real-time role toggles (`Make Admin` / `Make User`).
  * Live **Security & Authentication Audit Trail** tracking both `ALLOWED` and `DENIED` login attempts, attempted emails, timestamps, and platforms.

### 5. Persistent Database & Audit Trail [Bonus]
* User database storing team member profiles, roles, departments, account creation, and last login.
* Security Audit Log tracking every login attempt, success/failure status, platform, and policy verdict.
* Supabase integration client ready for cloud backend sync.

### 6. Interactive Domain Validation Test Suite
* Built directly into the Login screen so evaluators and reviewers can test all domain validation scenarios in seconds without needing Google Cloud OAuth credentials:
  * `alex.smith@hbplus.fit` ➔ Allowed Domain (Standard User)
  * `admin@hbplus.fit` ➔ Allowed Domain (Administrator)
  * `example@gmail.com` ➔ Restricted Domain (Triggers restriction error banner)
  * `contractor@yahoo.com` ➔ Restricted Domain (Triggers restriction error banner)
  * Custom email input to test any domain in real-time.

---

## 🛠 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React Native** (`0.88.1`) | Cross-platform core mobile framework |
| **React Native for Web** (`0.21.4`) | High-performance Web engine |
| **Expo SDK** (`58.0.26`) | Universal toolchain and runtime |
| **TypeScript** (`6.0.3`) | Strict end-to-end type safety |
| **expo-auth-session** | Google OAuth 2.0 PKCE authentication flow |
| **@react-native-async-storage/async-storage** | Persistent database & session store |
| **@supabase/supabase-js** | Optional cloud database & authentication |
| **@expo/vector-icons** | Universal icons across Web, iOS, and Android |

---

## 📁 Project Structure

```
├── App.tsx                      # Root Navigator with protected route guard & Web URL sync
├── app.json                     # Expo universal application configuration
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── .env.example                 # Environment variables template
├── src/
│   ├── components/
│   │   ├── GoogleSignInButton.tsx # Official Google-branded sign-in button
│   │   ├── ErrorBanner.tsx        # High-visibility domain restriction alert banner
│   │   ├── Navbar.tsx             # Responsive header with brand, domain pill & logout
│   │   ├── QuickTestSelector.tsx  # Interactive domain validator test suite
│   │   ├── RoleBadge.tsx          # Admin vs User visual indicator
│   │   ├── StatCard.tsx           # Dashboard metric cards
│   │   ├── UserTable.tsx          # Team directory & Admin role management table
│   │   └── AuditLogTable.tsx      # Security audit trail of allowed & blocked logins
│   ├── context/
│   │   └── AuthContext.tsx        # Authentication state, gatekeeper logic & session
│   ├── screens/
│   │   ├── LoginScreen.tsx        # Login page with Google OAuth & test accounts
│   │   └── DashboardScreen.tsx    # Protected dashboard with tabs (Overview, Directory, Admin)
│   ├── services/
│   │   ├── database.ts            # Persistent storage (users, audit logs, sessions)
│   │   └── supabase.ts            # Optional Supabase client & integration
│   ├── types/
│   │   └── index.ts               # Core TypeScript definitions (UserProfile, AuditLog, etc.)
│   └── utils/
│       ├── config.ts              # App configuration & environment fallbacks
│       ├── domainValidator.ts     # Domain validation gatekeeper engine
│       └── domainValidator.test.ts # Comprehensive automated unit test suite
```

---

## 🚦 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run on Web
```bash
npm run web
```
Opens in your browser at `http://localhost:8081`. You can test:
- Clicking **"Sign in with Google"**
- Using the **Domain Validation Test Suite** on the login page:
  - Tap `example@gmail.com` to see the restriction error: `"Access restricted. Please login using your official domain email."`
  - Tap `alex.smith@hbplus.fit` to log in as a standard user.
  - Tap `admin@hbplus.fit` to log in as an administrator.
  - Test custom email addresses in the expandable input.
- In the Dashboard:
  - View profile & domain verification status.
  - Browse the team directory.
  - (If Admin) Toggle user roles and inspect the real-time security audit log.
  - Click **Logout** to safely revoke session and return to login.

### 3. Run on Android
```bash
npm run android
```
*(Requires Android Studio & Android Emulator or physical device connected via ADB)*

### 4. Run on iOS
```bash
npm run ios
```
*(Requires macOS and Xcode)*

---

## 🧪 Running Automated Tests & Type Checking

### Run Unit Tests
```bash
npm test
```
Executes the domain validation test suite covering:
- Allowed official `@hbplus.fit` domain verification.
- Case-insensitivity and whitespace trimming.
- Rejection of `@gmail.com` with exact error message.
- Rejection of `@yahoo.com` and external domains.
- Prevention of subdomain spoofing (`user@hbplus.fit.evil.com`, `user@fakehbplus.fit`).
- Handling of malformed and empty inputs.

### Run TypeScript Verification
```bash
npx tsc --noEmit
```

### Build / Export for Web
```bash
npx expo export -p web
```

---

## ⚙️ Google Cloud & Supabase Configuration (Optional)

To connect your own Google Cloud OAuth 2.0 credentials or Supabase instance, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:
```ini
EXPO_PUBLIC_ALLOWED_DOMAIN=hbplus.fit
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=your-google-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=your-google-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your-google-android-client-id.apps.googleusercontent.com
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🔒 Security Architecture Highlights

1. **Gatekeeper Pattern**: Authentication and authorization are decoupled. Authenticating with Google only produces an identity candidate; the Gatekeeper must affirmatively verify that the domain strictly matches `ALLOWED_DOMAIN` before a session is granted.
2. **Immediate Revocation**: If an unauthorized domain is detected, credentials are wiped immediately, preventing memory leaks or token retention.
3. **Audit Trail**: Every authorization decision (success or failure) is immutably logged with timestamp, attempted email, detected domain, and reason for review in the Admin console.
4. **URL Protection**: Route guards prevent browser navigation to protected pages without an active, validated session.
