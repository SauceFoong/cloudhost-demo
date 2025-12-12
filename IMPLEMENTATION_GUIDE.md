# SDK Integration Implementation Guide

This guide covers the complete integration of **Firebase Analytics**, **Meta (Facebook) SDK**, and **AppsFlyer SDK** in a React Native Expo app, including iOS App Tracking Transparency (ATT) implementation.

---

## Table of Contents

1. [Configuration Values](#configuration-values)
2. [Prerequisites](#prerequisites)
3. [Step 1: Install Dependencies](#step-1-install-dependencies)
4. [Step 2: iOS App Tracking Transparency (ATT)](#step-2-ios-app-tracking-transparency-att)
5. [Step 3: Firebase Analytics Integration](#step-3-firebase-analytics-integration)
6. [Step 4: Meta (Facebook) SDK Integration](#step-4-meta-facebook-sdk-integration)
7. [Step 5: AppsFlyer SDK Integration](#step-5-appsflyer-sdk-integration)
8. [Step 6: Unified Analytics Service](#step-6-unified-analytics-service)
9. [Step 7: App Initialization](#step-7-app-initialization)
10. [Step 8: Build and Run](#step-8-build-and-run)
11. [Debugging](#debugging)

---

## Configuration Values

> **Note:** Replace all `{{PLACEHOLDER}}` values with your actual credentials.

### Your App Identifiers

| Platform | Key | Placeholder | Example Value |
|----------|-----|-------------|---------------|
| iOS | Bundle Identifier | `{{IOS_BUNDLE_ID}}` | `com.yourcompany.app` |
| Android | Package Name | `{{ANDROID_PACKAGE_NAME}}` | `com.yourcompany.app` |

### Firebase Analytics

| Key | Placeholder | Description |
|-----|-------------|-------------|
| iOS Config File | `GoogleService-Info.plist` | Download from Firebase Console |
| Android Config File | `google-services.json` | Download from Firebase Console |

### Meta (Facebook) SDK

| Key | Placeholder | Example Value |
|-----|-------------|---------------|
| Facebook App ID | `{{META_APP_ID}}` | `1234567890123456` |
| Facebook Client Token | `{{META_CLIENT_TOKEN}}` | `abcd1234efgh5678ijkl9012` |
| Facebook Display Name | `{{META_DISPLAY_NAME}}` | `My App Name` |
| URL Scheme | `fb{{META_APP_ID}}` | `fb1234567890123456` |

### AppsFlyer SDK

| Key | Placeholder | Example Value |
|-----|-------------|---------------|
| Dev Key | `{{APPSFLYER_DEV_KEY}}` | `aBcDeFgHiJkLmNoPqRsTuVwXyZ` |
| iOS App Store ID | `{{APPSFLYER_IOS_APP_ID}}` | `id1234567890` or `1234567890` |
| Android App ID | `{{ANDROID_PACKAGE_NAME}}` | `com.yourcompany.app` |

---

## Prerequisites

- React Native 0.76.9
- Expo SDK 52.0.46 (Bare workflow)
- expo-dev-client (required for native modules)
- Yarn as package manager

---

## Step 1: Install Dependencies

### 1.1 Install all required packages

```bash
# Core Expo development client
yarn add expo-dev-client

# Firebase Analytics
yarn add @react-native-firebase/app @react-native-firebase/analytics

# Meta (Facebook) SDK
yarn add react-native-fbsdk-next

# AppsFlyer SDK
yarn add react-native-appsflyer

# App Tracking Transparency
yarn add expo-tracking-transparency

# Crypto for SHA-256 hashing (use npx expo install for correct version)
npx expo install expo-crypto
```

### 1.2 Final package.json dependencies

```json
{
  "dependencies": {
    "@react-native-firebase/analytics": "^21.6.1",
    "@react-native-firebase/app": "^21.6.1",
    "expo": "~52.0.46",
    "expo-crypto": "~14.0.2",
    "expo-dev-client": "~5.0.12",
    "expo-tracking-transparency": "~5.0.0",
    "react": "18.3.1",
    "react-native": "0.76.9",
    "react-native-appsflyer": "^6.17.7",
    "react-native-fbsdk-next": "^13.3.1"
  }
}
```

---

## Step 2: iOS App Tracking Transparency (ATT)

ATT is required by Apple for apps that track users across apps and websites. This must be shown BEFORE initializing tracking SDKs.

### 2.1 Configure app.json

Add the ATT permission description:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-tracking-transparency",
        {
          "userTrackingPermission": "This app uses tracking to provide personalized ads and measure ad performance."
        }
      ]
    ]
  }
}
```

### 2.2 Implement ATT in App.tsx

```typescript
import { Platform } from 'react-native';
import { 
  requestTrackingPermissionsAsync, 
  getTrackingPermissionsAsync 
} from 'expo-tracking-transparency';
import { Settings } from 'react-native-fbsdk-next';

const initializeATT = async () => {
  if (Platform.OS === 'ios') {
    const { status } = await getTrackingPermissionsAsync();
    
    if (status === 'undetermined') {
      // Show ATT prompt to user
      const { status: newStatus } = await requestTrackingPermissionsAsync();
      
      // Configure Meta SDK based on user's choice
      if (newStatus === 'granted') {
        Settings.setAdvertiserTrackingEnabled(true);
        console.log('[ATT] Tracking permission granted');
      } else {
        Settings.setAdvertiserTrackingEnabled(false);
        console.log('[ATT] Tracking permission denied');
      }
    } else {
      // User already made a choice previously
      Settings.setAdvertiserTrackingEnabled(status === 'granted');
    }
  }
};
```

---

## Step 3: Firebase Analytics Integration

### 3.1 Configure app.json

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "{{IOS_BUNDLE_ID}}",
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "package": "{{ANDROID_PACKAGE_NAME}}",
      "googleServicesFile": "./google-services.json"
    },
    "plugins": [
      "@react-native-firebase/app"
    ]
  }
}
```

### 3.2 Add Firebase Config Files

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create/select your project
3. Add iOS app with bundle ID: `{{IOS_BUNDLE_ID}}`
4. Download `GoogleService-Info.plist` → place in project root
5. Add Android app with package: `{{ANDROID_PACKAGE_NAME}}`
6. Download `google-services.json` → place in project root

### 3.3 Log Firebase Events

```typescript
import analytics from '@react-native-firebase/analytics';

// Log custom event
await analytics().logEvent('user_signup');

// Log event with parameters
await analytics().logEvent('deposit', {
  value: 100,
  currency: 'USD'
});

// Log screen view
await analytics().logScreenView({
  screen_name: 'Welcome',
  screen_class: 'Welcome'
});
```

---

## Step 4: Meta (Facebook) SDK Integration

### 4.1 Configure app.json

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "FacebookAppID": "{{META_APP_ID}}",
        "FacebookClientToken": "{{META_CLIENT_TOKEN}}",
        "FacebookAutoLogAppEventsEnabled": true,
        "FacebookAdvertiserIDCollectionEnabled": true,
        "FacebookDisplayName": "{{META_DISPLAY_NAME}}",
        "SKAdNetworkItems": [
          { "SKAdNetworkIdentifier": "v9wttpbfk9.skadnetwork" },
          { "SKAdNetworkIdentifier": "n38lu8286q.skadnetwork" }
        ],
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": ["fb{{META_APP_ID}}"]
          }
        ]
      }
    },
    "plugins": [
      [
        "react-native-fbsdk-next",
        {
          "appID": "{{META_APP_ID}}",
          "clientToken": "{{META_CLIENT_TOKEN}}",
          "displayName": "{{META_DISPLAY_NAME}}",
          "advertiserIDCollectionEnabled": true,
          "autoLogAppEventsEnabled": true
        }
      ]
    ]
  }
}
```

### 4.2 Initialize Meta SDK

```typescript
import { Settings } from 'react-native-fbsdk-next';

// Initialize Meta SDK (call AFTER ATT)
await Settings.initializeSDK();
Settings.setAutoLogAppEventsEnabled(true);
console.log('[Meta SDK] Initialized');
```

### 4.3 Log Meta Events

```typescript
import { AppEventsLogger } from 'react-native-fbsdk-next';

// Log custom event
AppEventsLogger.logEvent('user_signup');

// Log event with parameters
AppEventsLogger.logEvent('deposit', {
  value: 100,
  currency: 'USD'
});
```

---

## Step 5: AppsFlyer SDK Integration

### 5.1 Create Custom Android Manifest Plugin

Create `withCustomAndroidManifest.js` in project root (required for RN 0.76 + Expo 52):

```javascript
// withCustomAndroidManifest.js
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withCustomAndroidManifest(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const manifest = androidManifest.manifest;
    
    // Ensure xmlns:tools is present
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    const application = manifest.application[0];

    // Fix dataExtractionRules conflict
    application['$']['tools:replace'] = 'android:dataExtractionRules, android:fullBackupContent';
    application['$']['android:dataExtractionRules'] = '@xml/secure_store_data_extraction_rules';
    application['$']['android:fullBackupContent'] = '@xml/secure_store_backup_rules';

    return config;
  });
};
```

### 5.2 Configure app.json

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSAdvertisingAttributionReportEndpoint": "https://appsflyer-skadnetwork.com/"
      }
    },
    "plugins": [
      "./withCustomAndroidManifest.js",
      [
        "react-native-appsflyer",
        {
          "shouldUseStrictMode": false,
          "shouldUsePurchaseConnector": false
        }
      ]
    ]
  }
}
```

