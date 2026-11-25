import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { UserProfile } from '../types';
import { RoleBadge } from './RoleBadge';

interface NavbarProps {
  user: UserProfile;
  onLogout: () => void;
  allowedDomain: string;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, allowedDomain }) => {
  return (
    <View style={styles.container}>
      <View style={styles.brandSection}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>HB+</Text>
        </View>
        <View style={styles.brandTitles}>
          <Text style={styles.appName}>SECURE PORTAL</Text>
          <View style={styles.domainIndicator}>
            <View style={styles.dot} />
            <Text style={styles.domainText}>@{allowedDomain}</Text>
          </View>
        </View>
      </View>

      <View style={styles.userSection}>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {user.name}
          </Text>
          <RoleBadge role={user.role} size="small" />
        </View>

        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar as any} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={onLogout}
          style={styles.logoutButton}
          accessibilityLabel="Log out"
          accessibilityRole="button"
        >
          <Feather name="log-out" size={16} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        position: 'sticky' as any,
        top: 0,
        zIndex: 100,
      },
    }),
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    backgroundColor: '#0D9488',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  brandTitles: {
    justifyContent: 'center',
  },
  appName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.8,
  },
  domainIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  domainText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    alignItems: 'flex-end',
    ...Platform.select({
      default: {
        display: 'none',
      },
      web: {
        display: 'flex',
      },
    }),
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
    maxWidth: 160,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#0D9488',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
});
