import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ErrorBannerProps {
  message: string | null;
  onDismiss?: () => void;
  allowedDomain?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onDismiss,
  allowedDomain = 'hbplus.fit',
}) => {
  if (!message) return null;

  const isRestrictedDomain = message.toLowerCase().includes('access restricted') ||
    message.toLowerCase().includes('domain');

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons
          name={isRestrictedDomain ? 'gpp-bad' : 'error-outline'}
          size={24}
          color="#DC2626"
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {isRestrictedDomain ? 'Domain Access Denied' : 'Authentication Error'}
        </Text>
        <Text style={styles.message}>{message}</Text>
        {isRestrictedDomain && (
          <View style={styles.domainPill}>
            <MaterialIcons name="verified-user" size={14} color="#059669" />
            <Text style={styles.domainPillText}>
              Required domain: <Text style={styles.boldDomain}>@{allowedDomain}</Text>
            </Text>
          </View>
        )}
      </View>
      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.dismissButton}
          accessibilityLabel="Dismiss error"
          accessibilityRole="button"
        >
          <MaterialIcons name="close" size={20} color="#991B1B" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.08)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 18,
  },
  domainPill: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 5,
  },
  domainPillText: {
    fontSize: 12,
    color: '#065F46',
  },
  boldDomain: {
    fontWeight: '700',
    color: '#047857',
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
});
