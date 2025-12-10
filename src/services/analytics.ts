import analytics from '@react-native-firebase/analytics';
import { AppEventsLogger } from 'react-native-fbsdk-next';

/**
 * Unified Analytics Service
 * 
 * Fires events to both Firebase Analytics and Meta (Facebook) SDK
 * 
 * Events:
 * 1. app_install - First app launch
 * 2. user_signup - User registration
 * 3. deposit - Fund deposit (value, currency)
 * 4. create_instance - Server instance creation (product_id)
 */

// Helper to log to both platforms
const logToBothPlatforms = async (
  eventName: string,
  params?: Record<string, unknown>
): Promise<void> => {
  try {
    // Firebase Analytics
    await analytics().logEvent(eventName, params);
    console.log(`[Firebase] ${eventName} event fired`, params || '');
  } catch (error) {
    console.error(`[Firebase] Error firing ${eventName}:`, error);
  }

  try {
    // Meta SDK
    if (params) {
      AppEventsLogger.logEvent(eventName, params as Record<string, string | number>);
    } else {
      AppEventsLogger.logEvent(eventName);
    }
    console.log(`[Meta] ${eventName} event fired`, params || '');
  } catch (error) {
    console.error(`[Meta] Error firing ${eventName}:`, error);
  }
};

export const AnalyticsEvents = {
  /**
   * Event 1: app_install
   * Fired on first app launch after installation
   */
  logAppInstall: async (): Promise<void> => {
    await logToBothPlatforms('app_install');
  },

  /**
   * Event 2: user_signup
   * Fired when user completes signup
   */
  logUserSignup: async (): Promise<void> => {
    await logToBothPlatforms('user_signup');
  },

  /**
   * Event 3: deposit
   * Fired when user makes a deposit
   * @param value - Deposit amount
   * @param currency - ISO 4217 currency code
   */
  logDeposit: async (value: number, currency: string): Promise<void> => {
    await logToBothPlatforms('deposit', {
      value,
      currency: currency.toUpperCase(),
    });
  },

  /**
   * Event 4: create_instance
   * Fired when user creates a server instance
   * @param productId - Product identifier
   */
  logCreateInstance: async (productId: string): Promise<void> => {
    await logToBothPlatforms('create_instance', {
      product_id: productId,
    });
  },

  /**
   * Log screen view - for React Navigation v6 with useFocusEffect
   */
  logScreenView: async (screenName: string): Promise<void> => {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenName,
      });
      console.log(`[Firebase] Screen view: ${screenName}`);
    } catch (error) {
      console.error('[Firebase] Error logging screen view:', error);
    }

    try {
      AppEventsLogger.logEvent('screen_view', { screen_name: screenName });
      console.log(`[Meta] Screen view: ${screenName}`);
    } catch (error) {
      console.error('[Meta] Error logging screen view:', error);
    }
  },
};

export default AnalyticsEvents;
