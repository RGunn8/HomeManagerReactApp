import { useMutation, useQueryClient } from '@tanstack/react-query';

import { saveAuthToken } from '@/auth/auth-token';
import { demoSignIn, signIn, type SignInRequest } from '@/auth/api/authApi';
import { getHomes } from '@/home/api/home-api';
import type { AuthResponse } from '@/lib/api-types';
import { queryKeys } from '@/lib/query-keys';
import { useAppStore } from '@/store/use-app-store';

/** Stores the token, then sends users without a home to onboarding. */
function useCompleteSignIn() {
  const queryClient = useQueryClient();
  const markLoggedIn = useAppStore((state) => state.signIn);
  const startOnboarding = useAppStore((state) => state.startOnboarding);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  return async (response: AuthResponse) => {
    await saveAuthToken(response.accessToken);
    queryClient.clear();
    const homes = await queryClient.fetchQuery({ queryKey: queryKeys.homes, queryFn: getHomes });

    if (homes.length > 0) {
      completeOnboarding();
    } else {
      startOnboarding();
    }
    markLoggedIn();
  };
}

export function useSignIn() {
  const completeSignIn = useCompleteSignIn();

  return useMutation({
    mutationFn: (request: SignInRequest) => signIn(request),
    onSuccess: completeSignIn,
  });
}

export function useDemoSignIn() {
  const completeSignIn = useCompleteSignIn();

  return useMutation({
    mutationFn: demoSignIn,
    onSuccess: completeSignIn,
  });
}
