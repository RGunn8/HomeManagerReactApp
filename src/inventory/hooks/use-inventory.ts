import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useHomeId } from '@/home/hooks/use-home';
import { getInventory, getInventoryAutocomplete } from '@/inventory/api/inventory-api';
import {
  createInventoryItemMutation,
  deleteInventoryItemMutation,
  updateInventoryItemMutation,
} from '@/inventory/inventory-mutations';
import { joinNotes, levelToStatus, toInventoryItem, toTrackingModeValue, type InventoryItem } from '@/inventory/inventory-model';
import type { CreateInventoryRequest, Id, UpdateInventoryRequest } from '@/lib/api-types';
import { useOfflineMutation } from '@/lib/offline/offline-mutation';
import { createTempId } from '@/lib/offline/temp-ids';
import { queryKeys } from '@/lib/query-keys';
import { useRoomNamesById } from '@/room/hooks/use-rooms';

export function useInventory() {
  const homeId = useHomeId();
  const roomNamesById = useRoomNamesById();
  const query = useQuery({
    queryKey: queryKeys.inventory(homeId ?? ''),
    queryFn: () => getInventory(homeId!),
    enabled: Boolean(homeId),
  });
  const items = useMemo(
    () => query.data?.flatMap((group) => group.items).map((item) => toInventoryItem(item, roomNamesById)),
    [query.data, roomNamesById],
  );

  return { ...query, data: items };
}

export function useInventoryAutocomplete(search: string) {
  const homeId = useHomeId();
  const trimmedSearch = search.trim();

  return useQuery({
    queryKey: queryKeys.inventoryAutocomplete(homeId ?? '', trimmedSearch),
    queryFn: () => getInventoryAutocomplete(homeId!, trimmedSearch),
    enabled: Boolean(homeId && trimmedSearch),
    placeholderData: (previous) => previous,
  });
}

export type NewInventoryItem = {
  name: string;
  quantity?: number;
  category?: string;
  minQuantity?: number;
  price?: number;
  roomId?: Id;
};

export function toCreateInventoryRequest({ name, quantity = 1, category, minQuantity = 1, price, roomId }: NewInventoryItem): CreateInventoryRequest {
  return {
    name,
    quantity,
    minQuantity,
    ...(category ? { category } : {}),
    ...(price !== undefined ? { price } : {}),
    ...(roomId ? { roomId } : {}),
  };
}

export function useCreateInventoryItems() {
  const mutation = useOfflineMutation(createInventoryItemMutation);
  return {
    ...mutation,
    mutate: (items: NewInventoryItem[]) =>
      items.forEach((item) => mutation.mutate({ tempId: createTempId(), request: toCreateInventoryRequest(item) })),
  };
}

export type InventoryItemUpdates = Partial<Pick<InventoryItem, 'name' | 'quantity' | 'belowPar' | 'price' | 'link' | 'category' | 'trackingMode' | 'level' | 'stores'>> & {
  notes?: string[];
};

function toUpdateInventoryRequest(updates: InventoryItemUpdates): UpdateInventoryRequest {
  const { name, quantity, belowPar, price, category, level, stores, notes, link, trackingMode } = updates;

  return {
    ...(name !== undefined ? { name } : {}),
    ...(quantity !== undefined ? { quantity } : {}),
    ...(belowPar !== undefined ? { minQuantity: belowPar } : {}),
    ...(price !== undefined ? { price } : {}),
    ...(category !== undefined ? { category } : {}),
    ...(level !== undefined ? { status: levelToStatus(level) } : {}),
    ...(stores !== undefined ? { stores } : {}),
    ...(notes !== undefined ? { notes: joinNotes(notes) } : {}),
    ...(link !== undefined ? { link } : {}),
    ...(trackingMode !== undefined ? { trackingMode: toTrackingModeValue(trackingMode) } : {}),
  };
}

/** Saves item changes; the list updates immediately and the server when online. */
export function useUpdateInventoryItem() {
  const mutation = useOfflineMutation(updateInventoryItemMutation);
  return {
    ...mutation,
    mutate: ({ itemId, updates }: { itemId: Id; updates: InventoryItemUpdates }) =>
      mutation.mutate({ itemId, request: toUpdateInventoryRequest(updates) }),
  };
}

export function useDeleteInventoryItem() {
  const mutation = useOfflineMutation(deleteInventoryItemMutation);
  return { ...mutation, mutate: (itemId: Id) => mutation.mutate({ itemId }) };
}
