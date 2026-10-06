import type { QueryClient } from '@tanstack/react-query';

import type {
  AddShoppingItemRequest,
  ApiShoppingItem,
  ApiShoppingMode,
  ApiShoppingTrip,
  CreateShoppingTripRequest,
  Id,
  ShoppingTripStatus,
} from '@/lib/api-types';
import { nowIso, updateQuery } from '@/lib/offline/cache';
import { resolveId } from '@/lib/offline/temp-ids';
import { defineOfflineMutation } from '@/lib/offline/offline-mutation';
import { queryKeys } from '@/lib/query-keys';
import {
  addShoppingItems,
  completeShoppingTrip,
  createShoppingTrip,
  pauseShoppingTrip,
  setShoppingItemChecked,
  startShoppingTrip,
} from '@/shopping/api/shopping-api';

function updateTrip(queryClient: QueryClient, homeId: Id, tripId: Id, update: (trip: ApiShoppingTrip) => ApiShoppingTrip) {
  updateQuery<ApiShoppingTrip[]>(queryClient, queryKeys.shoppingTrips(homeId), (trips) =>
    trips.map((trip) => (trip.id === tripId ? update(trip) : trip)));
}

export const createShoppingTripMutation = defineOfflineMutation({
  key: 'shopping.trips.create',
  mutationFn: ({ homeId, request }: { homeId: Id; tempId: Id; request: CreateShoppingTripRequest }) =>
    createShoppingTrip(homeId, request),
  optimistic: (queryClient, { homeId, tempId, request }) => {
    const now = nowIso();
    updateQuery<ApiShoppingTrip[]>(queryClient, queryKeys.shoppingTrips(homeId), (trips) => [{
      id: tempId,
      name: request.name,
      description: request.description ?? null,
      runningTotal: 0,
      totalCost: 0,
      budget: request.budget ?? 0,
      startDate: null,
      completedDate: null,
      status: 'NOT_STARTED',
      homeId,
      createdAt: now,
      updatedAt: now,
      items: [],
    }, ...trips]);
  },
  createdIds: (trip, { tempId }) => [[tempId, trip.id]],
});

export const addShoppingItemsMutation = defineOfflineMutation({
  key: 'shopping.items.add',
  mutationFn: ({ homeId, tripId, items }: { homeId: Id; tripId: Id; tempIds: Id[]; items: AddShoppingItemRequest[] }) =>
    addShoppingItems(homeId, tripId, items),
  optimistic: (queryClient, { homeId, tripId, tempIds, items }) =>
    updateTrip(queryClient, homeId, tripId, (trip) => ({
      ...trip,
      items: [...trip.items, ...items.map((item, index): ApiShoppingItem => ({
        id: tempIds[index],
        name: item.name,
        quantity: item.quantity,
        price: item.price ?? 0,
        regularPrice: item.regularPrice ?? null,
        dealType: item.dealType ?? null,
        multiBuyQuantity: item.multiBuyQuantity ?? null,
        multiBuyPrice: item.multiBuyPrice ?? null,
        status: 'PENDING',
      }))],
    })),
  // The response lists the whole trip, so new server items are matched to their temp ids by name.
  createdIds: (state: ApiShoppingMode, { homeId, tripId, tempIds, items }, queryClient) => {
    const cachedTrip = queryClient.getQueryData<ApiShoppingTrip[]>(queryKeys.shoppingTrips(homeId))
      ?.find((trip) => trip.id === tripId || trip.id === resolveId(tripId));
    const knownIds = new Set(cachedTrip?.items.map((item) => item.id) ?? []);
    const newItems = state.items.filter((item) => !knownIds.has(item.id));

    return items.flatMap((item, index) => {
      const matchIndex = newItems.findIndex((candidate) => candidate.name === item.name);
      if (matchIndex === -1) return [];
      const [match] = newItems.splice(matchIndex, 1);
      return [[tempIds[index], match.id] as [string, string]];
    });
  },
});

export const toggleShoppingItemMutation = defineOfflineMutation({
  key: 'shopping.items.check',
  mutationFn: ({ homeId, tripId, itemId, checked }: { homeId: Id; tripId: Id; itemId: Id; checked: boolean }) =>
    setShoppingItemChecked(homeId, tripId, itemId, checked),
  optimistic: (queryClient, { homeId, tripId, itemId, checked }) =>
    updateTrip(queryClient, homeId, tripId, (trip) => ({
      ...trip,
      items: trip.items.map((item) => (item.id === itemId ? { ...item, status: checked ? 'CONFIRMED' : 'PENDING' } : item)),
    })),
});

const setTripStatus = (queryClient: QueryClient, homeId: Id, tripId: Id, status: ShoppingTripStatus) =>
  updateTrip(queryClient, homeId, tripId, (trip) => ({
    ...trip,
    status,
    ...(status === 'ACTIVE' && !trip.startDate ? { startDate: nowIso() } : {}),
    ...(status === 'COMPLETED' ? { completedDate: nowIso() } : {}),
  }));

type TripVariables = { homeId: Id; tripId: Id };

export const startShoppingTripMutation = defineOfflineMutation({
  key: 'shopping.trips.start',
  mutationFn: ({ homeId, tripId }: TripVariables) => startShoppingTrip(homeId, tripId),
  optimistic: (queryClient, { homeId, tripId }) => setTripStatus(queryClient, homeId, tripId, 'ACTIVE'),
});

export const pauseShoppingTripMutation = defineOfflineMutation({
  key: 'shopping.trips.pause',
  mutationFn: ({ homeId, tripId }: TripVariables) => pauseShoppingTrip(homeId, tripId),
  optimistic: (queryClient, { homeId, tripId }) => setTripStatus(queryClient, homeId, tripId, 'PAUSED'),
});

export const completeShoppingTripMutation = defineOfflineMutation({
  key: 'shopping.trips.complete',
  mutationFn: ({ homeId, tripId }: TripVariables) => completeShoppingTrip(homeId, tripId),
  optimistic: (queryClient, { homeId, tripId }) => setTripStatus(queryClient, homeId, tripId, 'COMPLETED'),
});
