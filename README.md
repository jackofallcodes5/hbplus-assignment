# HB+ Secure Portal

> **Production Deployment (Netlify)**: [https://hbplusassessmentgaurang.netlify.app](https://hbplusassessmentgaurang.netlify.app)

A secure cross-platform **React Native (Web & Mobile)** application written in **JavaScript**, featuring **Google OAuth 2.0**, strict **Dynamic Domain Restriction**, **Protected Routing**, and **Supabase Database** integration.

---

## 🌐 B. Deployment Link

* **Live Web Application**: [https://hbplusassessmentgaurang.netlify.app](https://hbplusassessmentgaurang.netlify.app)
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

# Google OAuth 2.0 Client IDs (from Google Cloud Console)
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your-android-client-id.apps.googleusercontent.com

# Supabase Database Credentials (from supabase.com project settings)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
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
1. **Trigger**: User clicks the Google Sign-In button or enters their official email in the login form.
2. **OAuth / Input Processing**: Retrieves the authenticated email and profile details.
3. **Domain Gatekeeper Check**: Compares the user's email domain against the dynamically loaded official domain from `EXPO_PUBLIC_ALLOWED_DOMAIN`.
4. **Allowed Domain (`@hbplus.fit`)**:
   - Access granted.
   - User profile saved/updated in Supabase `public.users`.
   - Security audit event recorded as `ALLOWED` in `public.audit_logs`.
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

The domain validation logic is implemented in [`src/utils/domainValidator.js`](src/utils/domainValidator.js) with **zero hardcoded values**:

- **Dynamic Evaluation**: The target domain is read dynamically from `process.env.EXPO_PUBLIC_ALLOWED_DOMAIN` rather than being hardcoded.
- **Strict Substring Matching**: The logic extracts the exact domain portion following the last `@` symbol, preventing subdomain spoofing attacks (e.g. `user@hbplus.fit.attacker.com` is safely rejected).
- **Sanitization & Normalization**: Emails and domains are automatically trimmed of whitespace and converted to lowercase before evaluation.
- **Fail-Safe Revocation**: If an unauthorized email completes an OAuth handshake, credentials and tokens are immediately wiped from memory and local storage before any application state is updated.
- **Session Re-verification**: During app launch, any restored session from `AsyncStorage` is re-validated against the allowed domain to ensure past sessions remain authorized.

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
