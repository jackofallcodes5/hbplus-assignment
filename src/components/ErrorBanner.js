import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const ErrorBanner = ({ message, onDismiss, allowedDomain }) => {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons name="alert-octagon" size={20} color="#DC2626" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Access Denied</Text>
        <Text style={styles.message}>{message}</Text>
        {allowedDomain ? (
          <Text style={styles.hint}>
            Allowed domain: <Text style={styles.hintHighlight}>@{allowedDomain}</Text>
          </Text>
        ) : null}
      </View>
      {onDismiss ? (
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="close" size={18} color="#991B1B" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(220, 38, 38, 0.08)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  iconWrapper: {
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
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 18,
  },
  hint: {
    fontSize: 12,
    color: '#7F1D1D',
    marginTop: 4,
    fontWeight: '500',
  },
  hintHighlight: {
    fontWeight: '700',
    color: '#991B1B',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});
