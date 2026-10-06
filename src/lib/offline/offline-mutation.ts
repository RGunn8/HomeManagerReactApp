import { useMutation, useMutationState, type QueryClient } from '@tanstack/react-query';

import { useHomeId } from '@/home/hooks/use-home';
import { ApiError } from '@/lib/api-client';
import type { Id } from '@/lib/api-types';
import { queryKeys } from '@/lib/query-keys';
import { recordTempId, resolveTempIds } from '@/lib/offline/temp-ids';

/** Every queued change shares one scope, so they reach the server one at a time, in order. */
export const OFFLINE_SCOPE = 'offline-queue';

type HomeScoped = { homeId: Id };

export type OfflineMutationDefinition<TVariables extends HomeScoped, TData> = {
  /** Stable name; queued changes are saved under it and matched back to this definition after a restart. */
  key: string;
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Applies the change to cached data immediately, whether or not the device is online. */
  optimistic?: (queryClient: QueryClient, variables: TVariables) => void;
  /** For creates: [temp id, real id] pairs to record once the server responds. */
  createdIds?: (data: TData, variables: TVariables, queryClient: QueryClient) => [string, string][];
};

const definitions = new Map<string, OfflineMutationDefinition<any, any>>();

export function defineOfflineMutation<TVariables extends HomeScoped, TData>(
  definition: OfflineMutationDefinition<TVariables, TData>,
) {
  definitions.set(definition.key, definition);
  return definition;
}

// Network failures (fetch rejects with a TypeError) retry until they get through; TanStack pauses
// retries while offline. Server errors retry a few times. Anything else, such as a 4xx, is final,
// so one bad change can't block the queue.
function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiError) return error.status >= 500 && failureCount < 3;
  return error instanceof TypeError;
}

const isQueued = { predicate: (mutation: { options: { scope?: { id: string } } }) => mutation.options.scope?.id === OFFLINE_SCOPE };

/**
 * Registers every offline mutation with the client. Must run before the persisted queue is restored,
 * because restored changes only carry their key and variables.
 */
export function registerOfflineMutations(queryClient: QueryClient) {
  for (const definition of definitions.values()) {
    queryClient.setMutationDefaults([definition.key], {
      mutationFn: (variables: HomeScoped) => definition.mutationFn(resolveTempIds(variables)),
      scope: { id: OFFLINE_SCOPE },
      retry: shouldRetry,
      onMutate: async (variables: HomeScoped) => {
        // Stop in-flight fetches from overwriting the optimistic change with older server data.
        await queryClient.cancelQueries({ queryKey: queryKeys.home(variables.homeId) });
        definition.optimistic?.(queryClient, variables);
      },
      onSuccess: (data: unknown, variables: HomeScoped) => {
        definition.createdIds?.(data, variables, queryClient).forEach(([tempId, realId]) => recordTempId(tempId, realId));
      },
      onSettled: (_data: unknown, _error: unknown, variables: HomeScoped) => {
        // Refetch once the queue drains; refetching earlier would drop changes still waiting to send.
        // A failed change is also undone this way, since the server copy wins.
        if (queryClient.isMutating(isQueued) <= 1) {
          return queryClient.invalidateQueries({ queryKey: queryKeys.home(variables.homeId) });
        }
      },
    });
  }
}

/** Runs an offline mutation for the current home. The UI updates at once; the server is updated when online. */
export function useOfflineMutation<TVariables extends HomeScoped, TData>(
  definition: OfflineMutationDefinition<TVariables, TData>,
) {
  const homeId = useHomeId();
  const mutation = useMutation<TData, Error, TVariables>({ mutationKey: [definition.key] });

  return {
    ...mutation,
    mutate: (variables: Omit<TVariables, 'homeId'>) => {
      if (homeId) {
        mutation.mutate({ ...variables, homeId } as TVariables);
      }
    },
  };
}

/** Number of changes waiting to reach the server. */
export function usePendingChangeCount() {
  return useMutationState({ filters: { status: 'pending', ...isQueued } }).length;
}