### 5.3 SKAdNetwork (SKAN) Postback Configuration

Add the following to `ios/AppCMSDemo/Info.plist` for iOS 14.5+ privacy-compliant attribution:

```xml
<key>NSAdvertisingAttributionReportEndpoint</key>
<string>https://appsflyer-skadnetwork.com/</string>
```

This enables:
- AppsFlyer to receive SKAdNetwork postbacks directly from Apple
- Attribution tracking even when users opt-out of ATT
- iOS 14.5+ privacy-compliant measurement

### 5.4 Initialize AppsFlyer SDK

```typescript
import appsFlyer from 'react-native-appsflyer';
import { Platform } from 'react-native';

// Set up Conversion Data Listener (before initSdk)
// This tells you if user came from paid ads vs organic
appsFlyer.onInstallConversionData((result) => {
  const data = result?.data;
  if (data) {
    console.log('[AppsFlyer] Conversion Data:', JSON.stringify(data));
    
    const status = data.af_status;
    if (status === 'Organic') {
      console.log('[AppsFlyer] Organic install');
      // Business logic for organic installs
    } else if (status === 'Non-organic') {
      console.log('[AppsFlyer] Non-organic install from:', data.media_source);
      console.log('[AppsFlyer] Campaign:', data.campaign);
      // Business logic for paid installs
    }
  }
});

// Set up Deep Link Listener (before initSdk)
appsFlyer.onDeepLink((result) => {
  console.log('[AppsFlyer] Deep Link:', JSON.stringify(result));
  
  if (result?.deepLinkStatus === 'FOUND') {
    const deepLinkValue = result?.data?.deep_link_value;
    // Handle navigation based on deep link
  }
});

// Initialize AppsFlyer SDK
const appsFlyerConfig = {
  devKey: '{{APPSFLYER_DEV_KEY}}',
  isDebug: true, // Set to false for production
  appId: Platform.OS === 'ios' ? '{{APPSFLYER_IOS_APP_ID}}' : '{{ANDROID_PACKAGE_NAME}}',
  onInstallConversionDataListener: true,
  onDeepLinkListener: true,
  timeToWaitForATTUserAuthorization: 10,
};

appsFlyer.initSdk(
  appsFlyerConfig,
  (result) => console.log('[AppsFlyer] SDK initialized:', result),
  (error) => console.warn('[AppsFlyer] SDK init error:', error)
);
```

