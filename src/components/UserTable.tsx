import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { UserProfile, UserRole } from '../types';
import { RoleBadge } from './RoleBadge';

interface UserTableProps {
  users: UserProfile[];
  currentUserId: string;
  onUpdateRole: (userId: string, newRole: UserRole) => Promise<void>;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  currentUserId,
  onUpdateRole,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );
  });

  const handleToggleRole = async (user: UserProfile) => {
    if (user.id === currentUserId) {
      alert('You cannot change your own admin role directly.');
      return;
    }
    const nextRole: UserRole = user.role === 'admin' ? 'user' : 'admin';
    setUpdatingId(user.id);
    try {
      await onUpdateRole(user.id, nextRole);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Team Directory & Role Management</Text>
          <Text style={styles.subtitle}>
            Users stored in database with active domain verification
          </Text>
        </View>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#94A3B8" />
          <TextInput
            placeholder="Search team members..."
            placeholderTextColor="#94A3B8"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: 220 }]}>USER</Text>
            <Text style={[styles.th, { width: 200 }]}>EMAIL</Text>
            <Text style={[styles.th, { width: 140 }]}>ROLE</Text>
            <Text style={[styles.th, { width: 150 }]}>DEPARTMENT</Text>
            <Text style={[styles.th, { width: 120 }]}>STATUS</Text>
            <Text style={[styles.th, { width: 120, textAlign: 'right' }]}>ACTION</Text>
          </View>

          {/* Table Rows */}
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No users found matching query.</Text>
            </View>
          ) : (
            filteredUsers.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <View key={user.id} style={styles.tableRow}>
                  {/* User Column */}
                  <View style={[styles.td, { width: 220, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                    {user.avatarUrl ? (
                      <Image source={{ uri: user.avatarUrl }} style={styles.avatar as any} />
                    ) : (
                      <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {user.name}
                      </Text>
                      {isSelf && <Text style={styles.youBadge}>(You)</Text>}
                    </View>
                  </View>

                  {/* Email Column */}
                  <View style={[styles.td, { width: 200 }]}>
                    <Text style={styles.emailText} numberOfLines={1}>
                      {user.email}
                    </Text>
                    <Text style={styles.providerText}>via {user.authProvider}</Text>
                  </View>

                  {/* Role Column */}
                  <View style={[styles.td, { width: 140 }]}>
                    <RoleBadge role={user.role} size="small" />
                  </View>

                  {/* Department Column */}
                  <View style={[styles.td, { width: 150 }]}>
                    <Text style={styles.deptText}>{user.department}</Text>
                  </View>

                  {/* Status Column */}
                  <View style={[styles.td, { width: 120 }]}>
                    <View style={styles.statusPill}>
                      <View style={styles.activeDot} />
                      <Text style={styles.statusText}>{user.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  {/* Action Column */}
                  <View style={[styles.td, { width: 120, alignItems: 'flex-end' }]}>
                    {isSelf ? (
                      <Text style={styles.naText}>Current User</Text>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleToggleRole(user)}
                        disabled={updatingId === user.id}
                        style={[
                          styles.actionButton,
                          user.role === 'admin'
                            ? styles.demoteButton
                            : styles.promoteButton,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={
                            user.role === 'admin'
                              ? 'account-arrow-down'
                              : 'shield-crown-outline'
                          }
                          size={14}
                          color={user.role === 'admin' ? '#D97706' : '#4F46E5'}
                        />
                        <Text
                          style={[
                            styles.actionText,
                            user.role === 'admin'
                              ? styles.demoteText
                              : styles.promoteText,
                          ]}
                        >
                          {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
      default: {
        elevation: 1,
      },
    }),
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
    minWidth: 220,
  },
  searchInput: {
    fontSize: 13,
    color: '#1E293B',
    flex: 1,
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
    }),
  },
  table: {
    minWidth: 950,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  th: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  td: {
    justifyContent: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  avatarPlaceholder: {
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  youBadge: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
  },
  emailText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  providerText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  deptText: {
    fontSize: 12,
    color: '#475569',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    gap: 5,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  promoteButton: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  demoteButton: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  promoteText: {
    color: '#4F46E5',
  },
  demoteText: {
    color: '#D97706',
  },
  naText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  emptyRow: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
  },
});
