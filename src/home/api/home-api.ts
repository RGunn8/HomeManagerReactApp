import { apiJson, jsonBody } from '@/lib/api-client';
import type { ApiHome, ApiHomeMember, ApiHomeWithRooms, Id } from '@/lib/api-types';

export const homePath = (homeId: Id, path = '') => `/api/homes/${homeId}${path}`;

export function getHomes() {
  return apiJson<ApiHomeWithRooms[]>('/api/homes');
}

export function getHome(homeId: Id) {
  return apiJson<ApiHomeWithRooms>(homePath(homeId));
}

export function createHome(name: string) {
  return apiJson<ApiHome>('/api/homes', { method: 'POST', ...jsonBody({ name }) });
}

export function getHomeMembers(homeId: Id) {
  return apiJson<ApiHomeMember[]>(homePath(homeId, '/members'));
}

export function removeHomeMember(homeId: Id, memberId: string) {
  return apiJson<void>(homePath(homeId, `/members/${memberId}`), { method: 'DELETE' });
}

export function inviteHomeMember(homeId: Id, email: string) {
  return apiJson<unknown>(homePath(homeId, '/invitations'), { method: 'POST', ...jsonBody({ email }) });
}

export function acceptHomeInvitation(homeId: Id, token: string) {
  return apiJson<unknown>(homePath(homeId, '/invitations/accept'), { method: 'POST', ...jsonBody({ token }) });
}
