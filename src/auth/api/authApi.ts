import { apiJson, jsonBody } from '@/lib/api-client';
import type { AuthResponse, LoginRequest, SignupRequest } from '@/lib/api-types';

export type SignInRequest = LoginRequest;
export type CreateAccountRequest = SignupRequest;

export function signIn(request: SignInRequest) {
  return apiJson<AuthResponse>('/api/auth/login', { method: 'POST', auth: false, ...jsonBody(request) });
}

export function createAccount(request: CreateAccountRequest) {
  return apiJson<AuthResponse>('/api/auth/signup', { method: 'POST', auth: false, ...jsonBody(request) });
}

export function deleteAccount() {
  return apiJson<void>('/api/auth/me', { method: 'DELETE' });
}

export function demoSignIn() {
  return apiJson<AuthResponse>('/api/auth/demo-login', { method: 'POST', auth: false });
}
