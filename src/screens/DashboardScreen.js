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
          {/* Minimal Avatar / Icon */}
          <View style={styles.avatarContainer}>
            <FontAwesome5 name="user-check" size={28} color="#0D9488" />
          </View>

          {/* Hello Greeting */}
          <Text style={styles.greetingTitle}>Hello, {displayName}!</Text>
          <Text style={styles.emailText}>{user.email}</Text>

          {/* Role & Database Badges */}
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

          {/* Logout Button */}
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
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
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
    letterSpacing: 0.5,
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
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
