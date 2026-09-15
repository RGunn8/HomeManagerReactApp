import * as SecureStore from 'expo-secure-store';

/**
 * Use SecureStore for tokens, credentials, and other sensitive values.
 * Prefer AsyncStorage/Zustand persistence for non-sensitive preferences only.
 */
export async function saveSecureValue(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

export async function getSecureValue(key: string) {
  return SecureStore.getItemAsync(key);
}

export async function deleteSecureValue(key: string) {
  await SecureStore.deleteItemAsync(key);
}
