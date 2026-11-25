import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Web URL sync & route protection for browser environments
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const currentPath = window.location.hash || window.location.pathname;

      if (!isLoading) {
        if (isAuthenticated && user) {
          // If authenticated, ensure URL is on /dashboard
          if (window.location.hash !== '#/dashboard') {
            window.history.replaceState(null, '', '#/dashboard');
          }
        } else {
          // Protected Route Guard: If unauthenticated, redirect /dashboard attempts to /login
          if (window.location.hash !== '#/login') {
            window.history.replaceState(null, '', '#/login');
          }
        }
      }
    }
  }, [isAuthenticated, isLoading, user]);

  // Loading / Splash Screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <View style={styles.logoBadge}>
          <FontAwesome5 name="heartbeat" size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.loadingTitle}>HB+ SECURE PORTAL</Text>
        <Text style={styles.loadingSubtitle}>Verifying security credentials...</Text>
        <ActivityIndicator size="large" color="#0D9488" style={styles.spinner} />
      </View>
    );
  }

  // Protected Route Logic:
  // If not authenticated, always show LoginScreen
  // If authenticated with valid domain session, show DashboardScreen
  return isAuthenticated && user ? <DashboardScreen /> : <LoginScreen />;
};

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.3)',
      },
      default: {
        elevation: 4,
      },
    }),
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.8,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    marginBottom: 20,
  },
  spinner: {
    marginTop: 8,
  },
});
