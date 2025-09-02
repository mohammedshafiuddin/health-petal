import * as SecureStore from 'expo-secure-store';

export const StorageService = {
  async setItem(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (e) {
      console.error('SecureStore setItem error:', e);
      return false;
    }
  },
  async getItem(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.error('SecureStore getItem error:', e);
      return null;
    }
  },
  async removeItem(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (e) {
      console.error('SecureStore removeItem error:', e);
      return false;
    }
  },
  async clearAll(keys: string[]) {
    // SecureStore does not support clear all, so you must pass all keys to remove
    try {
      await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
      return true;
    } catch (e) {
      console.error('SecureStore clearAll error:', e);
      return false;
    }
  },
};
