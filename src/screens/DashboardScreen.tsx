import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  MaterialCommunityIcons,
  Feather,
  Ionicons,
  FontAwesome5,
} from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { StatCard } from '../components/StatCard';
import { RoleBadge } from '../components/RoleBadge';
import { UserTable } from '../components/UserTable';
import { AuditLogTable } from '../components/AuditLogTable';
import { dbService } from '../services/database';
import { UserProfile, AuditLogEntry, UserRole } from '../types';

export const DashboardScreen: React.FC = () => {
  const { user, logout, allowedDomain, updateUserRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'directory' | 'admin'>('overview');
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load database users and audit logs
  const loadDatabaseData = async () => {
    setIsRefreshing(true);
    try {
      const [allUsers, logs] = await Promise.all([
        dbService.getUsers(),
        dbService.getAuditLogs(),
      ]);
      setUsersList(allUsers);
      setAuditLogs(logs);
    } catch (e) {
      console.warn('Error fetching database data:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, [user]);

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'admin';

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    if (updateUserRole) {
      await updateUserRole(userId, newRole);
      await loadDatabaseData();
    }
  };

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

  // Format date helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <Navbar
        user={user}
        onLogout={handleLogout}
        allowedDomain={allowedDomain}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          {/* Welcome Banner */}
          <View style={styles.welcomeBanner}>
            <View style={styles.welcomeTextGroup}>
              <View style={styles.badgeRow}>
                <RoleBadge role={user.role} />
                <View style={styles.domainVerifiedPill}>
                  <Ionicons name="checkmark-circle" size={13} color="#059669" />
                  <Text style={styles.domainVerifiedText}>
                    Verified Domain: @{allowedDomain}
                  </Text>
                </View>
              </View>

              <Text style={styles.welcomeTitle}>
                Welcome back, {user.name}
              </Text>
              <Text style={styles.welcomeSubtitle}>
                You are securely signed in with your official {allowedDomain} enterprise account.
              </Text>
            </View>

            <View style={styles.accountCardSnippet}>
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.bannerAvatar as any} />
              ) : (
                <View style={[styles.bannerAvatar, styles.bannerAvatarFallback]}>
                  <Text style={styles.fallbackInitial}>{user.name.charAt(0)}</Text>
                </View>
              )}
              <View>
                <Text style={styles.snippetEmail} numberOfLines={1}>{user.email}</Text>
                <Text style={styles.snippetDept}>{user.department}</Text>
              </View>
            </View>
          </View>

          {/* Metric Stats Cards */}
          <View style={styles.statsGrid}>
            <StatCard
              title="Access Policy"
              value={`@${allowedDomain}`}
              subtitle="Exclusively Authorized"
              iconName="shield-check"
              iconColor="#0D9488"
              iconBg="#F0FDFA"
            />
            <StatCard
              title="Account Role"
              value={isAdmin ? 'Administrator' : 'Standard User'}
              subtitle={isAdmin ? 'Full Management Privileges' : 'Member Workspace Access'}
              iconName={isAdmin ? 'shield-crown' : 'account-circle'}
              iconColor={isAdmin ? '#6366F1' : '#059669'}
              iconBg={isAdmin ? '#EEF2FF' : '#ECFDF5'}
            />
            <StatCard
              title="Authentication"
              value="Google OAuth 2.0"
              subtitle="PKCE Protocol Enforced"
              iconName="google"
              iconColor="#EA4335"
              iconBg="#FEF2F2"
            />
            <StatCard
              title="Verified Users"
              value={`${usersList.length} Members`}
              subtitle="Stored in Database"
              iconName="account-group"
              iconColor="#2563EB"
              iconBg="#EFF6FF"
            />
          </View>

          {/* Navigation Tabs */}
          <View style={styles.tabsBar}>
            <TouchableOpacity
              onPress={() => setActiveTab('overview')}
              style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
            >
              <MaterialCommunityIcons
                name="view-dashboard-outline"
                size={18}
                color={activeTab === 'overview' ? '#0D9488' : '#64748B'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'overview' && styles.tabTextActive,
                ]}
              >
                My Profile & Overview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('directory')}
              style={[styles.tabButton, activeTab === 'directory' && styles.tabButtonActive]}
            >
              <MaterialCommunityIcons
                name="account-multiple-outline"
                size={18}
                color={activeTab === 'directory' ? '#0D9488' : '#64748B'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'directory' && styles.tabTextActive,
                ]}
              >
                Team Directory ({usersList.length})
              </Text>
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity
                onPress={() => setActiveTab('admin')}
                style={[styles.tabButton, activeTab === 'admin' && styles.tabButtonActive]}
              >
                <MaterialCommunityIcons
                  name="shield-crown-outline"
                  size={18}
                  color={activeTab === 'admin' ? '#4F46E5' : '#64748B'}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'admin' && styles.tabTextActiveAdmin,
                  ]}
                >
                  Admin Console
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <View style={styles.tabContent}>
              <View style={styles.cardsRow}>
                {/* Profile Details Card */}
                <View style={styles.profileCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardHeaderTitle}>User Identity Profile</Text>
                    <RoleBadge role={user.role} size="small" />
                  </View>

                  <View style={styles.profileMain}>
                    {user.avatarUrl ? (
                      <Image source={{ uri: user.avatarUrl }} style={styles.largeAvatar as any} />
                    ) : (
                      <View style={[styles.largeAvatar, styles.bannerAvatarFallback]}>
                        <Text style={styles.largeAvatarInitial}>{user.name.charAt(0)}</Text>
                      </View>
                    )}
                    <View style={styles.profileMeta}>
                      <Text style={styles.profileName}>{user.name}</Text>
                      <Text style={styles.profileEmail}>{user.email}</Text>
                      <Text style={styles.profileDept}>{user.department}</Text>
                    </View>
                  </View>

                  <View style={styles.detailsList}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Email Domain</Text>
                      <Text style={styles.detailValue}>@{user.domain}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Domain Status</Text>
                      <Text style={[styles.detailValue, { color: '#059669', fontWeight: '700' }]}>
                        Verified Official Domain
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Role Privileges</Text>
                      <Text style={styles.detailValue}>
                        {isAdmin ? 'Administrator (Full Access)' : 'Standard User (Employee)'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Account Created</Text>
                      <Text style={styles.detailValue}>{formatDate(user.createdAt)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Last Login Session</Text>
                      <Text style={styles.detailValue}>{formatDate(user.lastLoginAt)}</Text>
                    </View>
                  </View>
                </View>

                {/* Domain Security Policy Card */}
                <View style={styles.policyCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardHeaderTitle}>Domain Security Policy</Text>
                    <MaterialCommunityIcons name="shield-check" size={20} color="#0D9488" />
                  </View>

                  <View style={styles.policyRuleBox}>
                    <Text style={styles.policyRuleTitle}>Target Domain Rule</Text>
                    <Text style={styles.policyRuleText}>
                      Only users with emails strictly ending in{' '}
                      <Text style={{ fontWeight: '800', color: '#0F766E' }}>
                        @{allowedDomain}
                      </Text>{' '}
                      are authorized to log in.
                    </Text>
                  </View>

                  <View style={styles.policyChecks}>
                    <View style={styles.policyCheckItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#059669" />
                      <Text style={styles.policyCheckText}>
                        <Text style={{ fontWeight: '700' }}>Allowed:</Text> user@{allowedDomain}
                      </Text>
                    </View>
                    <View style={styles.policyCheckItem}>
                      <Ionicons name="close-circle" size={18} color="#DC2626" />
                      <Text style={styles.policyCheckText}>
                        <Text style={{ fontWeight: '700', color: '#DC2626' }}>Restricted:</Text>{' '}
                        user@gmail.com, yahoo.com, etc.
                      </Text>
                    </View>
                    <View style={styles.policyCheckItem}>
                      <Ionicons name="lock-closed" size={18} color="#0284C7" />
                      <Text style={styles.policyCheckText}>
                        Unauthorized attempts are immediately blocked & logged in Security Audit.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.quickLinksBox}>
                    <Text style={styles.quickLinksTitle}>Quick Health & Fitness Workspace</Text>
                    <View style={styles.linksGrid}>
                      <View style={styles.linkItem}>
                        <FontAwesome5 name="dumbbell" size={14} color="#0D9488" />
                        <Text style={styles.linkText}>Workout Plans</Text>
                      </View>
                      <View style={styles.linkItem}>
                        <MaterialCommunityIcons name="nutrition" size={16} color="#0D9488" />
                        <Text style={styles.linkText}>Nutrition AI</Text>
                      </View>
                      <View style={styles.linkItem}>
                        <Feather name="activity" size={14} color="#0D9488" />
                        <Text style={styles.linkText}>Vitals Tracking</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* TAB 2: DIRECTORY */}
          {activeTab === 'directory' && (
            <View style={styles.tabContent}>
              <UserTable
                users={usersList}
                currentUserId={user.id}
                onUpdateRole={handleUpdateRole}
              />
            </View>
          )}

          {/* TAB 3: ADMIN CONSOLE */}
          {activeTab === 'admin' && isAdmin && (
            <View style={styles.tabContent}>
              {/* Admin Console Header */}
              <View style={styles.adminBanner}>
                <MaterialCommunityIcons name="shield-crown" size={24} color="#4F46E5" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.adminBannerTitle}>
                    Administrator Security Center
                  </Text>
                  <Text style={styles.adminBannerSubtitle}>
                    Manage employee roles, inspect domain verification logs, and review security events.
                  </Text>
                </View>
              </View>

              {/* User Management Table */}
              <UserTable
                users={usersList}
                currentUserId={user.id}
                onUpdateRole={handleUpdateRole}
              />

              {/* Real-Time Security Audit Logs */}
              <AuditLogTable logs={auditLogs} onRefresh={loadDatabaseData} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  welcomeBanner: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
      default: {
        elevation: 1,
      },
    }),
  },
  welcomeTextGroup: {
    flex: 1,
    minWidth: 260,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  domainVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  domainVerifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  accountCardSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bannerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#0D9488',
  },
  bannerAvatarFallback: {
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackInitial: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  snippetEmail: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    maxWidth: 180,
  },
  snippetDept: {
    fontSize: 11,
    color: '#64748B',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 20,
  },
  tabsBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
    marginBottom: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  tabButtonActive: {
    borderBottomColor: '#0D9488',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0D9488',
    fontWeight: '700',
  },
  tabTextActiveAdmin: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  tabContent: {
    width: '100%',
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  profileCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
      default: {
        elevation: 1,
      },
    }),
  },
  policyCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
      default: {
        elevation: 1,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  profileMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 18,
  },
  largeAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#0D9488',
  },
  largeAvatarInitial: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 24,
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  profileDept: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '600',
    marginTop: 4,
  },
  detailsList: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
  },
  policyRuleBox: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  policyRuleTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  policyRuleText: {
    fontSize: 13,
    color: '#134E4A',
    lineHeight: 18,
  },
  policyChecks: {
    gap: 10,
    marginBottom: 16,
  },
  policyCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  policyCheckText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
    lineHeight: 16,
  },
  quickLinksBox: {
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  quickLinksTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  linksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  linkText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  adminBanner: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  adminBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3730A3',
  },
  adminBannerSubtitle: {
    fontSize: 12,
    color: '#4F46E5',
    marginTop: 2,
    lineHeight: 16,
  },
});
