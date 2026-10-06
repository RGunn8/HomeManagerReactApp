import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createHome, getHomeMembers, getHomes, inviteHomeMember, removeHomeMember } from '@/home/api/home-api';
import type { Id } from '@/lib/api-types';
import { queryKeys } from '@/lib/query-keys';
import { useAppStore } from '@/store/use-app-store';

export function useHomes() {
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);

  return useQuery({
    queryKey: queryKeys.homes,
    queryFn: getHomes,
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 10,
  });
}

/** The home every other query is scoped to. Users currently have a single home. */
export function useHomeId(): Id | undefined {
  return useHomes().data?.[0]?.id;
}

export function useHomeMembers() {
  const homeId = useHomeId();

  return useQuery({
    queryKey: queryKeys.members(homeId ?? ''),
    queryFn: () => getHomeMembers(homeId!),
    enabled: Boolean(homeId),
  });
}

/**
 * A mutation scoped to the current home. Most writes affect several screens (a task changes room
 * counts, the today summary and project progress), so every home query is refetched afterwards.
 */
export function useHomeMutation<TVariables = void, TData = unknown>(
  mutationFn: (homeId: Id, variables: TVariables) => Promise<TData>,
) {
  const homeId = useHomeId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TVariables) => {
      if (!homeId) {
        return Promise.reject(new Error('No home is selected yet.'));
      }
      return mutationFn(homeId, variables);
    },
    onSettled: () => (homeId ? queryClient.invalidateQueries({ queryKey: queryKeys.home(homeId) }) : undefined),
  });
}

export function useCreateHome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHome,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.homes }),
  });
}

export function useInviteHomeMember() {
  return useHomeMutation((homeId, email: string) => inviteHomeMember(homeId, email));
}

export function useRemoveHomeMember() {
  return useHomeMutation((homeId, memberId: string) => removeHomeMember(homeId, memberId));
}
