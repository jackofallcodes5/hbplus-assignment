import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export const GoogleSignInButton = ({ onPress, disabled, isLoading }) => {
  return (
    <TouchableOpacity
      style={[styles.button, (disabled || isLoading) && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#0D9488" style={styles.spinner} />
      ) : (
        <View style={styles.googleIconContainer}>
          <FontAwesome5 name="google" size={18} color="#4285F4" />
        </View>
      )}
      <Text style={styles.buttonText}>
        {isLoading ? 'Verifying with Google...' : 'Sign in with Google'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        cursor: 'pointer',
        transition: 'all 0.15s ease-in-out',
      },
      default: {
        elevation: 1,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.65,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      },
      default: {},
    }),
  },
  googleIconContainer: {
    marginRight: 12,
  },
  spinner: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    letterSpacing: 0.2,
  },
});
