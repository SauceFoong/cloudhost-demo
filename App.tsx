import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Settings } from 'react-native-fbsdk-next';
import appsFlyer from 'react-native-appsflyer';
import AppNavigator from './src/navigation/AppNavigator';
import { AnalyticsEvents } from './src/services/analytics';
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

      // Initialize AppsFlyer SDK
      // Note: For iOS, appId must be the App Store numeric ID (e.g., "123456789")
      // Using a placeholder for development - replace with real App Store ID when published
      // Set up AppsFlyer Conversion Data Listener
      // This tells you if the user came from paid ads vs organic install
      appsFlyer.onInstallConversionData((result) => {
        const data = result?.data;
        if (data) {
          console.log('[AppsFlyer] Conversion Data:', JSON.stringify(data));
          
          const status = data.af_status;
          if (status === 'Organic') {
            console.log('[AppsFlyer] Organic install - user found app naturally');
            // Business logic for organic installs (e.g., standard onboarding)
          } else if (status === 'Non-organic') {
            console.log('[AppsFlyer] Non-organic install from:', data.media_source);
            console.log('[AppsFlyer] Campaign:', data.campaign);
            // Business logic for paid installs (e.g., personalized content based on ad)
          }
        }
      });

      // Set up AppsFlyer Deep Link Listener
      // This handles when users open the app via a deep link (from ads, emails, etc.)
      appsFlyer.onDeepLink((result) => {
        console.log('[AppsFlyer] Deep Link received:', JSON.stringify(result));
        
        if (result?.deepLinkStatus === 'FOUND') {
          const params = {
            deep_link_value: result?.data?.deep_link_value,
            media_source: result?.data?.media_source,
            campaign: result?.data?.campaign,
          };
          
          if (result?.isDeferred) {
            // NEW user: installed app after clicking link (deferred deep link)
            console.log('[AppsFlyer] Deferred Deep Link - New install from link');
            AnalyticsEvents.logDeferredDeepLink(params);
          } else {
            // EXISTING user: app was already installed
            console.log('[AppsFlyer] Regular Deep Link - Existing user');
            AnalyticsEvents.logDeepLinkOpened(params);
          }
          
          // TODO: Handle navigation based on deep_link_value
          // e.g., navigate to specific screen or show specific content
        }
      });

      // AppsFlyer SDK Configuration
      const appsFlyerConfig = {
        devKey: 'gvQv7sdN7Tj6kvj8MN4GY4',
        isDebug: true,
        appId: Platform.OS === 'ios' ? 'id6739326850' : 'com.cloudhost.demo',
        onInstallConversionDataListener: true,
        onDeepLinkListener: true,
        timeToWaitForATTUserAuthorization: 10,
      };

      appsFlyer.initSdk(
        appsFlyerConfig,
        (result) => {
          console.log('[AppsFlyer] SDK initialized:', result);
        },
        (error) => {
          // Log warning but don't block app - AppsFlyer may fail in dev without valid App Store ID
          console.warn('[AppsFlyer] SDK init warning:', error?.message || error || 'Unknown error');
        }
      );

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

