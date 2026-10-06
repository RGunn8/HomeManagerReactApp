import * as SecureStore from 'expo-secure-store';

/**
 * Use SecureStore for tokens, credentials, and other sensitive values.
 * Prefer AsyncStorage/Zustand persistence for non-sensitive preferences only.
 *
 * Values are readable after the device's first unlock (so background requests work) and are never
 * migrated to another device through iCloud/iTunes backups. Android backups exclude SecureStore via
 * the expo-secure-store config plugin.
 */
const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

export async function saveSecureValue(key: string, value: string) {
  await SecureStore.setItemAsync(key, value, options);
}

export async function getSecureValue(key: string) {
  return SecureStore.getItemAsync(key, options);
}

export async function deleteSecureValue(key: string) {
  await SecureStore.deleteItemAsync(key, options);
}
