import { apiJson } from '@/lib/api-client';
import { mockAuthResponse, USE_MOCK_API } from '@/lib/mock-api';

export type SignInRequest = {
  email: string;
  password: string;
};

export type CreateAccountRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type AuthResponse = {
  token: string;
};

export function signIn(request: SignInRequest) {
  if (USE_MOCK_API) {
    return mockAuthResponse();
  }

  return apiJson<AuthResponse>('/auth/sign-in', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(request),
  });
}

export function createAccount(request: CreateAccountRequest) {
  if (USE_MOCK_API) {
    return mockAuthResponse();
  }

  return apiJson<AuthResponse>('/auth/create-account', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(request),
  });
}
