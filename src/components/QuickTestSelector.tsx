import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { UserRole } from '../types';

interface QuickTestSelectorProps {
  onSelectAccount: (email: string, name: string, role?: UserRole) => void;
  isLoading: boolean;
  allowedDomain: string;
}

export const QuickTestSelector: React.FC<QuickTestSelectorProps> = ({
  onSelectAccount,
  isLoading,
  allowedDomain,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const testAccounts = [
    {
      name: 'Alex Smith',
      email: `alex.smith@${allowedDomain}`,
      role: 'user' as UserRole,
      type: 'allowed',
      label: 'Allowed Domain (User)',
      badgeColor: '#059669',
      badgeBg: '#ECFDF5',
    },
    {
      name: 'Clara Admin',
      email: `admin@${allowedDomain}`,
      role: 'admin' as UserRole,
      type: 'allowed',
      label: 'Allowed Domain (Admin)',
      badgeColor: '#4F46E5',
      badgeBg: '#EEF2FF',
    },
    {
      name: 'John Doe',
      email: 'example@gmail.com',
      role: 'user' as UserRole,
      type: 'restricted',
      label: 'Restricted Domain (@gmail.com)',
      badgeColor: '#DC2626',
      badgeBg: '#FEF2F2',
    },
    {
      name: 'External Contractor',
      email: 'contractor@yahoo.com',
      role: 'user' as UserRole,
      type: 'restricted',
      label: 'Restricted Domain (@yahoo.com)',
      badgeColor: '#DC2626',
      badgeBg: '#FEF2F2',
    },
  ];

  const handleCustomSubmit = () => {
    if (!customEmail.trim()) return;
    const clean = customEmail.trim();
    const name = clean.split('@')[0] || 'Custom User';
    const role: UserRole = clean.toLowerCase().includes('admin') ? 'admin' : 'user';
    onSelectAccount(clean, name, role);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <MaterialCommunityIcons name="shield-check" size={18} color="#0D9488" />
          <Text style={styles.title}>Domain Validation Test Suite</Text>
        </View>
        <Text style={styles.subtitle}>
          One-click simulation to test allowed vs restricted domain behavior
        </Text>
      </View>

      <View style={styles.accountsGrid}>
        {testAccounts.map((acc, index) => {
          const isAllowed = acc.type === 'allowed';
          return (
            <TouchableOpacity
              key={index}
              disabled={isLoading}
              activeOpacity={0.7}
              onPress={() => onSelectAccount(acc.email, acc.name, acc.role)}
              style={[
                styles.accountCard,
                isAllowed ? styles.allowedCard : styles.restrictedCard,
                isLoading && styles.cardDisabled,
              ]}
              accessibilityRole="button"
            >
              <View style={styles.accountTop}>
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: acc.badgeBg, borderColor: acc.badgeColor },
                  ]}
                >
                  <Ionicons
                    name={isAllowed ? 'checkmark-circle' : 'close-circle'}
                    size={12}
                    color={acc.badgeColor}
                  />
                  <Text style={[styles.typeText, { color: acc.badgeColor }]}>
                    {isAllowed ? 'ALLOWED' : 'RESTRICTED'}
                  </Text>
                </View>
                <Text style={styles.roleHint}>{acc.label}</Text>
              </View>

              <Text style={styles.accountEmail} numberOfLines={1}>
                {acc.email}
              </Text>
              <Text style={styles.accountName}>{acc.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom Email Input Toggle */}
      <View style={styles.customSection}>
        <TouchableOpacity
          onPress={() => setShowCustomInput(!showCustomInput)}
          style={styles.customToggle}
        >
          <MaterialCommunityIcons
            name={showCustomInput ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#64748B"
          />
          <Text style={styles.customToggleText}>
            {showCustomInput
              ? 'Hide custom email validator'
              : 'Test custom email address...'}
          </Text>
        </TouchableOpacity>

        {showCustomInput && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={`e.g. yourname@${allowedDomain} or test@domain.com`}
              placeholderTextColor="#94A3B8"
              value={customEmail}
              onChangeText={setCustomEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              onSubmitEditing={handleCustomSubmit}
            />
            <TouchableOpacity
              onPress={handleCustomSubmit}
              disabled={isLoading || !customEmail.trim()}
              style={[
                styles.submitButton,
                (!customEmail.trim() || isLoading) && styles.submitButtonDisabled,
              ]}
            >
              <Text style={styles.submitButtonText}>Test Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    width: '100%',
  },
  headerRow: {
    marginBottom: 14,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  accountsGrid: {
    gap: 10,
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      },
    }),
  },
  allowedCard: {
    borderColor: '#A7F3D0',
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  restrictedCard: {
    borderColor: '#FECACA',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  cardDisabled: {
    opacity: 0.6,
  },
  accountTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  roleHint: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  accountEmail: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  accountName: {
    fontSize: 12,
    color: '#64748B',
  },
  customSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  customToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  customToggleText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1E293B',
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
    }),
  },
  submitButton: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
