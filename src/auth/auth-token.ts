import { Platform } from 'react-native';

import { deleteSecureValue, getSecureValue, saveSecureValue } from '@/lib/secure-storage';

const AUTH_TOKEN_KEY = 'auth-token';

// SecureStore has no web implementation, and browser storage is readable by any script on the page,
// so on web the token is kept in memory only (users sign in again after a reload). A secure web setup
// needs the API to issue an httpOnly cookie instead.
const persistToken = Platform.OS !== 'web';

// Avoids a keychain read on every request. `undefined` means "not loaded yet".
let cachedToken: string | null | undefined;

export async function getAuthToken() {
  if (cachedToken === undefined) {
    cachedToken = persistToken ? await getSecureValue(AUTH_TOKEN_KEY) : null;
  }
  return cachedToken;
}

export async function saveAuthToken(token: string) {
  cachedToken = token;
  if (persistToken) {
    await saveSecureValue(AUTH_TOKEN_KEY, token);
  }
}

export async function clearAuthToken() {
  cachedToken = null;
  if (persistToken) {
    await deleteSecureValue(AUTH_TOKEN_KEY);
  }
}
