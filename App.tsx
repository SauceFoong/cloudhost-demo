import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Settings } from 'react-native-fbsdk-next';
import AppNavigator from './src/navigation/AppNavigator';
import { colors, fontSize, fontWeight, spacing } from './src/constants/theme';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [attStatus, setAttStatus] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Request ATT permission on iOS
      if (Platform.OS === 'ios') {
        const { status } = await getTrackingPermissionsAsync();
        
        if (status === 'undetermined') {
          // Show ATT prompt
          const { status: newStatus } = await requestTrackingPermissionsAsync();
          setAttStatus(newStatus);
          
          // Configure Meta SDK based on ATT response
          if (newStatus === 'granted') {
            Settings.setAdvertiserTrackingEnabled(true);
            console.log('[ATT] Tracking permission granted');
          } else {
            Settings.setAdvertiserTrackingEnabled(false);
            console.log('[ATT] Tracking permission denied');
          }
        } else {
          setAttStatus(status);
          Settings.setAdvertiserTrackingEnabled(status === 'granted');
        }
      }

      // Initialize Meta SDK
      await Settings.initializeSDK();
      // Enable verbose logging for debugging
      Settings.setAutoLogAppEventsEnabled(true);
      console.log('[Meta SDK] Initialized with auto-log enabled');

      setIsReady(true);
    } catch (error) {
      console.error('[App] Initialization error:', error);
      setIsReady(true); // Continue even if there's an error
    }
  };

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={styles.loadingIcon}>☁️</Text>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  loadingText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
});

