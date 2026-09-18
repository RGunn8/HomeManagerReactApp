import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { AccountActionButton } from './components/AccountActionButton';

import { useSignIn } from '@/auth/hooks/use-sign-in';
import { HomeManagerIcon } from '@/components/icons';
import { router } from "expo-router";

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signInMutation = useSignIn();

  const AccountActionProps = {
    onClick: handleSignIn,
    label: 'Sign in',
    pendinglabel: 'Signing in...',
    pending: signInMutation.isPending,
    disabled: signInMutation.isPending,
  };

  function handleSignIn() {
    signInMutation.mutate({ email, password });
  }

  function handleForgotPassword() {
    // TODO: Navigate to forgot password when that screen exists.
  }

  function handleCreateAccount() {
    router.push('/create-account');
  }

  return (
    <View className="flex-1 justify-center bg-forest-deep px-[26px]">
      <HomeManagerIcon variant="auth" />

      <Text className="mt-[34px] font-serif-semibold text-[36px] leading-[39px] tracking-[-1.08px] text-cream">
        Everything the house needs, in one place.
      </Text>
      <Text className="mt-3 text-[15.5px] leading-[23px] text-cream/70">
        Tasks, rooms, inventory and shopping — shared with whoever lives there.
      </Text>


      <View className="mt-[38px] gap-3">
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          className="h-[54px] w-full rounded-input border border-cream/20 bg-cream/10 px-[18px] text-base text-cream"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="rgba(244,239,228,0.55)"
          textContentType="emailAddress"
          value={email}
        />

        <TextInput
          autoCapitalize="none"
          autoComplete="password"
          className="h-[54px] w-full rounded-input border border-cream/20 bg-cream/10 px-[18px] text-base text-cream"
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="rgba(244,239,228,0.55)"
          secureTextEntry
          textContentType="password"
          value={password}
        />
      </View>

      {signInMutation.error && (
        <Text className="mt-4 rounded-xl border border-clay-light/50 bg-clay/20 px-4 py-3 text-[14.5px] leading-5 text-error-tint">
          That email and password don&apos;t match.
        </Text>
      )}

      <Pressable accessibilityRole="button" className="h-[54px] items-center justify-center" onPress={handleForgotPassword}>
        <Text className="font-sans text-[14.5px] text-cream/70">Forgot password?</Text>
      </Pressable>

      <AccountActionButton {...AccountActionProps} />


      <Pressable accessibilityRole="button" onPress={handleCreateAccount}>
        <Text className="mt-[30px] text-center text-[14.5px] leading-[23px] text-cream/70">
          New here? <Text className="font-sans-semibold text-clay-light">Create a home</Text>
        </Text>
      </Pressable>
    </View>
  );
}
