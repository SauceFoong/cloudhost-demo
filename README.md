# AppCMS Demo App

A React Native demo app with Firebase Analytics, Meta SDK, and AppsFlyer integration for analytics tracking.

## Tech Stack

| Component | Version |
|-----------|---------|
| React Native | 0.76.9 |
| Expo SDK | 52.0.46 (Bare workflow) |
| Navigation | React Navigation v6.0.2 |
| Package Manager | Yarn |

## SDK Integrations

| SDK | Purpose |
|-----|---------|
| Firebase Analytics | Event tracking & attribution |
| Meta (Facebook) SDK | Ad attribution & event tracking |
| AppsFlyer | Mobile attribution & deep linking |
| expo-crypto | SHA-256 email hashing |
| expo-tracking-transparency | iOS ATT prompt |

## Analytics Events

Events are fired to **Firebase Analytics**, **Meta SDK**, and **AppsFlyer**:

| Event | Parameters | Description |
|-------|------------|-------------|
| `app_install` | `hashed_email` (optional) | First app launch |
| `user_sign_up` | `hashed_email` | User registration |
| `deposit` | `value`, `currency`, `hashed_email` | Fund deposit |
| `create_instance` | `product_id`, `hashed_email` | Server instance creation |
| `screen_view` | `screen_name` | Screen navigation |
| `deep_link_opened` | `deep_link_value`, `media_source`, `campaign` | Existing user opens via deep link |
| `deferred_deep_link` | `deep_link_value`, `media_source`, `campaign` | New user installs from link, then opens |

## Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# App Identifiers
IOS_BUNDLE_ID=com.yourcompany.app
ANDROID_PACKAGE_NAME=com.yourcompany.app

# Meta (Facebook) SDK
META_APP_ID=your_meta_app_id
META_CLIENT_TOKEN=your_meta_client_token
META_DISPLAY_NAME=Your App Name

# AppsFlyer SDK
APPSFLYER_DEV_KEY=your_appsflyer_dev_key
APPSFLYER_IOS_APP_ID=your_app_store_id
APPSFLYER_ANDROID_APP_ID=your_android_app_id
```

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `IOS_BUNDLE_ID` | iOS Bundle Identifier | Apple Developer Portal |
| `ANDROID_PACKAGE_NAME` | Android Package Name | `android/app/build.gradle` |
| `META_APP_ID` | Facebook App ID | [Meta Developer Console](https://developers.facebook.com/) |
| `META_CLIENT_TOKEN` | Facebook Client Token | Meta Console → Settings → Advanced |
| `APPSFLYER_DEV_KEY` | AppsFlyer Dev Key | [AppsFlyer Dashboard](https://hq1.appsflyer.com/) |
| `APPSFLYER_IOS_APP_ID` | iOS App Store ID (numeric) | App Store Connect |
| `APPSFLYER_ANDROID_APP_ID` | Android App ID for AppsFlyer | AppsFlyer Dashboard |

> ⚠️ `.env` is gitignored. Each developer needs their own copy.

### 3. Add Firebase Config Files

Download from [Firebase Console](https://console.firebase.google.com/):

- `GoogleService-Info.plist` → project root (iOS)
- `google-services.json` → project root (Android)

> ⚠️ These files are gitignored. Each developer needs their own copies.

### 4. Build and Run

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

## Project Structure

```
/
├── .env                            # Environment variables (gitignored)
├── .env.example                    # Template for environment variables
├── app.config.js                   # Dynamic Expo config (reads from .env)
├── App.tsx                         # Entry with ATT + SDK initialization
├── babel.config.js                 # Babel config with dotenv plugin
├── withCustomAndroidManifest.js    # AppsFlyer Android fix
├── GoogleService-Info.plist        # Firebase iOS config (gitignored)
├── google-services.json            # Firebase Android config (gitignored)
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.tsx        # Stack navigator
│   │   └── BottomTabNavigator.tsx  # Tab navigator
│   ├── screens/
│   │   ├── WelcomeScreen.tsx       # Home tab (app_install)
│   │   ├── SignupScreen.tsx        # Signup flow (user_sign_up)
│   │   ├── DepositScreen.tsx       # Add funds (deposit)
│   │   ├── CreateInstanceScreen.tsx # Create server (create_instance)
│   │   ├── ServersScreen.tsx       # Servers tab
│   │   └── ProfileScreen.tsx       # Profile tab
│   ├── services/
│   │   ├── analytics.ts            # Unified analytics (Firebase + Meta + AppsFlyer)
│   │   └── storage.ts              # AsyncStorage utilities
│   ├── types/
│   │   └── env.d.ts                # TypeScript types for @env module
│   └── constants/
│       ├── theme.ts
│       └── products.ts
└── package.json
```

## Analytics Service Usage

```typescript
import { AnalyticsEvents } from './src/services/analytics';

// All events fire to Firebase, Meta, and AppsFlyer
await AnalyticsEvents.logAppInstall();                    // Without email
await AnalyticsEvents.logAppInstall('user@example.com');  // With email (hashed)
await AnalyticsEvents.logUserSignUp('user@example.com');  // Email is SHA-256 hashed
await AnalyticsEvents.logDeposit(100, 'USD');             // Uses stored hashed email
await AnalyticsEvents.logCreateInstance('prod_standard_002');

// Screen views (use with useFocusEffect for tabs)
await AnalyticsEvents.logScreenView('Home');

// Deep link events (automatically fired in App.tsx)
await AnalyticsEvents.logDeepLinkOpened({ deep_link_value: 'promo', media_source: 'facebook' });
await AnalyticsEvents.logDeferredDeepLink({ deep_link_value: 'promo', media_source: 'facebook' });
```

## Deep Link Events

Deep link events are **automatically fired** in `App.tsx` when AppsFlyer detects a deep link:

| Event | When Fired |
|-------|------------|
| `deep_link_opened` | Existing user (app installed) clicks a deep link |
| `deferred_deep_link` | New user installs app after clicking a link, then opens |

This helps track:
- **Re-engagement campaigns** (existing users clicking ads)
- **Acquisition campaigns** (new users installing from ads)

## Screen View Tracking

Since React Navigation v6 keeps tab screens mounted, use `useFocusEffect`:

```typescript
import { useFocusEffect } from '@react-navigation/native';

useFocusEffect(
  useCallback(() => {
    AnalyticsEvents.logScreenView('ScreenName');
  }, [])
);
```

## Privacy & Hashing

User emails are hashed using **SHA-256** before being sent to analytics:

```typescript
// Input: user@example.com
// Output: b4c9a289323b21a0 (first 16 chars of SHA-256 hash)
```

- ✅ GDPR compliant
- ✅ Cannot be reversed
- ✅ Consistent across platforms

## Debugging

| Platform | How to Debug |
|----------|--------------|
| Firebase | Xcode scheme → Add `-FIRAnalyticsDebugEnabled` → Check DebugView in Firebase Console |
| Meta | [Meta Events Manager](https://business.facebook.com/events_manager) → Test Events |
| AppsFlyer | [AppsFlyer Dashboard](https://hq1.appsflyer.com/) → Debug → Device Logs |

## Notes

- Uses **Expo Dev Client** (not Expo Go) for native modules
- **ATT prompt** shown on first launch before any tracking
- **SKAdNetwork** postback enabled for iOS 14.5+ attribution
- Set `isDebug: false` in AppsFlyer config for production builds
