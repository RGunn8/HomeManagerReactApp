import SQLiteStorage from 'expo-sqlite/kv-store';

/** SQLite-backed key-value storage for offline data: cached queries, the change queue and temp-id mappings. */
export const offlineStorage = SQLiteStorage;

/** Synchronous access, for values needed before any await (temp-id lookups). */
export const offlineSyncStorage = {
  getItem: (key: string) => SQLiteStorage.getItemSync(key),
  setItem: (key: string, value: string) => SQLiteStorage.setItemSync(key, value),
  removeItem: (key: string) => {
    SQLiteStorage.removeItemSync(key);
  },
};