### 5.5 Log AppsFlyer Events

```typescript
import appsFlyer from 'react-native-appsflyer';

// Log custom event
await appsFlyer.logEvent('user_signup', {});

// Log event with parameters
await appsFlyer.logEvent('deposit', {
  value: 100,
  currency: 'USD'
});
```

---

## Step 6: Unified Analytics Service

Create a single service to fire events to all platforms:

### File: `src/services/analytics.ts`

```typescript
import { getAnalytics, logEvent, logScreenView } from '@react-native-firebase/analytics';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import appsFlyer from 'react-native-appsflyer';
import * as Crypto from 'expo-crypto';

/**
 * Unified Analytics Service
 * Fires events to Firebase Analytics, Meta SDK, and AppsFlyer
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

// Helper to log to all platforms
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
  // Event 1: app_install - First app launch (with optional hashed email)
  logAppInstall: async (email?: string): Promise<void> => {
    let hashedEmail = currentHashedEmail;
    
    if (email) {
      hashedEmail = await hashEmailSHA256(email);
    }
    
    await logToAllPlatforms('app_install', {
      ...(hashedEmail && { hashed_email: hashedEmail }),
    });
  },

  // Event 2: user_sign_up - User registration (with hashed email)
  logUserSignUp: async (email: string): Promise<void> => {
    const hashedEmail = await hashEmailSHA256(email);
    // Store for future events
    currentHashedEmail = hashedEmail;
    
    await logToAllPlatforms('user_sign_up', {
      hashed_email: hashedEmail,
    });
  },

  // Event 3: deposit - Fund deposit (includes hashed_email if user signed up)
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

  // Event 4: create_instance - Server instance creation (includes hashed_email if user signed up)
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

  // Screen view tracking
  logScreenView: async (screenName: string): Promise<void> => {
    // Firebase
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

    // Meta
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
};

export default AnalyticsEvents;
```

