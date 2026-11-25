import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { ErrorBanner } from '../components/ErrorBanner';
import { QuickTestSelector } from '../components/QuickTestSelector';
import { APP_CONFIG } from '../utils/config';

export const LoginScreen: React.FC = () => {
  const {
    loginWithGoogle,
    loginWithDemo,
    isLoading,
    error,
    clearError,
    allowedDomain,
  } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardContainer}>
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <FontAwesome5 name="heartbeat" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>HB+ SECURE PORTAL</Text>
            <Text style={styles.appTagline}>
              Internal Enterprise Access & Team Workspace
            </Text>

            {/* Allowed Domain Pill */}
            <View style={styles.domainBadge}>
              <MaterialCommunityIcons name="shield-lock" size={14} color="#0D9488" />
              <Text style={styles.domainBadgeText}>
                Authorized Domain: <Text style={styles.boldDomain}>@{allowedDomain}</Text>
              </Text>
            </View>
          </View>

          {/* Error Banner for Restricted Domain */}
          <ErrorBanner
            message={error}
            onDismiss={clearError}
            allowedDomain={allowedDomain}
          />

          {/* Primary Google Login Section */}
          <View style={styles.loginSection}>
            <Text style={styles.sectionTitle}>Sign in to your account</Text>
            <Text style={styles.sectionSubtitle}>
              Please use your official company Google Workspace account.
            </Text>

            <GoogleSignInButton
              onPress={loginWithGoogle}
              isLoading={isLoading}
              title="Sign in with Google"
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>QUICK DOMAIN VALIDATOR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Interactive Test Suite */}
          <QuickTestSelector
            onSelectAccount={(email, name, role) => loginWithDemo(email, name, role)}
            isLoading={isLoading}
            allowedDomain={allowedDomain}
          />

          {/* Security Features List */}
          <View style={styles.securityBox}>
            <View style={styles.securityItem}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#0D9488" />
              <Text style={styles.securityItemText}>
                OAuth 2.0 PKCE authentication flow
              </Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="lock-closed-outline" size={16} color="#0D9488" />
              <Text style={styles.securityItemText}>
                Strict domain verification gatekeeper
              </Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="finger-print-outline" size={16} color="#0D9488" />
              <Text style={styles.securityItemText}>
                Role-based access control & audit trail
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2026 {APP_CONFIG.ORGANIZATION_NAME}. All rights reserved.
            </Text>
            <Text style={styles.footerSubtext}>
              Unauthorized access attempts are logged and monitored.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        boxShadow:
          '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      default: {
        elevation: 4,
      },
    }),
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(13, 148, 136, 0.3)',
      },
      default: {
        elevation: 3,
      },
    }),
  },
  appName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.8,
  },
  appTagline: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  domainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 12,
  },
  domainBadgeText: {
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '500',
  },
  boldDomain: {
    fontWeight: '800',
    color: '#0D9488',
  },
  loginSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 17,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  securityBox: {
    marginTop: 18,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityItemText: {
    fontSize: 12,
    color: '#475569',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 10,
    color: '#CBD5E1',
    marginTop: 3,
    textAlign: 'center',
  },
});
