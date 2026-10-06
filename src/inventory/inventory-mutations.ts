import type { QueryClient } from '@tanstack/react-query';

import { createInventoryItem, deleteInventoryItem, updateInventoryItem } from '@/inventory/api/inventory-api';
import type { ApiInventoryCategory, ApiInventoryItem, CreateInventoryRequest, Id, UpdateInventoryRequest } from '@/lib/api-types';
import { nowIso, updateQuery } from '@/lib/offline/cache';
import { defineOfflineMutation } from '@/lib/offline/offline-mutation';
import { queryKeys } from '@/lib/query-keys';

const DEFAULT_CATEGORY = 'Uncategorized';

export function toOptimisticInventoryItem(homeId: Id, id: Id, request: CreateInventoryRequest): ApiInventoryItem {
  const now = nowIso();
  return {
    id,
    name: request.name,
    description: request.description ?? null,
    category: request.category || DEFAULT_CATEGORY,
    quantity: request.quantity,
    link: request.link ?? null,
    minQuantity: request.minQuantity,
    price: request.price ?? null,
    lastPurchaseDate: null,
    expiresDate: null,
    tags: request.tags ?? [],
    notes: request.notes ?? null,
    stores: request.stores ?? [],
    trackingMode: request.trackingMode ?? 'COUNT',
    homeId,
    roomId: request.roomId ?? null,
    status: request.status ?? (request.quantity < request.minQuantity ? 'LOW' : 'FULL'),
    createdAt: now,
    updatedAt: now,
  };
}

/** Places items into their category groups, creating a group when needed. */
function groupItems(groups: ApiInventoryCategory[], items: ApiInventoryItem[]) {
  return items.reduce((current, item) => {
    const existing = current.find((group) => group.category === item.category);
    return existing
      ? current.map((group) => (group === existing ? { ...group, items: [...group.items, item] } : group))
      : [...current, { category: item.category, items: [item] }];
  }, groups);
}

export function addInventoryItemsToCache(queryClient: QueryClient, homeId: Id, items: ApiInventoryItem[]) {
  updateQuery<ApiInventoryCategory[]>(queryClient, queryKeys.inventory(homeId), (groups) => groupItems(groups, items));
}

function removeItem(groups: ApiInventoryCategory[], itemId: Id) {
  return groups
    .map((group) => ({ ...group, items: group.items.filter((item) => item.id !== itemId) }))
    .filter((group) => group.items.length > 0);
}

export const createInventoryItemMutation = defineOfflineMutation({
  key: 'inventory.create',
  mutationFn: ({ homeId, request }: { homeId: Id; tempId: Id; request: CreateInventoryRequest }) =>
    createInventoryItem(homeId, request),
  optimistic: (queryClient, { homeId, tempId, request }) =>
    addInventoryItemsToCache(queryClient, homeId, [toOptimisticInventoryItem(homeId, tempId, request)]),
  createdIds: (item, { tempId }) => [[tempId, item.id]],
});

export const updateInventoryItemMutation = defineOfflineMutation({
  key: 'inventory.update',
  mutationFn: ({ homeId, itemId, request }: { homeId: Id; itemId: Id; request: UpdateInventoryRequest }) =>
    updateInventoryItem(homeId, itemId, request),
  optimistic: (queryClient, { homeId, itemId, request }) =>
    updateQuery<ApiInventoryCategory[]>(queryClient, queryKeys.inventory(homeId), (groups) => {
      const item = groups.flatMap((group) => group.items).find((candidate) => candidate.id === itemId);
      if (!item) return groups;
      const updated = { ...item, ...request, updatedAt: nowIso() } as ApiInventoryItem;
      return item.category === updated.category
        ? groups.map((group) => ({ ...group, items: group.items.map((candidate) => (candidate.id === itemId ? updated : candidate)) }))
        : groupItems(removeItem(groups, itemId), [updated]);
    }),
});

export const deleteInventoryItemMutation = defineOfflineMutation({
  key: 'inventory.delete',
  mutationFn: ({ homeId, itemId }: { homeId: Id; itemId: Id }) => deleteInventoryItem(homeId, itemId),
  optimistic: (queryClient, { homeId, itemId }) =>
    updateQuery<ApiInventoryCategory[]>(queryClient, queryKeys.inventory(homeId), (groups) => removeItem(groups, itemId)),
});
