import { homePath } from '@/home/api/home-api';
import { apiJson, jsonBody } from '@/lib/api-client';
import type {
  ApiInventoryCategory,
  ApiInventoryItem,
  ApiInventorySuggestion,
  CreateInventoryRequest,
  Id,
  UpdateInventoryRequest,
} from '@/lib/api-types';

export function getInventory(homeId: Id) {
  return apiJson<ApiInventoryCategory[]>(homePath(homeId, '/inventory'));
}

export function getInventoryAutocomplete(homeId: Id, query: string) {
  return apiJson<ApiInventorySuggestion[]>(homePath(homeId, `/inventory/autocomplete?query=${encodeURIComponent(query)}`));
}

export function createInventoryItem(homeId: Id, request: CreateInventoryRequest) {
  return apiJson<ApiInventoryItem>(homePath(homeId, '/inventory'), { method: 'POST', ...jsonBody(request) });
}

export function updateInventoryItem(homeId: Id, inventoryId: Id, request: UpdateInventoryRequest) {
  return apiJson<ApiInventoryItem>(homePath(homeId, `/inventory/${inventoryId}`), { method: 'PATCH', ...jsonBody(request) });
}

export function getInventoryItem(homeId: Id, inventoryId: Id) {
  return apiJson<ApiInventoryItem>(homePath(homeId, `/inventory/${inventoryId}`));
}

export function deleteInventoryItem(homeId: Id, inventoryId: Id) {
  return apiJson<void>(homePath(homeId, `/inventory/${inventoryId}`), { method: 'DELETE' });
}
