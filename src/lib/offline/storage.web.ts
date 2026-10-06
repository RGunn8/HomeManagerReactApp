import AsyncStorage from '@react-native-async-storage/async-storage';

// expo-sqlite on web needs extra WASM and cross-origin-isolation setup, so web uses browser storage.
export const offlineStorage = AsyncStorage;

const local = () => (typeof localStorage === 'undefined' ? undefined : localStorage);

export const offlineSyncStorage = {
  getItem: (key: string) => local()?.getItem(key) ?? null,
  setItem: (key: string, value: string) => local()?.setItem(key, value),
  removeItem: (key: string) => local()?.removeItem(key),
};