---

## Step 7: App Initialization

### Complete App.tsx

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Settings } from 'react-native-fbsdk-next';
import appsFlyer from 'react-native-appsflyer';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // ==========================================
      // STEP 1: Request ATT Permission (iOS only)
      // ==========================================
      if (Platform.OS === 'ios') {
        const { status } = await getTrackingPermissionsAsync();
        
        if (status === 'undetermined') {
          const { status: newStatus } = await requestTrackingPermissionsAsync();
          
          if (newStatus === 'granted') {
            Settings.setAdvertiserTrackingEnabled(true);
            console.log('[ATT] Tracking permission granted');
          } else {
            Settings.setAdvertiserTrackingEnabled(false);
            console.log('[ATT] Tracking permission denied');
          }
        } else {
          Settings.setAdvertiserTrackingEnabled(status === 'granted');
        }
      }

      // ==========================================
      // STEP 2: Initialize Meta SDK
      // ==========================================
      await Settings.initializeSDK();
      Settings.setAutoLogAppEventsEnabled(true);
      console.log('[Meta SDK] Initialized');

      // ==========================================
      // STEP 3: Set up AppsFlyer Listeners
      // ==========================================
      appsFlyer.onInstallConversionData((result) => {
        const data = result?.data;
        if (data) {
          console.log('[AppsFlyer] Conversion Data:', JSON.stringify(data));
          
          if (data.af_status === 'Organic') {
            console.log('[AppsFlyer] Organic install');
          } else if (data.af_status === 'Non-organic') {
            console.log('[AppsFlyer] Non-organic install from:', data.media_source);
          }
        }
      });

      appsFlyer.onDeepLink((result) => {
        console.log('[AppsFlyer] Deep Link:', JSON.stringify(result));
        if (result?.deepLinkStatus === 'FOUND') {
          // Handle deep link navigation
        }
      });

      // ==========================================
      // STEP 4: Initialize AppsFlyer SDK
      // ==========================================
      const appsFlyerConfig = {
        devKey: '{{APPSFLYER_DEV_KEY}}',
        isDebug: true, // Set to false for production
        appId: Platform.OS === 'ios' ? '{{APPSFLYER_IOS_APP_ID}}' : '{{ANDROID_PACKAGE_NAME}}',
        onInstallConversionDataListener: true,
        onDeepLinkListener: true,
        timeToWaitForATTUserAuthorization: 10,
      };

      appsFlyer.initSdk(
        appsFlyerConfig,
        (result) => console.log('[AppsFlyer] SDK initialized:', result),
        (error) => console.warn('[AppsFlyer] SDK init error:', error)
      );

      // ==========================================
      // STEP 5: Firebase Analytics is auto-initialized
      // ==========================================
      // No explicit initialization needed - Firebase initializes automatically
      // when @react-native-firebase/app is installed and config files are present

      setIsReady(true);
    } catch (error) {
      console.error('[App] Initialization error:', error);
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
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
    backgroundColor: '#0a0f1c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#888',
  },
});
```

---

## Step 8: Build and Run

### 8.1 Rebuild the native app

```bash
# iOS
npx expo run:ios --device "iPhone 16 Pro"

