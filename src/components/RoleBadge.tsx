import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserRole } from '../types';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'small' | 'medium';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'medium' }) => {
  const isAdmin = role === 'admin';

  return (
    <View
      style={[
        styles.badge,
        isAdmin ? styles.adminBadge : styles.userBadge,
        size === 'small' && styles.badgeSmall,
      ]}
    >
      <MaterialCommunityIcons
        name={isAdmin ? 'shield-crown' : 'account-check'}
        size={size === 'small' ? 12 : 14}
        color={isAdmin ? '#6366F1' : '#059669'}
        style={styles.icon}
      />
      <Text
        style={[
          styles.text,
          isAdmin ? styles.adminText : styles.userText,
          size === 'small' && styles.textSmall,
        ]}
      >
        {isAdmin ? 'ADMIN' : 'STAFF USER'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  adminBadge: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    borderWidth: 1,
  },
  userBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  textSmall: {
    fontSize: 10,
  },
  adminText: {
    color: '#4F46E5',
  },
  userText: {
    color: '#047857',
  },
});
