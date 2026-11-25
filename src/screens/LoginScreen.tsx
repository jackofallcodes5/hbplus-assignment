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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
} from '@expo/vector-icons';
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

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');

  const hasClientId = Boolean(
    APP_CONFIG.GOOGLE_CLIENT_ID_WEB ||
    APP_CONFIG.GOOGLE_CLIENT_ID_IOS ||
    APP_CONFIG.GOOGLE_CLIENT_ID_ANDROID
  );

  const handleGoogleClick = () => {
    if (hasClientId) {
      loginWithGoogle();
    } else {
      setShowGoogleModal(true);
    }
  };

  const handleSelectAccount = (email: string, name: string) => {
    setShowGoogleModal(false);
    loginWithDemo(email, name);
  };

  const handleCustomAccountSubmit = () => {
    if (!customEmail.trim()) return;
    const email = customEmail.trim();
    const name = email.split('@')[0];
    setShowGoogleModal(false);
    setCustomEmail('');
    loginWithDemo(email, name);
  };

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
              onPress={handleGoogleClick}
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

      {/* Google Account Chooser Modal (Displays when real Client ID is not yet provided) */}
      <Modal
        visible={showGoogleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoogleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.googleIconHeader}>
                <Ionicons name="logo-google" size={24} color="#EA4335" />
                <Text style={styles.googleDialogTitle}>Sign in with Google</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowGoogleModal(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubheading}>
              Choose an account to continue to <Text style={{ fontWeight: '700' }}>HB+ Secure Portal</Text>
            </Text>

            <View style={styles.accountList}>
              {/* Account 1: Official Allowed Domain */}
              <TouchableOpacity
                style={styles.accountOption}
                onPress={() => handleSelectAccount(`alex.smith@${allowedDomain}`, 'Alex Smith')}
              >
                <View style={[styles.accountAvatar, { backgroundColor: '#0D9488' }]}>
                  <Text style={styles.avatarInitial}>A</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.accountOptionName}>Alex Smith</Text>
                  <Text style={styles.accountOptionEmail}>alex.smith@{allowedDomain}</Text>
                </View>
                <View style={styles.allowedTag}>
                  <Text style={styles.allowedTagText}>Official Domain</Text>
                </View>
              </TouchableOpacity>

              {/* Account 2: Restricted External Domain */}
              <TouchableOpacity
                style={styles.accountOption}
                onPress={() => handleSelectAccount('example@gmail.com', 'John Doe')}
              >
                <View style={[styles.accountAvatar, { backgroundColor: '#EA4335' }]}>
                  <Text style={styles.avatarInitial}>J</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.accountOptionName}>John Doe</Text>
                  <Text style={styles.accountOptionEmail}>example@gmail.com</Text>
                </View>
                <View style={styles.restrictedTag}>
                  <Text style={styles.restrictedTagText}>Personal Gmail</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Custom Account Input */}
            <View style={styles.customInputGroup}>
              <Text style={styles.customInputLabel}>Or enter another Google account:</Text>
              <View style={styles.customInputRow}>
                <TextInput
                  placeholder={`e.g. employee@${allowedDomain} or other@domain.com`}
                  placeholderTextColor="#94A3B8"
                  value={customEmail}
                  onChangeText={setCustomEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.customEmailInput}
                />
                <TouchableOpacity
                  style={[
                    styles.customContinueBtn,
                    !customEmail.trim() && styles.customContinueBtnDisabled,
                  ]}
                  disabled={!customEmail.trim()}
                  onPress={handleCustomAccountSubmit}
                >
                  <Text style={styles.customContinueText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.modalDisclaimer}>
              To continue, Google will verify your domain against organizational security policies.
            </Text>
          </View>
        </View>
      </Modal>
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
  // Google Account Chooser Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  googleIconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  googleDialogTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeBtn: {
    padding: 4,
  },
  modalSubheading: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 18,
    lineHeight: 18,
  },
  accountList: {
    gap: 8,
    marginBottom: 16,
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  accountAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  accountOptionName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  accountOptionEmail: {
    fontSize: 11,
    color: '#64748B',
  },
  allowedTag: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  allowedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  restrictedTag: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  restrictedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  customInputGroup: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    marginBottom: 14,
  },
  customInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  customEmailInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: '#1E293B',
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
    }),
  },
  customContinueBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customContinueBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  customContinueText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalDisclaimer: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
    textAlign: 'center',
  },
});
