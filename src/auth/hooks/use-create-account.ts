import { useMutation } from '@tanstack/react-query';

import { createAccount, type CreateAccountRequest } from '@/auth/api/authApi';
import { saveSecureValue } from '@/lib/secure-storage';
import { useAppStore } from '@/store/use-app-store';

export function useCreateAccount() {
  const markLoggedIn = useAppStore((state) => state.signIn);

  return useMutation({
    mutationFn: (request: CreateAccountRequest) => createAccount(request),
    onSuccess: async (response) => {
      await saveSecureValue('auth-token', response.token);
      markLoggedIn();
    },
  });
}
