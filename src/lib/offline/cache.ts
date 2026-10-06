import type { QueryClient, QueryKey } from '@tanstack/react-query';

/** Updates cached data in place; does nothing if that query hasn't been loaded. */
export function updateQuery<T>(queryClient: QueryClient, queryKey: QueryKey, update: (data: T) => T) {
  queryClient.setQueryData<T>(queryKey, (data) => (data === undefined ? data : update(data)));
}

export const nowIso = () => new Date().toISOString();
