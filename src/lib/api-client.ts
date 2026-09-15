import { getSecureValue } from '@/lib/secure-storage';

import { API_BASE_URL } from './api-config';

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor({ body, message, status }: { body?: unknown; message: string; status: number }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function parseErrorBody(response: Response) {
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    return response.json().catch(() => undefined);
  }

  return response.text().catch(() => undefined);
}

function getErrorMessage(body: unknown, fallback: string) {
  if (typeof body === 'string' && body.trim().length > 0) {
    return body;
  }

  if (body && typeof body === 'object') {
    const errorBody = body as { error?: unknown; message?: unknown; title?: unknown };

    if (typeof errorBody.message === 'string') {
      return errorBody.message;
    }

    if (typeof errorBody.error === 'string') {
      return errorBody.error;
    }

    if (typeof errorBody.title === 'string') {
      return errorBody.title;
    }
  }

  return fallback;
}

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
    const body = await parseErrorBody(response);
    const fallback = `API request failed: ${response.status}`;

    throw new ApiError({
      body,
      message: getErrorMessage(body, fallback),
      status: response.status,
    });
  }

  return response;
}

export async function apiJson<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  const response = await apiFetch(path, options);
  return response.json() as Promise<T>;
}
