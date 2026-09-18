export const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API !== 'false';

export function mockAuthResponse() {
  return Promise.resolve({ token: 'mock-auth-token' });
}