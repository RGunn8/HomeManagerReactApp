import { apiJson } from '@/lib/api-client';

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
  return apiJson<AuthResponse>('/auth/sign-in', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(request),
  });
}

export function createAccount(request: CreateAccountRequest) {
  return apiJson<AuthResponse>('/auth/create-account', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(request),
  });
}
