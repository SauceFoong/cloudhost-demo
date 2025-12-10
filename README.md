# AppCMS Demo App

A React Native demo app matching client's production stack with Firebase Analytics and Meta SDK integration.

## Tech Stack

| Component | Version |
|-----------|---------|
| React Native | 0.76.9 |
| Expo SDK | 52.0.46 |
| Navigation | React Navigation v6.0.2 |
| Package Manager | Yarn |
| iOS Bundle ID | com.cloudhost.demo |
| Android Package | com.cloudhost.demo |

## Analytics Events (Dual Tracking)

Events are fired to **both Firebase Analytics and Meta SDK**:

| Event | Parameters | Description |
|-------|------------|-------------|
| `app_install` | - | First app launch |
| `user_signup` | - | User registration |
| `deposit` | value, currency (ISO 4217) | Fund deposit |
| `create_instance` | product_id | Server instance creation |

## Features

- **iOS ATT Prompt** - App Tracking Transparency for iOS 14+
- **React Navigation v6** - Bottom tabs with screens staying mounted
- **useFocusEffect** - Screen view events on tab switch (not just mount)
- **Meta SDK** - App ID: 1485851395848055

## Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Add Firebase Config Files

- `google-services.json` → project root (Android)
- `GoogleService-Info.plist` → project root (iOS)

### 3. Update Meta SDK Client Token

Edit `app.json` and replace `YOUR_CLIENT_TOKEN` with your actual Meta client token.

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
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.tsx       # Stack navigator
│   │   └── BottomTabNavigator.tsx # Tab navigator
│   ├── screens/
│   │   ├── WelcomeScreen.tsx      # Home tab (app_install)
│   │   ├── SignupScreen.tsx       # Signup flow (user_signup)
│   │   ├── DepositScreen.tsx      # Add funds (deposit)
│   │   ├── CreateInstanceScreen.tsx # Create server (create_instance)
│   │   ├── ServersScreen.tsx      # Servers tab
│   │   └── ProfileScreen.tsx      # Profile tab
│   ├── services/
│   │   ├── analytics.ts           # Firebase + Meta dual tracking
│   │   └── storage.ts             # AsyncStorage utilities
│   └── constants/
│       ├── theme.ts
│       └── products.ts
├── App.tsx                         # Entry with ATT prompt
├── app.json                        # Expo config
└── package.json
```

## Analytics Service Usage

```typescript
import { AnalyticsEvents } from './src/services/analytics';

// All events fire to both Firebase and Meta
await AnalyticsEvents.logAppInstall();
await AnalyticsEvents.logUserSignup();
await AnalyticsEvents.logDeposit(100, 'USD');
await AnalyticsEvents.logCreateInstance('prod_standard_002');

// Screen views (use with useFocusEffect for tabs)
await AnalyticsEvents.logScreenView('Home');
```

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

## Notes

- Uses Expo Dev Client (not Expo Go) for native modules
- ATT prompt shown on first launch before any tracking
- Meta SDK initialized after ATT response
