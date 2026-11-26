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

  // Handle Google Sign In click
  const handleGoogleClick = async () => {
    clearError();
    const result = await loginWithGoogle();
    if (result?.requiresManualSelection) {
      // If Google Client IDs are not yet in .env, open test chooser
      setShowTestModal(true);
    }
  };

  // Handle normal email sign in
  const handleNormalLogin = async () => {
    if (!normalEmail.trim()) return;
    clearError();
    await loginWithEmail(normalEmail.trim());
  };

  // Test modal selection
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
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <FontAwesome5 name="heartbeat" size={26} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>{APP_CONFIG.APP_NAME}</Text>
            <Text style={styles.appSubtitle}>Enterprise Internal Access Portal</Text>

            {/* Allowed Domain Info Badge (Dynamic from env) */}
            {allowedDomain ? (
              <View style={styles.domainBadge}>
                <MaterialCommunityIcons name="shield-check" size={14} color="#0D9488" />
                <Text style={styles.domainBadgeText}>
                  Authorized Domain: <Text style={styles.domainBadgeHighlight}>@{allowedDomain}</Text>
                </Text>
              </View>
            ) : null}
          </View>

          {/* Error Banner */}
          <ErrorBanner
            message={error}
            onDismiss={clearError}
            allowedDomain={allowedDomain}
          />

          {/* Primary Action: Google Sign In */}
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

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or normal login</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Normal Login Section */}
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

          {/* Database Status Footer */}
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

      {/* Interactive Account Chooser Modal (Reviewer / Demo convenience) */}
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

            {/* Allowed Account Option */}
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

            {/* Denied Account Option */}
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

            {/* Custom Email Input */}
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
    ...Platform.select({
      web: {
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
      },
      default: {
        elevation: 3,
      },
    }),
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
    ...Platform.select({
      web: {
        boxShadow: '0 6px 12px -2px rgba(13, 148, 136, 0.3)',
      },
      default: {
        elevation: 3,
      },
    }),
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
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
    letterSpacing: 0.5,
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
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 4px 6px -1px rgba(13, 148, 136, 0.2)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  normalLoginBtnDisabled: {
    opacity: 0.6,
  },
  normalLoginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
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
    lineHeight: 18,
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
    marginTop: 2,
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