# Android
npx expo run:android
```

### 8.2 Start Metro bundler

```bash
npx expo start --dev-client
```

---

## Debugging

### Firebase Analytics DebugView

1. In Xcode, go to **Product** → **Scheme** → **Edit Scheme**
2. Add launch argument: `-FIRAnalyticsDebugEnabled`
3. Go to Firebase Console → Analytics → **DebugView**

### Meta Events Manager

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager)
2. Select your app (ID: `{{META_APP_ID}}`)
3. Click **Test Events** for real-time events

### AppsFlyer Dashboard

1. Go to [AppsFlyer Dashboard](https://hq1.appsflyer.com/)
2. Select your app
3. Go to **Debug** → **Device Logs** for real-time events

---

## Events Reference

### Event 1: `app_install`

**Description:** Fired on the first app launch after installation.

**When to Fire:** First time user opens the app (use AsyncStorage to track)

**Payload:**
```json
{
  "hashed_email": "a1b2c3d4e5f6g7h8"    // String - SHA-256 hashed user email (optional)
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hashed_email` | `string` | Optional | SHA-256 hash of user's email (if available at install time) |

**Code Example:**
```typescript
import { AnalyticsEvents } from './src/services/analytics';

// Check if first launch
const isFirstLaunch = await AsyncStorage.getItem('hasLaunched');
if (!isFirstLaunch) {
  // Without email (if user hasn't signed up yet)
  await AnalyticsEvents.logAppInstall();
  
  // Or with email (if available, e.g., from deep link or previous session)
  // await AnalyticsEvents.logAppInstall('user@example.com');
  
  await AsyncStorage.setItem('hasLaunched', 'true');
}
```

---

### Event 2: `user_sign_up`

**Description:** Fired when a user completes the registration/signup process.

**When to Fire:** After successful user registration

**Payload:**
```json
{
  "hashed_email": "a1b2c3d4e5f6g7h8"    // String - SHA-256 hashed user email (privacy-safe)
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hashed_email` | `string` | Yes | SHA-256 hash of user's email (first 16 characters, cannot be reversed) |

**Code Example:**
```typescript
import { AnalyticsEvents } from './src/services/analytics';

const handleSignup = async (email: string) => {
  // ... signup logic ...
  
  // Fire event after successful signup (email will be hashed automatically)
  await AnalyticsEvents.logUserSignUp(email);
  
  // Example:
  // await AnalyticsEvents.logUserSignUp('user@example.com');
  // → Sends: { hashed_email: "a1b2c3d4" }
};
```

**Privacy Note:** The email is hashed before being sent to analytics platforms. The original email cannot be recovered from the hash.

---

### Event 3: `deposit`

**Description:** Fired when a user makes a deposit/payment.

**When to Fire:** After successful deposit transaction

**Payload:**
```json
{
  "value": 100.00,                      // Number - Deposit amount
  "currency": "USD",                    // String - ISO 4217 currency code (e.g., USD, EUR, MYR)
  "hashed_email": "a1b2c3d4e5f6g7h8"   // String - SHA-256 hashed user email (auto-included if user signed up)
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | `number` | Yes | The deposit amount (e.g., `100`, `50.50`) |
| `currency` | `string` | Yes | ISO 4217 currency code (e.g., `USD`, `EUR`, `MYR`, `SGD`) |
| `hashed_email` | `string` | Auto | Automatically included if user has signed up (SHA-256 hash) |

**Code Example:**
```typescript
import { AnalyticsEvents } from './src/services/analytics';

const handleDeposit = async (amount: number, currencyCode: string) => {
  // ... deposit logic ...
  
  // Fire event after successful deposit (hashed_email auto-included if user signed up)
  await AnalyticsEvents.logDeposit(amount, currencyCode);
  
  // Example: User deposits $100 USD
  // await AnalyticsEvents.logDeposit(100, 'USD');
  
  // Or pass email explicitly if needed:
  // await AnalyticsEvents.logDeposit(100, 'USD', 'user@example.com');
};
```

---

### Event 4: `create_instance`

**Description:** Fired when a user creates a new server instance.

**When to Fire:** After user successfully creates/provisions a server instance

**Payload:**
```json
{
  "product_id": "prod_standard_002",    // String - Product/instance type identifier
  "hashed_email": "a1b2c3d4e5f6g7h8"    // String - SHA-256 hashed user email (auto-included if user signed up)
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `product_id` | `string` | Yes | Unique identifier for the product/instance type |
| `hashed_email` | `string` | Auto | Automatically included if user has signed up (SHA-256 hash) |

**Code Example:**
```typescript
import { AnalyticsEvents } from './src/services/analytics';

const handleCreateInstance = async (productId: string) => {
  // ... create instance logic ...
  
  // Fire event after successful instance creation (hashed_email auto-included if user signed up)
  await AnalyticsEvents.logCreateInstance(productId);
  
  // Example: User creates a Standard instance
  // await AnalyticsEvents.logCreateInstance('prod_standard_002');
  
  // Or pass email explicitly if needed:
  // await AnalyticsEvents.logCreateInstance('prod_standard_002', 'user@example.com');
};
```

---

### Event 5: `screen_view`

**Description:** Fired when a user views/navigates to a screen.

**When to Fire:** When screen becomes focused (use `useFocusEffect` in React Navigation)

**Payload:**
```json
{
  "screen_name": "Welcome"    // String - Name of the screen
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `screen_name` | `string` | Yes | Human-readable screen name (e.g., `Welcome`, `Signup`, `Deposit`) |

**Code Example:**
```typescript
import { useFocusEffect } from '@react-navigation/native';
import { AnalyticsEvents } from '../services/analytics';

const WelcomeScreen = () => {
  useFocusEffect(
    React.useCallback(() => {
      AnalyticsEvents.logScreenView('Welcome');
    }, [])
  );

  return (
    // ... screen content ...
  );
};
```

---

## Events Summary Table

| Event Name | Description | Parameters | Example Payload |
|------------|-------------|------------|-----------------|
| `app_install` | First app launch | `hashed_email` (optional) | `{ "hashed_email": "a1b2c3d4e5f6g7h8" }` |
| `user_sign_up` | User registration | `hashed_email` | `{ "hashed_email": "a1b2c3d4e5f6g7h8" }` |
| `deposit` | User deposit | `value`, `currency`, `hashed_email` | `{ "value": 100, "currency": "USD", "hashed_email": "a1b2c3d4e5f6g7h8" }` |
| `create_instance` | Server creation | `product_id`, `hashed_email` | `{ "product_id": "prod_standard_002", "hashed_email": "a1b2c3d4e5f6g7h8" }` |
| `screen_view` | Screen navigation | `screen_name` | `{ "screen_name": "Welcome" }` |

**Hashing Method:** SHA-256 (first 16 characters) - Industry standard, GDPR compliant, irreversible

---

## File Structure

```
project/
├── App.tsx                          # Main app with SDK initialization
├── app.json                         # Expo config with all SDK plugins
├── package.json                     # Dependencies
├── withCustomAndroidManifest.js     # AppsFlyer Android fix
├── GoogleService-Info.plist         # Firebase iOS config
├── google-services.json             # Firebase Android config
└── src/
    └── services/
        └── analytics.ts             # Unified analytics service
```

---

## Important Notes

1. **ATT must be shown first** - Before initializing any tracking SDKs
2. **Firebase config files** - Must be in project root and match bundle ID
3. **Meta Client Token** - Required for Meta SDK to work
4. **AppsFlyer App Store ID** - Required for iOS attribution (use numeric ID or "id123456")
5. **isDebug: true** - Set to `false` for production builds
6. **SKAN Postback** - `NSAdvertisingAttributionReportEndpoint` enables AppsFlyer to receive SKAdNetwork data

---

## Email Hashing (Privacy)

All events that include user email use **SHA-256 hashing** via `expo-crypto`:

### How It Works

```typescript
import * as Crypto from 'expo-crypto';

const hashEmailSHA256 = async (email: string): Promise<string> => {
  const normalizedEmail = email.toLowerCase().trim();
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    normalizedEmail
  );
  return digest.substring(0, 16); // First 16 chars
};
```

### Example

| Email | Normalized | SHA-256 Hash (16 chars) |
|-------|------------|------------------------|
| `User@Example.com` | `user@example.com` | `b4c9a289323b21a0` |
| `  TEST@gmail.com  ` | `test@gmail.com` | `1a79a4d60de6718e` |

### Benefits

- ✅ **GDPR Compliant** - Original email cannot be recovered
- ✅ **Consistent** - Same email always produces same hash
- ✅ **Industry Standard** - SHA-256 is widely trusted
- ✅ **Cross-Platform** - Works on iOS and Android

---

## Placeholder Reference

Replace these placeholders throughout the guide with your actual values:

| Placeholder | Description | Where to Find |
|-------------|-------------|---------------|
| `{{IOS_BUNDLE_ID}}` | iOS Bundle Identifier | Apple Developer Portal / Xcode |
| `{{ANDROID_PACKAGE_NAME}}` | Android Package Name | `android/app/build.gradle` |
| `{{META_APP_ID}}` | Facebook/Meta App ID | [Meta Developer Console](https://developers.facebook.com/apps/) |
| `{{META_CLIENT_TOKEN}}` | Facebook/Meta Client Token | Meta Developer Console → Settings → Advanced |
| `{{META_DISPLAY_NAME}}` | App Display Name for Meta | Meta Developer Console → Settings → Basic |
| `{{APPSFLYER_DEV_KEY}}` | AppsFlyer Developer Key | [AppsFlyer Dashboard](https://hq1.appsflyer.com/) → Configuration → App Settings |
| `{{APPSFLYER_IOS_APP_ID}}` | iOS App Store ID | App Store Connect (numeric ID, e.g., `1234567890`) |

### Example Values (Demo App)

| Placeholder | Demo Value |
|-------------|------------|
| `{{IOS_BUNDLE_ID}}` | `com.cloudhost.demo` |
| `{{ANDROID_PACKAGE_NAME}}` | `com.cloudhost.demo` |
| `{{META_APP_ID}}` | `` |
| `{{META_CLIENT_TOKEN}}` | `` |
| `{{META_DISPLAY_NAME}}` | `AppCMS Demo` |
| `{{APPSFLYER_DEV_KEY}}` | `` |
| `{{APPSFLYER_IOS_APP_ID}}` | `` |

