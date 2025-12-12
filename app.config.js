/* eslint-disable @typescript-eslint/no-require-imports */
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const {
  IOS_BUNDLE_ID = 'com.cloudhost.demo',
  ANDROID_PACKAGE_NAME = 'com.cloudhost.demo',
  META_APP_ID = '',
  META_CLIENT_TOKEN = '',
  META_DISPLAY_NAME = 'AppCMS Demo',
  APPSFLYER_DEV_KEY = '',
  APPSFLYER_IOS_APP_ID = '',
} = process.env;

module.exports = {
  expo: {
    name: 'AppCMS Demo',
    slug: 'appcms-demo',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    scheme: 'appcms',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0a0f1c',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: IOS_BUNDLE_ID,
      googleServicesFile: './GoogleService-Info.plist',
      infoPlist: {
        NSUserTrackingUsageDescription:
          'This app uses tracking to provide personalized ads and measure ad performance.',
        NSAdvertisingAttributionReportEndpoint: 'https://appsflyer-skadnetwork.com/',
        FacebookAppID: META_APP_ID,
        FacebookClientToken: META_CLIENT_TOKEN,
        FacebookAutoLogAppEventsEnabled: true,
        FacebookAdvertiserIDCollectionEnabled: true,
        FacebookDisplayName: META_DISPLAY_NAME,
        SKAdNetworkItems: [
          { SKAdNetworkIdentifier: 'v9wttpbfk9.skadnetwork' },
          { SKAdNetworkIdentifier: 'n38lu8286q.skadnetwork' },
        ],
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [`fb${META_APP_ID}`],
          },
        ],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0a0f1c',
      },
      package: ANDROID_PACKAGE_NAME,
      googleServicesFile: './google-services.json',
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      '@react-native-firebase/app',
      [
        'expo-tracking-transparency',
        {
          userTrackingPermission:
            'This app uses tracking to provide personalized ads and measure ad performance.',
        },
      ],
      [
        'react-native-fbsdk-next',
        {
          appID: META_APP_ID,
          clientToken: META_CLIENT_TOKEN,
          displayName: META_DISPLAY_NAME,
          advertiserIDCollectionEnabled: true,
          autoLogAppEventsEnabled: true,
        },
      ],
      './withCustomAndroidManifest.js',
      [
        'react-native-appsflyer',
        {
          shouldUseStrictMode: false,
          shouldUsePurchaseConnector: false,
        },
      ],
    ],
    // Expose environment variables to the app via Expo's extra config
    extra: {
      eas: {
        projectId: undefined,
      },
      // These will be accessible via Constants.expoConfig.extra
      META_APP_ID,
      META_CLIENT_TOKEN,
      META_DISPLAY_NAME,
      APPSFLYER_DEV_KEY,
      APPSFLYER_IOS_APP_ID,
      IOS_BUNDLE_ID,
      ANDROID_PACKAGE_NAME,
    },
  },
};

