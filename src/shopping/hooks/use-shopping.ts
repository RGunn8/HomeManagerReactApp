import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useHomeId } from '@/home/hooks/use-home';
import type { Id } from '@/lib/api-types';
import { useOfflineMutation } from '@/lib/offline/offline-mutation';
import { createTempId } from '@/lib/offline/temp-ids';
import { queryKeys } from '@/lib/query-keys';
import { getShoppingTrips } from '@/shopping/api/shopping-api';
import {
  addShoppingItemsMutation,
  completeShoppingTripMutation,
  createShoppingTripMutation,
  pauseShoppingTripMutation,
  startShoppingTripMutation,
  toggleShoppingItemMutation,
} from '@/shopping/shopping-mutations';
import { toAddShoppingItemRequest, toShoppingTrip, type NewShoppingItem } from '@/shopping/shopping-model';

export function useShoppingTrips() {
  const homeId = useHomeId();
  const query = useQuery({
    queryKey: queryKeys.shoppingTrips(homeId ?? ''),
    queryFn: () => getShoppingTrips(homeId!),
    enabled: Boolean(homeId),
  });
  const trips = useMemo(() => query.data?.map(toShoppingTrip), [query.data]);

  return { ...query, data: trips };
}

export function useShoppingTrip(tripId: Id | undefined) {
  const query = useShoppingTrips();
  return { ...query, data: query.data?.find((trip) => trip.id === tripId) };
}

export function useAddShoppingItems() {
  const mutation = useOfflineMutation(addShoppingItemsMutation);
  return {
    ...mutation,
    mutate: ({ tripId, items }: { tripId: Id; items: NewShoppingItem[] }) => {
      if (items.length === 0) return;
      mutation.mutate({ tripId, tempIds: items.map(() => createTempId()), items: items.map(toAddShoppingItemRequest) });
    },
  };
}

export type CreateShoppingListInput = {
  title: string;
  budget?: number;
  items: NewShoppingItem[];
};

/** Queues a new trip and its items; returns the trip's temp id. */
export function useCreateShoppingList() {
  const createTrip = useOfflineMutation(createShoppingTripMutation);
  const addItems = useAddShoppingItems();

  return {
    ...createTrip,
    mutate: ({ title, budget, items }: CreateShoppingListInput) => {
      const tripId = createTempId();
      createTrip.mutate({ tempId: tripId, request: { name: title, ...(budget ? { budget } : {}) } });
      addItems.mutate({ tripId, items });
      return tripId;
    },
  };
}

/** Adds items to the in-progress (or next ready) trip, or creates a new list when there is none. */
export function useAddToShoppingList() {
  const { data: trips } = useShoppingTrips();
  const addToTrip = useAddShoppingItems();
  const createList = useCreateShoppingList();

  return {
    mutate: (items: NewShoppingItem[], newListTitle: string) => {
      const destinationTrip = trips?.find((trip) => trip.status === 'active')
        ?? trips?.find((trip) => trip.status === 'ready');

      if (destinationTrip) {
        addToTrip.mutate({ tripId: destinationTrip.id, items });
      } else {
        createList.mutate({ title: newListTitle, items });
      }
    },
  };
}

export function useToggleShoppingItem() {
  return useOfflineMutation(toggleShoppingItemMutation);
}

const useTripAction = (definition: typeof startShoppingTripMutation) => {
  const mutation = useOfflineMutation(definition);
  return { ...mutation, mutate: (tripId: Id) => mutation.mutate({ tripId }) };
};

export const useStartShoppingTrip = () => useTripAction(startShoppingTripMutation);
export const usePauseShoppingTrip = () => useTripAction(pauseShoppingTripMutation);
export const useCompleteShoppingTrip = () => useTripAction(completeShoppingTripMutation);
