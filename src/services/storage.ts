import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  FIRST_LAUNCH: '@appcms:first_launch',
  USER_SIGNED_UP: '@appcms:user_signed_up',
} as const;

export const StorageService = {
  isFirstLaunch: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
      return value === null;
    } catch (error) {
      console.error('[Storage] Error checking first launch:', error);
      return false;
    }
  },

  markAppLaunched: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'true');
    } catch (error) {
      console.error('[Storage] Error marking app launched:', error);
    }
  },

  isUserSignedUp: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.USER_SIGNED_UP);
      return value === 'true';
    } catch (error) {
      return false;
    }
  },

  markUserSignedUp: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SIGNED_UP, 'true');
    } catch (error) {
      console.error('[Storage] Error marking user signed up:', error);
    }
  },

  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('[Storage] Error clearing storage:', error);
    }
  },
};

export default StorageService;
