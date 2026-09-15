import { useMutation } from '@tanstack/react-query';

import { signIn, type SignInRequest } from '@/auth/api/authApi';
import { saveSecureValue } from '@/lib/secure-storage';
import { useAppStore } from '@/store/use-app-store';

export function useSignIn() {
  const markLoggedIn = useAppStore((state) => state.signIn);

  return useMutation({
    mutationFn: (request: SignInRequest) => signIn(request),
    onSuccess: async (response) => {
      await saveSecureValue('auth-token', response.token);
      markLoggedIn();
    },
  });
}
