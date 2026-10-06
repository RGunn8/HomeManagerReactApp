import { useMutation, useQueryClient } from '@tanstack/react-query';

import { saveAuthToken } from '@/auth/auth-token';
import { createAccount, type CreateAccountRequest } from '@/auth/api/authApi';
import { useAppStore } from '@/store/use-app-store';

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const markLoggedIn = useAppStore((state) => state.signIn);
  const startOnboarding = useAppStore((state) => state.startOnboarding);

  return useMutation({
    mutationFn: (request: CreateAccountRequest) => createAccount(request),
    onSuccess: async (response) => {
      await saveAuthToken(response.accessToken);
      queryClient.clear();
      startOnboarding();
      markLoggedIn();
    },
  });
}
