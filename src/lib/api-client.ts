import { getSecureValue } from '@/lib/secure-storage';

import { API_BASE_URL } from './api-config';

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const { auth = true, headers, ...requestOptions } = options;
  const token = auth ? await getSecureValue('auth-token') : null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response;
}

export async function apiJson<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  const response = await apiFetch(path, options);
  return response.json() as Promise<T>;
}
