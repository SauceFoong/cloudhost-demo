import { getAnalytics, logEvent, logScreenView } from '@react-native-firebase/analytics';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import appsFlyer from 'react-native-appsflyer';
import * as Crypto from 'expo-crypto';

/**
 * Unified Analytics Service
 * 
 * Fires events to Firebase Analytics, Meta (Facebook) SDK, and AppsFlyer
 * 
 * Events:
 * 1. app_install - First app launch (hashed_email)
 * 2. user_sign_up - User registration (hashed_email)
 * 3. deposit - Fund deposit (value, currency, hashed_email)
 * 4. create_instance - Server instance creation (product_id, hashed_email)
 */

// Store the current user's hashed email for use across events
let currentHashedEmail: string | null = null;

/**
 * Hash email using SHA-256 (industry standard, GDPR compliant)
 * Uses expo-crypto for native hashing
 * Returns first 16 characters of the hash for readability
 * 
 * @see https://docs.expo.dev/versions/latest/sdk/crypto/
 */
const hashEmailSHA256 = async (email: string): Promise<string> => {
  const normalizedEmail = email.toLowerCase().trim();
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    normalizedEmail
  );
  // Return first 16 characters of SHA-256 hash
  return digest.substring(0, 16);
};

/**
 * Set the current user's email (will be hashed and stored)
 * Call this after user signs up or logs in
 */
export const setUserEmail = async (email: string): Promise<void> => {
  currentHashedEmail = await hashEmailSHA256(email);
  console.log('[Analytics] User email set (hashed):', currentHashedEmail);
};

/**
 * Clear the current user's email (call on logout)
 */
export const clearUserEmail = (): void => {
  currentHashedEmail = null;
  console.log('[Analytics] User email cleared');
};

/**
 * Get the current hashed email
 */
export const getHashedEmail = (): string | null => currentHashedEmail;

// Helper to log to all platforms (Firebase, Meta, AppsFlyer)
const logToAllPlatforms = async (
  eventName: string,
  params?: Record<string, unknown>
): Promise<void> => {
  // Firebase Analytics
  try {
    const analytics = getAnalytics();
    await logEvent(analytics, eventName, params);
    console.log(`[Firebase] ${eventName} event fired`, params || '');
  } catch (error) {
    console.error(`[Firebase] Error firing ${eventName}:`, error);
  }

  // Meta SDK
  try {
    if (params) {
      AppEventsLogger.logEvent(eventName, params as Record<string, string | number>);
    } else {
      AppEventsLogger.logEvent(eventName);
    }
    console.log(`[Meta] ${eventName} event fired`, params || '');
  } catch (error) {
    console.error(`[Meta] Error firing ${eventName}:`, error);
  }

  // AppsFlyer
  try {
    await appsFlyer.logEvent(eventName, params || {});
    console.log(`[AppsFlyer] ${eventName} event fired`, params || '');
  } catch (error) {
    console.error(`[AppsFlyer] Error firing ${eventName}:`, error);
  }
};

export const AnalyticsEvents = {
  /**
   * Event 1: app_install
   * Fired on first app launch after installation
   * @param email - Optional: User's email (if available, will be hashed)
   */
  logAppInstall: async (email?: string): Promise<void> => {
    let hashedEmail = currentHashedEmail;
    
    // If email provided, hash it; otherwise use stored hash
    if (email) {
      hashedEmail = await hashEmailSHA256(email);
    }
    
    await logToAllPlatforms('app_install', {
      ...(hashedEmail && { hashed_email: hashedEmail }),
    });
  },

  /**
   * Event 2: user_sign_up
   * Fired when user completes signup
   * @param email - User's email address (will be hashed using SHA-256)
   */
  logUserSignUp: async (email: string): Promise<void> => {
    const hashedEmail = await hashEmailSHA256(email);
    // Store for future events
    currentHashedEmail = hashedEmail;
    
    await logToAllPlatforms('user_sign_up', {
      hashed_email: hashedEmail,
    });
  },

  /**
   * Event 3: deposit
   * Fired when user makes a deposit
   * @param value - Deposit amount
   * @param currency - ISO 4217 currency code
   * @param email - Optional: User's email (if not already set via setUserEmail)
   */
  logDeposit: async (value: number, currency: string, email?: string): Promise<void> => {
    let hashedEmail = currentHashedEmail;
    
    // If email provided, hash it; otherwise use stored hash
    if (email) {
      hashedEmail = await hashEmailSHA256(email);
    }
    
    await logToAllPlatforms('deposit', {
      value,
      currency: currency.toUpperCase(),
      ...(hashedEmail && { hashed_email: hashedEmail }),
    });
  },

  /**
   * Event 4: create_instance
   * Fired when user creates a server instance
   * @param productId - Product identifier
   * @param email - Optional: User's email (if not already set via setUserEmail)
   */
  logCreateInstance: async (productId: string, email?: string): Promise<void> => {
    let hashedEmail = currentHashedEmail;
    
    // If email provided, hash it; otherwise use stored hash
    if (email) {
      hashedEmail = await hashEmailSHA256(email);
    }
    
    await logToAllPlatforms('create_instance', {
      product_id: productId,
      ...(hashedEmail && { hashed_email: hashedEmail }),
    });
  },

  /**
   * Log screen view - for React Navigation v6 with useFocusEffect
   */
  logScreenView: async (screenName: string): Promise<void> => {
    // Firebase Analytics
    try {
      const analytics = getAnalytics();
      await logScreenView(analytics, {
        screen_name: screenName,
        screen_class: screenName,
      });
      console.log(`[Firebase] Screen view: ${screenName}`);
    } catch (error) {
      console.error('[Firebase] Error logging screen view:', error);
    }

    // Meta SDK
    try {
      AppEventsLogger.logEvent('screen_view', { screen_name: screenName });
      console.log(`[Meta] Screen view: ${screenName}`);
    } catch (error) {
      console.error('[Meta] Error logging screen view:', error);
    }

    // AppsFlyer
    try {
      await appsFlyer.logEvent('screen_view', { screen_name: screenName });
      console.log(`[AppsFlyer] Screen view: ${screenName}`);
    } catch (error) {
      console.error('[AppsFlyer] Error logging screen view:', error);
    }
  },

  /**
   * Event: deep_link_opened
   * Fired when an EXISTING user opens the app via a deep link
   * @param params - Deep link parameters from AppsFlyer
   */
  logDeepLinkOpened: async (params: {
    deep_link_value?: string;
    media_source?: string;
    campaign?: string;
  }): Promise<void> => {
    await logToAllPlatforms('deep_link_opened', {
      deep_link_value: params.deep_link_value || 'unknown',
      media_source: params.media_source || 'direct',
      ...(params.campaign && { campaign: params.campaign }),
    });
  },

  /**
   * Event: deferred_deep_link
   * Fired when a NEW user installs the app after clicking a deep link (first open)
   * This indicates the user came from an ad/link, installed, then opened the app
   * @param params - Deep link parameters from AppsFlyer
   */
  logDeferredDeepLink: async (params: {
    deep_link_value?: string;
    media_source?: string;
    campaign?: string;
  }): Promise<void> => {
    await logToAllPlatforms('deferred_deep_link', {
      deep_link_value: params.deep_link_value || 'unknown',
      media_source: params.media_source || 'direct',
      ...(params.campaign && { campaign: params.campaign }),
    });
  },
};

export default AnalyticsEvents;
