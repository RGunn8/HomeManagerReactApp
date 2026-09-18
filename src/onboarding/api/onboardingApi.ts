import { apiJson } from '@/lib/api-client';
import { USE_MOCK_API } from '@/lib/mock-api';

export type CreateHomeRequest = {
  name: string;
  rooms: string[];
  tasks: Record<string, { name: string; interval?: string; completed: boolean }[]>;
};

export function createHome(request: CreateHomeRequest) {
  if (USE_MOCK_API) {
    return Promise.resolve({ homeId: 'mock-home-id' });
  }

  return apiJson<{ homeId: string }>('/homes', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}